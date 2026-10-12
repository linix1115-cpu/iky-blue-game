const puppeteer=require('/tmp/pp/node_modules/puppeteer-core');const URL=process.argv[2]||'http://localhost:8765/3d/';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.setViewport({width:1280,height:720});await p.goto(URL);await new Promise(r=>setTimeout(r,1500));
await p.evaluate(async()=>{localStorage.clear();for(let i=0;i<80&&state!='play';i++){if(state=='skills')canonPreset();press('Enter');await new Promise(r=>setTimeout(r,60))}});
for(const [nm,fn] of [['inv',"press('KeyI')"],['play',"press('KeyI')"],['pause',"openPause()"],['play2',"state='play'"],['floor4',"G.floor=3;genFloor();G.p.x=G.bed.x;G.p.y=G.bed.y+40"],['floor7',"G.floor=6;genFloor()"],['bath',"state='bath'"],['play3',"state='play'"]]){
 await p.evaluate(fn);await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:`/workspace/iky-dungeon/shots/3d_port_state_${nm}.png`});
 console.log(nm,await p.evaluate(()=>state+' r3 '+document.getElementById('r3c').style.display+' frames '+R3.frames+' walls '+R3.stats.walls))}
console.log('errors',errs);await b.close()})();
