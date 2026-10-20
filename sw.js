/* Service worker de Sombra Dorada: cachea el juego para jugar sin conexión.
   Sube la versión de CACHE cada vez que publiques una actualización del juego. */
const CACHE='sombra-dorada-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){ // juego: red primero (siempre la última versión), caché si no hay conexión
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else if(u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('gstatic.com')){ // fuentes: caché y actualiza en segundo plano
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{c.put(r,res.clone());return res;}).catch(()=>m);return m||f;})));
  }
});
