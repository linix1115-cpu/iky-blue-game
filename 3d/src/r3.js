// Death Dungeon 3D renderer: draws the 2D game's world state (G) with three.js. Game logic/UI stay in the 2D script.
import * as T3 from './three.module.js';
const R3={ok:false,frames:0,used:false,stats:{}};window.R3=R3;
let R,S,cam,hemi,amb,pl,cv,floorMesh,wallMesh,fowTex,fowData,curM=null,mapSum=-1,wallCells=[],cutSt=null,torchL=[],ptsGeo,pts,blobT,glowT,q0=null;
const UNIT=()=>T; // px per tile
const TEX=new Map();
function tex(k){const im=IM[k];if(!im||!im.complete||!im.naturalWidth)return null;let t=TEX.get(k);if(!t){t=new T3.Texture(im);t.colorSpace=T3.SRGBColorSpace;t.anisotropy=4;t.needsUpdate=true;TEX.set(k,t)}return t}
function canvasTex(f,n=64){const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);const t=new T3.CanvasTexture(c);return t}
function col(c){if(!c)return new T3.Color(1,1,1);if(typeof c=='string'&&c.startsWith('rgba(')&&c.endsWith(',')){const m=c.slice(5).split(',');return new T3.Color(m[0]/255,m[1]/255,m[2]/255)}try{return new T3.Color().setStyle(c.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]*\)/,'rgb($1,$2,$3)'))}catch(e){return new T3.Color(1,1,1)}}
function init(){
 cv=document.createElement('canvas');cv.id='r3c';document.body.insertBefore(cv,document.getElementById('c'));
 R=new T3.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'});
 R.outputColorSpace=T3.SRGBColorSpace;R.toneMapping=T3.ACESFilmicToneMapping;R.toneMappingExposure=1.2;
 S=new T3.Scene();S.background=new T3.Color(0x05040a);S.fog=new T3.Fog(0x05040a,22,44);
 cam=new T3.PerspectiveCamera(38,1.5,.5,80);
 hemi=new T3.HemisphereLight(0x8a96c8,0x2a1c14,1.1);amb=new T3.AmbientLight(0x50464a,.7);S.add(hemi,amb);
 pl=new T3.PointLight(0xffe0b8,30,14,1.1);S.add(pl);
 for(let i=0;i<6;i++){const L=new T3.PointLight(0xff8a3a,0,11,1.2);S.add(L);torchL.push(L)}
 blobT=canvasTex((g,n)=>{const gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);gr.addColorStop(0,'rgba(0,0,0,.75)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,n,n)});
 glowT=canvasTex((g,n)=>{const gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);gr.addColorStop(0,'#fff');gr.addColorStop(.25,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,n,n)});
 ptsGeo=new T3.BufferGeometry();const N=1500;ptsGeo.setAttribute('position',new T3.BufferAttribute(new Float32Array(N*3),3));ptsGeo.setAttribute('color',new T3.BufferAttribute(new Float32Array(N*3),3));
 pts=new T3.Points(ptsGeo,new T3.PointsMaterial({size:.16,map:glowT,vertexColors:true,transparent:true,blending:T3.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;S.add(pts);
 R3.ok=true;R3.three=T3;R3.scene=S;R3.cam=cam}
// ---------- fog-of-war aware materials
const FOW={value:null},MAPSZ={value:new T3.Vector2(128,128)};
function fowify(m){m.onBeforeCompile=sh=>{sh.uniforms.fowMap=FOW;sh.uniforms.mapSz=MAPSZ;
 sh.vertexShader='varying vec3 vW3;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\n vW3=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\n vW3=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
 sh.fragmentShader='uniform sampler2D fowMap;uniform vec2 mapSz;varying vec3 vW3;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n float fw=texture2D(fowMap,vW3.xz/mapSz).r; diffuseColor.rgb*=fw;')};return m}
function buildMap(){
 if(floorMesh){S.remove(floorMesh);floorMesh.geometry.dispose()}if(wallMesh){S.remove(wallMesh);wallMesh.geometry.dispose()}
 MAPSZ.value.set(MW,MH);fowData=new Uint8Array(MW*MH*4);fowTex=new T3.DataTexture(fowData,MW,MH,T3.RGBAFormat);fowTex.magFilter=T3.LinearFilter;fowTex.minFilter=T3.LinearFilter;fowTex.flipY=false;fowTex.needsUpdate=true;FOW.value=fowTex;
 const fk='f_'+FIDX[Math.min(G.floor,FIDX.length-1)];const ft=tex(fk)||tex('t_floor');let fm;
 if(ft){const t=ft.clone();t.wrapS=t.wrapT=T3.RepeatWrapping;t.repeat.set(MW/8,MH/8);t.needsUpdate=true;fm=new T3.MeshStandardMaterial({map:t,roughness:.9,metalness:0})}else fm=new T3.MeshStandardMaterial({color:0x333333,roughness:.9});
 const fg=new T3.PlaneGeometry(MW,MH);fg.rotateX(-Math.PI/2);fg.translate(MW/2,0,MH/2);floorMesh=new T3.Mesh(fg,fowify(fm));floorMesh.receiveShadow=true;S.add(floorMesh);
 wallCells=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(!G.m[y][x])continue;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const r=G.m[y+dy];if(r&&r[x+dx]===0)n=1}if(n)wallCells.push([x,y])}
 const wt=tex('t_wall');const wm=fowify(new T3.MeshStandardMaterial(wt?{map:wt,roughness:.95,bumpMap:wt,bumpScale:2}:{color:0x2a2622,roughness:.95}));
 const WH=1.5;const wg=new T3.BoxGeometry(1,WH,1);wg.translate(0,WH/2,0);wallMesh=new T3.InstancedMesh(wg,wm,Math.max(1,wallCells.length));wallMesh.castShadow=wallMesh.receiveShadow=true;
 const m4=new T3.Matrix4();wallCells.forEach(([x,y],i)=>{m4.makeTranslation(x+.5,0,y+.5);wallMesh.setMatrixAt(i,m4)});wallMesh.count=wallCells.length;S.add(wallMesh);cutSt=new Uint8Array(wallCells.length);
 curM=G.m;mapSum=sumMap();R3.stats.walls=wallCells.length}
function sumMap(){let s=0;for(let y=0;y<MH;y++){const r=G.m[y];for(let x=0;x<MW;x++)if(r[x])s=(s+(x*131+y*7919))%1000000007}return s}
function updFow(){const sn=G.seen;if(!sn)return;for(let y=0;y<MH;y++){const r=sn[y];for(let x=0;x<MW;x++){const v=r?r[x]:0,i=(y*MW+x)*4;fowData[i]=v==2?255:v==1?(G.p.ping>0?110:80):0}}fowTex.needsUpdate=true}
const _m4=new T3.Matrix4();
function cutWalls(px,pz){for(let i=0;i<wallCells.length;i++){const [x,y]=wallCells[i];const dz=y+.5-pz,dx=Math.abs(x+.5-px);const c=(dz>0.2&&dz<4.5&&dx<2.2+dz*.25)?1:0;
 if(c!==cutSt[i]){cutSt[i]=c;_m4.makeScale(1,c?.12:1,1).setPosition(x+.5,0,y+.5);wallMesh.setMatrixAt(i,_m4);wallMesh.instanceMatrix.needsUpdate=true}}}
// ---------- billboard sprite pool
const POOL=new Map();let gen=0;
function mkSprite(){const geo=new T3.PlaneGeometry(1,1);geo.translate(0,.5,0);
 const m=new T3.MeshStandardMaterial({alphaTest:.5,side:T3.DoubleSide,roughness:.85,metalness:0,emissive:0x15151f});
 const me=new T3.Mesh(geo,m);me.castShadow=true;me.customDistanceMaterial=new T3.MeshDistanceMaterial({alphaTest:.5});me.customDepthMaterial=new T3.MeshDepthMaterial({alphaTest:.5,depthPacking:T3.RGBADepthPacking});
 const bl=new T3.Mesh(new T3.PlaneGeometry(1,.5),new T3.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false}));bl.rotation.x=-Math.PI/2;bl.position.y=.02;
 const g=new T3.Group();g.add(me,bl);me.rotation.x=-0.5;S.add(g);return {g,me,m,bl,k:null}}
function spr(o,key,hpx,x,y,opt={}){if(!o)return null;let s=POOL.get(o);if(!s){s=mkSprite();POOL.set(o,s)}s.gen=gen;const t=tex(key);if(!t){s.g.visible=false;return s}s.g.visible=true;
 if(s.k!==key){s.k=key;s.m.map=t;s.me.customDistanceMaterial.map=t;s.me.customDepthMaterial.map=t;s.m.needsUpdate=s.me.customDistanceMaterial.needsUpdate=s.me.customDepthMaterial.needsUpdate=true}
 const im=t.image,sz=opt.max?hpx/Math.max(im.naturalWidth,im.naturalHeight):hpx/im.naturalHeight,w=im.naturalWidth*sz/T,h=im.naturalHeight*sz/T;
 s.me.scale.set(w*(opt.flip?-1:1),h,1);s.g.position.set(x/T,opt.lift||0,y/T+.15);s.me.rotation.z=opt.rot||0;
 const a=opt.alpha==null?1:opt.alpha;if((a<1)!==s.m.transparent){s.m.transparent=a<1;s.m.needsUpdate=true}s.m.opacity=a;
 if(opt.self&&s.m.emissiveMap!==t){s.m.emissiveMap=t;s.m.color.setRGB(.2,.2,.2);s.m.needsUpdate=true}s.m.emissive.copy(opt.self?WHITE:(opt.em||DEF_EM));s.m.emissiveIntensity=opt.self?.9:(opt.emI||1);s.bl.visible=GFX.q=='low'||!!opt.blob;s.bl.scale.set(Math.max(.5,w*.8),Math.max(.5,w*.8),1);return s}
const DEF_EM=new T3.Color(0x15151f),WHITE=new T3.Color(1,1,1);
// glow sprites (additive) for shots, spells, items, beams
const GPOOL=[];let gi=0;
function glow(x,y,h,size,c,a=1){let s=GPOOL[gi];if(!s){s=new T3.Sprite(new T3.SpriteMaterial({map:glowT,blending:T3.AdditiveBlending,transparent:true,depthWrite:false}));S.add(s);GPOOL.push(s)}gi++;s.visible=true;s.position.set(x/T,h,y/T);s.scale.set(size,size,1);s.material.color.copy(c.isColor?c:col(c));s.material.opacity=a;return s}
const DPOOL=[];let di=0;// ground discs (zones, rings, pings, traps)
function disc(x,y,r,c,a,ring){let s=DPOOL[di];if(!s){s=new T3.Mesh(new T3.RingGeometry(.0,1,40),new T3.MeshBasicMaterial({transparent:true,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide}));s.rotation.x=-Math.PI/2;S.add(s);DPOOL.push(s)}di++;
 if(s.userData.ring!==ring){s.geometry.dispose();s.geometry=new T3.RingGeometry(ring?.9:0,1,48);s.userData.ring=ring}s.visible=true;s.position.set(x/T,.04+di*.001,y/T);s.scale.setScalar(Math.max(.01,r/T));s.material.color.copy(c.isColor?c:col(c));s.material.opacity=a;return s}
const BPOOL=[];let bi=0;
function beamM(x,y,h,w,c,a){let s=BPOOL[bi];if(!s){s=new T3.Mesh(new T3.CylinderGeometry(.5,.9,1,10,1,true),new T3.MeshBasicMaterial({transparent:true,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide}));S.add(s);BPOOL.push(s)}bi++;s.visible=true;s.position.set(x/T,h/2,y/T);s.scale.set(w,h,w);s.material.color.copy(col(c));s.material.opacity=a;return s}
// ---------- quality
let curQ=null;
function applyQ(){const q=GFX.q;curQ=q;R.shadowMap.enabled=q!='low';R.shadowMap.type=q=='high'?T3.PCFSoftShadowMap:T3.PCFShadowMap;pl.castShadow=q!='low';const ms=q=='high'?1024:512;pl.shadow.mapSize.set(ms,ms);pl.shadow.bias=-.004;pl.shadow.map&&(pl.shadow.map.dispose(),pl.shadow.map=null);
 S.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)}});pts.visible=q!='low'}
function sizeTo(){const C=document.getElementById('c');const r=C.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,GFX.q=='low'?.75:GFX.q=='med'?1.25:2);
 const st=cv.style;if(st.left!=r.left+'px'){st.left=r.left+'px';st.top=r.top+'px'}st.width=r.width+'px';st.height=r.height+'px';
 const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(cv.width!==w||cv.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}}
// ---------- frame
const V=new T3.Vector3();let lastP=null,ikD=0,blD=0,lastB=null;
function dir4(face){const c=Math.cos(face);return Math.abs(c)>.6?(c<0?'l':'r'):Math.sin(face)<0?'u':'d'}
function proj(x,y,h){V.set(x/T,h,y/T).project(cam);return {x:(V.x*.5+.5)*W,y:(-V.y*.5+.5)*H,z:V.z}}
R3.proj=proj;
R3.pre=()=>{R3.used=false};
R3.post=()=>{if(!R3.ok)return;cv.style.display=R3.used?'block':'none'};
R3.frame=function(t,cm,SH){if(!R3.ok)return;R3.used=true;R3.frames++;gen++;gi=0;di=0;bi=0;const p=G.p;
 if(curQ!==GFX.q)applyQ();sizeTo();
 if(G.m!==curM)buildMap();else if(R3.frames%20==0){const s=sumMap();if(s!==mapSum)buildMap()}
 if(R3.frames%6==0||R3.frames<3)updFow();
 const sh=SH>0?(Math.random()-.5)*SH/T*.6:0;const cx=cm.x/T+sh,cz=cm.y/T+sh;
 const view=Math.max(1,W/H);cam.position.set(cx,19,cz+12);cam.lookAt(cx,0,cz-.3);
 cutWalls(p.x/T,p.y/T);
 // lights
 pl.position.set(p.x/T,3.4,p.y/T+.4);pl.intensity=20+Math.sin(t*7)*.5;
 const tl=(G.torch||[]).map(tc=>[tc,(tc.x-p.x)**2+(tc.y-p.y)**2]).sort((a,b)=>a[1]-b[1]);
 torchL.forEach((L,i)=>{const e=tl[i];if(e&&e[1]<(18*T)**2&&G.seen[e[0].y/T|0]&&G.seen[e[0].y/T|0][e[0].x/T|0]){L.position.set(e[0].x/T,1.5,e[0].y/T+.7);L.intensity=16+Math.sin(t*11+i)*1.2+Math.sin(t*23+i*2)*.8}else L.intensity=0});
 const seen=o=>{const r=G.seen[o.y/T|0];return r&&r[o.x/T|0]};const vis=o=>{const r=G.seen[o.y/T|0];return r&&r[o.x/T|0]==2};
 // torches
 for(const tc of G.torch||[])if(seen(tc)){spr(tc,'t_torch',26,tc.x,tc.y+10,{max:1,self:1});glow(tc.x,tc.y,1.1,.7+Math.sin(t*20+tc.x)*.08,'#ffa040',.9)}
 // bed / door / remains / props / events / waypoint
 if(G.bed&&seen(G.bed))spr(G.bed,'o_bed',96,G.bed.x,G.bed.y+40,{max:1});
 if(G.door&&seen(G.door)){spr(G.door,'o_door',46,G.door.x,G.door.y+18,{max:1,alpha:G.bossDead?1:.8,em:G.bossDead?new T3.Color(.35,.28,.1):null});if(G.bossDead)glow(G.door.x,G.door.y,1,2.2,'#ffd36a',.5)}
 for(const q of G.scavP||[])if(seen(q))spr(q,'o_remains',44,q.x,q.y+12,{max:1});
 const psz=typeof PSZ!='undefined'?PSZ:{};
 for(const pr of G.props||[])if(seen(pr)){spr(pr,'o_'+pr.k,psz[pr.k]||40,pr.x,pr.y+14,{max:1});if(pr.k=='crystal')glow(pr.x,pr.y,.6,1.6,'#60a0ff',.5+.15*Math.sin(t*3+pr.x))}
 for(const q of G.ev||[]){if(!seen(q))continue;if(q.k=='chest'||q.k=='mimic'||q.k=='vault'){if(q.used&&q.k=='mimic')continue;spr(q,'t_chest',q.k=='vault'?44:30,q.x,q.y+10,{max:1,alpha:q.used?.6:1});if(!q.used&&q.k=='vault')glow(q.x,q.y,.5,1.3,'#ffcc40',.5)}
  else if(q.k=='shrine'){spr(q,'o_shrine',46,q.x,q.y+12,{max:1,alpha:q.used?.6:1});glow(q.x,q.y,.8,1.8,q.used?'#666':'#ffeaa0',.5)}
  else if(q.k=='npc'&&!q.used){glow(q.x,q.y,.3,1,'#e0c0a0',.4)}}
 if(G.wp&&seen(G.wp)){disc(G.wp.x,G.wp.y,26,G.wp.on?'#78dcff':'#788ca8',.8,false);glow(G.wp.x,G.wp.y,.6,1.6,G.wp.on?'#78dcff':'#8090a0',.6)}
 // items (potions/gold)
 for(const i of G.items||[])if(seen(i)){if(i.k=='gold')glow(i.x,i.y,.25+Math.sin(t*4+i.x)*.05,.45,'#ffd34a',1);else{glow(i.x,i.y,.3+Math.sin(t*4+i.x)*.05,.55,'#ff3030',1)}}
 for(const tr of G.traps||[])disc(tr.x,tr.y,tr.r||20,tr.c||'#f80',.35,true);
 // zones
 for(const z of G.zones||[]){const a=z.k=='met'?.35+.3*Math.sin(t*20):.45;disc(z.x,z.y,z.r,col(z.c),a,false)}
 for(const b of G.bombs||[]){glow(b.x,b.y,.2+(b.z||0)/T,.5,b.k=='fire'?'#ff5530':b.k=='sticky'?'#60ff60':'#ffffff',.9)}
 // enemies
 for(const e of G.ens){const v=Math.hypot(e.x-p.x,e.y-p.y)<230||(p.ping>0&&Math.hypot(e.x-p.x,e.y-p.y)<(G.pingR||0));if(!v)continue;
  const k=e.boss?BIM[G.floor]:(e.mini&&e.ty=='brute'?'b_captain':EIM[e.ty]);const r=e.r,sz=e.boss?r*4.4:e.mini?r*3.6:r*3.1;
  const nf=EFACE[k]!=null?EFACE[k]:-1,flip=!!nf&&((p.x<e.x)!=(nf<0));
  let em=null,emI=1;if(e.flash>0)em=WHITE;else if(e.elite&&e.elite.length){em=col(AFX[e.elite[0]]);emI=.25}else if(e.boss||e.mini){em=col(e.c);emI=.18}
  spr(e,k,sz,e.x,e.y+r*.9,{max:1,flip,em,emI,alpha:e.ty=='wraith'?.8:1,lift:Math.abs(Math.sin(t*6+(e.ph||0)))*.04});
  if(e.boss)glow(e.x,e.y,.3,r/T*4,e.c,.25);if(p.ping>0&&Math.hypot(e.x-p.x,e.y-p.y)>200)disc(e.x,e.y,e.r+6,'#ff5555',.8,true);if(e.elite||e.mini)disc(e.x,e.y,e.r+6,e.mini?'#ff6600':AFX[e.elite[0]],.6,true)}
 // shots
 for(const s of G.shots||[]){glow(s.x,s.y,.7,s.big?1.1:s.f?.45:.7,s.dagger?'#cde':s.c||'#fff',1)}
 // beams (loot rarity)
 for(const b of G.beams||[]){const a=Math.max(0,1-b.t/2.4);beamM(b.x,b.y,3.5+b.tier*1,.25+b.tier*.08,b.c,a*.55)}
 // Blue + Iky
 if(state!='cut'){
  if(p.blue&&G.blueE){const B=G.blueE;if(lastB){blD+=Math.hypot(B.x-lastB.x,B.y-lastB.y)/T}lastB={x:B.x,y:B.y};const d=dir4(B.face!=null?B.face:Math.PI/2);const fr=B.mv?d+((blD/.45|0)%4):d+'i';spr(B,'blue_'+fr,74,B.x,B.y+12,{})}
  if(lastP)ikD+=Math.hypot(p.x-lastP.x,p.y-lastP.y)/T;lastP={x:p.x,y:p.y};
  const row=typeof atkRow=='function'?atkRow():null;let key,hpx=76,flip=false,rot=0;
  if(row){const tot=row=='gun'?.32:(p.atkMax||.2),rem=row=='gun'?p.gunT:p.atkT,u=1-rem/tot,fi=u<.12?0:u<.4?1:u<.7?2:3;key='a_'+row+fi;const im=IM[key];hpx=im&&im.naturalHeight?im.naturalHeight*80/150:76;flip=Math.cos(p.face)<0}
  else{const d=dir4(p.face);key='iky_'+(p.mv?d+((ikD/.45|0)%4):d+'i')}
  if(p.roll>0)rot=(.28-p.roll)*25;
  const blink=p.inv>0&&p.roll<=0?.55+.45*Math.sin(t*40):1;
  spr(p,key,hpx,p.x,p.y+12,{flip,rot,alpha:blink});
  if(p.spin>0)disc(p.x,p.y,60,'#ffffff',.6,true);
  if(p.atgt){const g=p.atgt;disc(g.x,g.y,g.r+10,'#ff4444',.8,true)}
  if(p.ping>0)disc(p.x,p.y,G.pingR||0,'#78c8ff',Math.min(1,p.ping/4),true);
 }
 // particles
 const pa=ptsGeo.attributes.position.array,pc=ptsGeo.attributes.color.array;let n=0;const N=pa.length/3;
 for(const q of G.parts||[]){if(q.txt||q.h)continue;if(q.ring){disc(q.x,q.y,Math.max(1,q.ring*(1-q.t*2)),q.c,Math.min(1,q.t*2),true);continue}if(q.ln){for(let i=0;i<=8&&n<N;i++){const u=i/8;pa[n*3]=(q.x+(q.ln.x-q.x)*u)/T;pa[n*3+1]=.8;pa[n*3+2]=(q.y+(q.ln.y-q.y)*u)/T;const c=col(q.c);pc[n*3]=c.r;pc[n*3+1]=c.g;pc[n*3+2]=c.b;n++}continue}
  if(n>=N)break;pa[n*3]=q.x/T;pa[n*3+1]=.5+(q.z||0)/T;pa[n*3+2]=q.y/T;const c=col(q.c);const a=Math.min(1,q.t*2);pc[n*3]=c.r*a;pc[n*3+1]=c.g*a;pc[n*3+2]=c.b*a;n++}
 ptsGeo.setDrawRange(0,n);ptsGeo.attributes.position.needsUpdate=ptsGeo.attributes.color.needsUpdate=true;
 // cleanup pools
 for(const [o,s] of POOL)if(s.gen!==gen){S.remove(s.g);s.m.dispose();POOL.delete(o)}
 for(let i=gi;i<GPOOL.length;i++)GPOOL[i].visible=false;for(let i=di;i<DPOOL.length;i++)DPOOL[i].visible=false;for(let i=bi;i<BPOOL.length;i++)BPOOL[i].visible=false;
 R.render(S,cam);
 R3.stats.sprites=POOL.size;R3.stats.glows=gi;
 overlay(t,seen)};
// 2D overlay (labels, damage numbers, hp bars, prompts) projected from 3D
function overlay(t,seen){const p=G.p;
 for(const e of G.ens){if(Math.hypot(e.x-p.x,e.y-p.y)>=230)continue;const s=POOL.get(e);if(!s)continue;const h=s.me.scale.y;
  if(e.hp<e.mhp&&!e.boss){const q=proj(e.x,e.y+e.r*.9+.15*T,h+.1);X.fillStyle='#400';X.fillRect(q.x-14,q.y-6,28,4);X.fillStyle='#e33';X.fillRect(q.x-14,q.y-6,28*e.hp/e.mhp,4)}
  const st=e.st||{};const ic=[];if(st.po>0)ic.push(['#7f3','P']);if(st.bu>0)ic.push(['#f73','B']);if(e.slow>0)ic.push(['#8cf','S']);if(st.sn>0)ic.push(['#ff4','!']);
  if(ic.length){const q=proj(e.x,e.y+e.r*.9+.15*T,h+.35);ic.forEach((c,i)=>txt(c[1],q.x-((ic.length-1)*6)+i*12,q.y-8,11,c[0]))}}
 const pr=(o,s,ox=0)=>{if(o&&seen(o)&&Math.hypot(o.x-p.x,o.y-p.y)<60){const q=proj(o.x,o.y,1.6);txt(s,q.x+ox,q.y,13,'#ffd')}};
 if(G.bed)pr(G.bed,'[F] '+(p.blue?'Rest with Blue':'Rest & Save'));for(const q of G.scavP||[])pr(q,'[F] Search remains');
 for(const q of G.ev||[])if(!q.used&&q.k!='ambush')pr(q,'[F] '+({chest:'Open chest',mimic:'Open chest',vault:'Open vault',shrine:'Pray at shrine',npc:'Help the dying summon'}[q.k]||''));
 if(G.door&&G.bossDead&&seen(G.door)){const q=proj(G.door.x,G.door.y,1.8);txt('UP',q.x,q.y,12,'#ffd36a')}
 for(const q of G.parts||[]){if(!q.txt&&!q.h)continue;const s=proj(q.x,q.y,1.2);X.globalAlpha=Math.min(1,q.t*2);if(q.txt)txt(q.txt,s.x,s.y,15,q.c);else heart(s.x,s.y,1,q.t)}X.globalAlpha=1;
 for(const b of G.beams||[]){if(b.t<1.6&&b.n){const s=proj(b.x,b.y,1.4);X.globalAlpha=Math.max(0,1-b.t/1.6);txt(b.n,s.x,s.y,12,b.c);X.globalAlpha=1}}}
function boot(){try{init()}catch(e){console.error('R3 init failed, using 2D',e);R3.ok=false}}
boot();
