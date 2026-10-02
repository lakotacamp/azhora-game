const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomBytes}=require('node:crypto');
const MAX_BYTES=128*1024*1024,FORMAT=1;

// Hash the actual inputs, including uncommitted edits. No manual cache-version
// bump is required when a mountain, river, terrain colour or sampling rule changes.
function terrainContentVersion(root){
  const hash=createHash('sha256').update(`azhora-terrain-${FORMAT}`);
  for(const directory of ['src','vendor','assets']){
    function visit(dir){
      for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
        const filename=path.join(dir,entry.name);
        if(entry.isDirectory())visit(filename);
        else if(/\.(js|json)$/.test(entry.name))hash.update(path.relative(root,filename)).update(fs.readFileSync(filename));
      }
    }
    visit(path.join(root,directory));
  }
  return hash.digest('hex');
}
function validRecord(data){
  if(!data||!Array.isArray(data.xs)||!Array.isArray(data.zs)||data.xs.length<2||data.zs.length<2)return false;
  const count=data.xs.length*data.zs.length*3;
  if(count*12>MAX_BYTES||!Number.isSafeInteger(count))return false;
  for(const axis of [data.xs,data.zs])for(let i=0;i<axis.length;i++)if(!Number.isFinite(axis[i])||(i&&axis[i]<=axis[i-1]))return false;
  for(const name of ['positions','colors','normals']){
    if(!(data[name] instanceof Float32Array)||data[name].length!==count)return false;
    for(const number of data[name])if(!Number.isFinite(number))return false;
  }
  return true;
}
function encode(data,version){
  if(!validRecord(data))throw new Error('Invalid terrain cache buffers');
  const payload=Buffer.concat(['positions','colors','normals'].map(name=>Buffer.from(data[name].buffer,data[name].byteOffset,data[name].byteLength)));
  const header=Buffer.from(JSON.stringify({format:FORMAT,version,xs:data.xs,zs:data.zs,digest:createHash('sha256').update(payload).digest('hex')}));
  const prefix=Buffer.alloc(4);prefix.writeUInt32LE(header.length);
  return Buffer.concat([prefix,header,payload]);
}
function decode(bytes,version){
  if(bytes.length<4||bytes.length>MAX_BYTES)return null;
  const length=bytes.readUInt32LE(0);if(length>1024*1024||length+4>bytes.length)return null;
  const header=JSON.parse(bytes.subarray(4,4+length).toString('utf8'));
  if(header.format!==FORMAT||header.version!==version||!Array.isArray(header.xs)||!Array.isArray(header.zs))return null;
  const count=header.xs.length*header.zs.length*3,payload=bytes.subarray(4+length);
  if(payload.length!==count*12||createHash('sha256').update(payload).digest('hex')!==header.digest)return null;
  const data={xs:header.xs,zs:header.zs};
  for(const [i,name]of ['positions','colors','normals'].entries()){
    // A JSON header need not end on a float boundary. Slice into aligned owned storage.
    const part=payload.subarray(i*count*4,(i+1)*count*4);data[name]=new Float32Array(part.buffer.slice(part.byteOffset,part.byteOffset+part.byteLength));
  }
  return validRecord(data)?data:null;
}
function createTerrainCache({directory,version,memoryOnly=false}){
  const filename=path.join(directory,'terrain-v1.bin');let memory=null;
  return {
    async read(){
      try{if(memoryOnly)return memory?decode(memory,version):null;
        if((await fs.promises.stat(filename)).size>MAX_BYTES)return null;
        return decode(await fs.promises.readFile(filename),version);
      }catch{return null;}
    },
    async write(data){
      let temporary;
      try{const bytes=encode(data,version);if(bytes.length>MAX_BYTES)return false;
        if(memoryOnly){memory=bytes;return true;}
        await fs.promises.mkdir(directory,{recursive:true});
        temporary=path.join(directory,`terrain-${randomBytes(8).toString('hex')}.tmp`);
        await fs.promises.writeFile(temporary,bytes);await fs.promises.rename(temporary,filename);return true;
      }catch{return false;}
      finally{if(temporary)await fs.promises.unlink(temporary).catch(()=>{});}
    },
  };
}
// Recheck on renderer reload as well as application restart. A renderer that
// finished old geometry after source edits cannot write it under the new key.
function createTerrainCacheBridge({root,directory,memoryOnly=false}){
  let version=null,store=null;
  function current(){
    const next=terrainContentVersion(root);
    if(next!==version){version=next;store=createTerrainCache({directory,version,memoryOnly});}
    return {version,store};
  }
  return {
    async read(){try{const active=current();return {version:active.version,entry:await active.store.read()};}catch{return {version:null,entry:null};}},
    async write(request){try{const active=current();return request?.version===active.version?active.store.write(request.entry):false;}catch{return false;}},
  };
}
module.exports={createTerrainCache,createTerrainCacheBridge,terrainContentVersion,validRecord};
