// Death Dungeon 3D (beta) service worker, scope /3d/. Saves live in localStorage and are never touched here.
const VERSION='3d-20261012135524';const CACHE='iky-blue-3d-'+VERSION;
const SHELL=['./','./index.html','./r3.js','./three.module.js','./manifest.webmanifest','../icons/icon-192.png','../icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('iky-blue-3d-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();if(e.data==='version'&&e.source)e.source.postMessage({version:VERSION})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 const isDoc=r.mode==='navigate'||u.pathname.endsWith('/3d/')||u.pathname.endsWith('/3d/index.html');
 if(isDoc){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});
