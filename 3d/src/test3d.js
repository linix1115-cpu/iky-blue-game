// 3D port harness: drives the real game in headless Chrome (title -> play, Auto Play), checks R3 renders the world, no JS errors, screenshots.
const puppeteer=require('/tmp/pp/node_modules/puppeteer-core');
const URL=process.argv[2]||'http://localhost:8765/3d/';const SEC=+(process.argv[3]||20);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
let fail=0;
for(const [n,vp] of [['desktop',{width:1280,height:720}],['mobile',{width:800,height:360,isMobile:true,hasTouch:true,deviceScaleFactor:2}]]){
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()=='error'&&!/favicon|404/.test(m.text()))errs.push(m.text())});
 await p.setViewport(vp);await p.goto(URL,{waitUntil:'load'});await new Promise(r=>setTimeout(r,1500));
 await p.evaluate(()=>localStorage.clear());await p.reload({waitUntil:'load'});await new Promise(r=>setTimeout(r,1500));
 await p.screenshot({path:`/workspace/iky-dungeon/shots/3d_port_title_${n}.png`});
 const st=await p.evaluate(async()=>{for(let i=0;i<80&&state!='play';i++){if(state=='skills'&&typeof canonPreset=='function')canonPreset();press('Enter');await new Promise(r=>setTimeout(r,60))}return state});
 await p.evaluate(()=>{G.p.set.autoplay=true});
 const shots=[2,SEC/2,SEC];let tt=0;
 for(const s of shots){await new Promise(r=>setTimeout(r,(s-tt)*1000));tt=s;await p.screenshot({path:`/workspace/iky-dungeon/shots/3d_port_${n}_${s}s.png`})}
 const info=await p.evaluate(()=>({state,floor:G.floor,lvl:G.p.lvl,hp:Math.round(G.p.hp),ens:G.ens.length,r3:R3.ok,frames:R3.frames,stats:R3.stats,cv:document.getElementById('r3c').style.display}));
 console.log(n,'start->',st,JSON.stringify(info),errs.slice(0,5));
 if(!info.r3||info.frames<5||errs.length)fail=1;
 await p.close()}
await b.close();process.exit(fail)})();
