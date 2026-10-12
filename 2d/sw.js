// Death Dungeon classic 2D service worker, scope /2d/. Saves live in localStorage and are never touched.
const CACHE='dd-2d-r20261012153012';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest'])))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('dd-2d-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();if(e.data==='version'&&e.source)e.source.postMessage({version:CACHE})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||!u.pathname.includes('/2d/'))return;
 if(r.mode==='navigate'||u.pathname.endsWith('/2d/')||u.pathname.endsWith('index.html')){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(r).then(x=>x||fetch(r)))});
