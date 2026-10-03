const {spawn}=require('node:child_process');
const path=require('node:path');
const manifest=require('../tests/test-manifest.json');

// Keep the explicit suite while bypassing cmd.exe's command-length limit.
// Small sequential processes also release world fixtures between batches;
// --test-isolation=none otherwise imports the entire suite before running it.
if(!Array.isArray(manifest)||!manifest.length||new Set(manifest).size!==manifest.length||manifest.some(file=>typeof file!=='string'||!/^tests\/[\w./-]+\.(?:c?js)$/.test(file))){
  throw new Error('Invalid test manifest');
}
const requested=process.argv.slice(2);
if(requested.some(file=>!manifest.includes(file))||new Set(requested).size!==requested.length){
  throw new Error('Requested test files must be unique entries from tests/test-manifest.json');
}
const suite=requested.length?requested:manifest;
// Several renderer tests construct a complete world at module scope. Even 24
// files can retain multiple gigabytes before a batch starts. Isolate each file.
const size=1, total=Math.ceil(suite.length/size);
async function run(){
  let failed=0;
  for(let offset=0;offset<suite.length;offset+=size){
    const files=suite.slice(offset,offset+size), batch=Math.floor(offset/size)+1;
    console.log(`\nTest batch ${batch}/${total}: ${files.length} files (${files[0]} through ${files.at(-1)})`);
    const code=await new Promise(resolve=>{
      const child=spawn(process.execPath,['--test','--test-isolation=none',...files],{
        cwd:path.resolve(__dirname,'..'),stdio:'inherit',shell:false,
      });
      child.once('error',error=>{console.error(error);resolve(1);});
      child.once('exit',(code,signal)=>resolve(code??(signal?1:0)));
    });
    if(code) failed++;
  }
  console.log(`\n${total-failed}/${total} test batches passed (${suite.length} files).`);
  process.exitCode=failed?1:0;
}
run().catch(error=>{console.error(error);process.exitCode=1;});
