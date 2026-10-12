// Death Dungeon root service worker (3D main app). Saves live in localStorage and are never touched.
const VERSION='r20261012154911';const CACHE='dd-root-'+VERSION;
const SHELL=['./','./index.html','./manifest.webmanifest','./3d/r3.js','./3d/three.module.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('dd-root-')&&k!==CACHE)||/^iky-blue-v/.test(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();if(e.data==='version'&&e.source)e.source.postMessage({version:VERSION})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 const p=u.pathname;if(p.includes('/2d/'))return;if(p.includes('/3d/')&&!/\/3d\/(r3|three\.module)\.js$/.test(p))return;
 const isDoc=r.mode==='navigate'||p.endsWith('/')||p.endsWith('/index.html');
 if(isDoc){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});
