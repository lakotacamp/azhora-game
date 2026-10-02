const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createTerrainCache,createTerrainCacheBridge,terrainContentVersion}=require('../scripts/terrain-cache.cjs');
const sample=()=>({xs:[1,3],zs:[2,4],positions:new Float32Array([1,5,2,3,6,2,1,7,4,3,8,4]),colors:new Float32Array(12).fill(.4),normals:new Float32Array(12).fill(.3)});
test('terrain cache round trips exact floats across independent store instances and rejects stale content',async()=>{
  const directory=fs.mkdtempSync(path.join(__dirname,'terrain-cache-test-'));
  try{const data=sample();assert.equal(await createTerrainCache({directory,version:'first'}).write(data),true);
    assert.deepEqual(await createTerrainCache({directory,version:'first'}).read(),data);
    assert.equal(await createTerrainCache({directory,version:'next'}).read(),null);
    const file=path.join(directory,'terrain-v1.bin'),bytes=fs.readFileSync(file);bytes[bytes.length-1]^=1;fs.writeFileSync(file,bytes);
    assert.equal(await createTerrainCache({directory,version:'first'}).read(),null,'corrupt cache falls back to generation');
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('terrain cache refuses malformed, nonfinite or wrong-sized buffers without losing a good entry',async()=>{
  const cache=createTerrainCache({directory:__dirname,version:'test',memoryOnly:true}),good=sample();
  assert.equal(await cache.write(good),true);
  for(const bad of [{...sample(),xs:[3,1]},{...sample(),normals:new Float32Array(3)},{...sample(),colors:Array(12).fill(1)},{...sample(),positions:new Float32Array(12).fill(NaN)}])assert.equal(await cache.write(bad),false);
  assert.deepEqual(await cache.read(),good);
});
test('content fingerprint changes for actual terrain sources and atlas inputs',()=>{
  const directory=fs.mkdtempSync(path.join(__dirname,'terrain-version-test-'));
  try{for(const name of ['src','vendor','assets'])fs.mkdirSync(path.join(directory,name));
    const source=path.join(directory,'src','ground.js'),atlas=path.join(directory,'assets','map.json');
    fs.writeFileSync(source,'export const height=1;');fs.writeFileSync(atlas,'{}');const first=terrainContentVersion(directory);
    assert.equal(terrainContentVersion(directory),first);
    fs.writeFileSync(source,'export const height=2;');const second=terrainContentVersion(directory);assert.notEqual(second,first);
    fs.writeFileSync(atlas,'{"river":true}');assert.notEqual(terrainContentVersion(directory),second);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('an existing cache bridge survives same-content reloads and rejects stale renderer writes after edits',async()=>{
  const root=fs.mkdtempSync(path.join(__dirname,'terrain-bridge-test-'));
  try{for(const name of ['src','vendor','assets'])fs.mkdirSync(path.join(root,name));
    const source=path.join(root,'src','ground.js');fs.writeFileSync(source,'export const height=1;');
    const bridge=createTerrainCacheBridge({root,directory:path.join(root,'cache'),memoryOnly:true}),good=sample();
    const first=await bridge.read();assert.equal(first.entry,null);
    assert.equal(await bridge.write({version:first.version,entry:good}),true);
    assert.deepEqual(await bridge.read(),{version:first.version,entry:good},'same-version renderer reload keeps its memory entry');
    fs.writeFileSync(source,'export const height=2;');
    const reloaded=await bridge.read();assert.notEqual(reloaded.version,first.version);
    assert.equal(reloaded.entry,null,'the existing bridge invalidates its old store on renderer reload');
    assert.equal(await bridge.write({version:first.version,entry:good}),false,'an old renderer cannot publish under the new content version');
    assert.equal((await bridge.read()).entry,null,'a rejected stale write leaves the new store empty');
    const current=sample();current.positions[1]=19;
    assert.equal(await bridge.write({version:reloaded.version,entry:current}),true);
    assert.deepEqual(await bridge.read(),{version:reloaded.version,entry:current});
    fs.writeFileSync(source,'export const height=3;');
    assert.equal(await bridge.write({version:reloaded.version,entry:good}),false,'write rechecks source content even before another read');
    const edited=await bridge.read();assert.notEqual(edited.version,reloaded.version);assert.equal(edited.entry,null);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
