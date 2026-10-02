const fs = require('node:fs');
const path = require('node:path');

module.exports = async function checkLoadingChoice(win, artifactDir) {
  const checks = [];
  const choice = await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{
    const start=performance.now(); const poll=()=>{
      const panel=document.getElementById('loading-choice'),countdown=document.getElementById('loading-countdown');
      if(panel&&!panel.hidden&&countdown.textContent.includes('seconds'))resolve({
        buttons:[...panel.querySelectorAll('button')].map(b=>b.id), countdown:countdown.textContent,
        focused:document.activeElement.id, initialized:!!window.__AZHORA__,selected:globalThis.__AZHORA_LOADING_MODE__??null});
      else if(performance.now()-start>5000)reject(new Error('The loading choice did not appear'));
      else setTimeout(poll,25);
    };poll();})`);
  if(choice.buttons.join(',')!=='loading-full,loading-fast'||choice.focused!=='loading-full'||choice.initialized||choice.selected)
    throw new Error('Invalid launch choice: '+JSON.stringify(choice));
  checks.push('Full is the first, focused default; Fast is the second option before world initialization');
  const seconds=Number(/in (\d+) /.exec(choice.countdown)?.[1]);
  if(seconds<8||seconds>10)throw new Error('The full ten-second choice interval was not available: '+choice.countdown);
  checks.push('The visible countdown begins with time remaining from the ten-second interval');
  fs.writeFileSync(path.join(artifactDir,'loading-choice.png'),(await win.webContents.capturePage()).toPNG());
  await win.webContents.executeJavaScript(`document.getElementById('loading-fast').click()`);
  const loaded=await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{
    const start=performance.now();const poll=()=>{
      if(window.__AZHORA__)resolve({mode:window.__AZHORA__.state().loadingMode,choiceHidden:document.getElementById('loading-choice').hidden,
        errors:window.__AZHORA__.state().frameErrors});
      else if(document.getElementById('fatal')?.dataset.stack)reject(new Error(document.getElementById('fatal').dataset.stack));
      else if(performance.now()-start>180000)reject(new Error('Fast selection did not initialize the game'));
      else setTimeout(poll,50);
    };poll();})`);
  if(loaded.mode!=='fast'||!loaded.choiceHidden||loaded.errors.count)throw new Error('Fast selection failed: '+JSON.stringify(loaded));
  checks.push('Selecting Fast starts the experimental world and closes the chooser without frame errors');
  const regional=await win.webContents.executeJavaScript(`(async()=>{
    await Promise.race([window.__AZHORA__.loading.ensure(7),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Peblos construction did not finish')),180000))]);
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    return {loading:window.__AZHORA__.loading.state(),errors:window.__AZHORA__.state().frameErrors};
  })()`);
  if(!regional.loading.ready.includes(7)||regional.errors.count)throw new Error('Deferred native scenery failed: '+JSON.stringify(regional));
  checks.push('The selected Fast launch finishes deferred Peblos scenery without renderer errors');
  return {ok:true,checks,choice,loaded,regional};
};
