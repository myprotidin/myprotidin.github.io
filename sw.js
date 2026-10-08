const CACHE = 'protidin-v3';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(['./','manifest.webmanifest','icon-192.png','icon-512.png'].map(u=>c.add(u).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const okHost = url.origin === location.origin || ['fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com'].includes(url.hostname);
  if(!okHost) return;
  if(req.mode === 'navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{ const cp = r.clone(); caches.open(CACHE).then(c=>c.put(req, cp)); return r; })
      .catch(()=>caches.match(req).then(r=>r||caches.match('./')).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net = fetch(req).then(r=>{ if(r && (r.ok || r.type==='opaque')){ const cp = r.clone(); caches.open(CACHE).then(c=>c.put(req, cp)); } return r; }).catch(()=>hit);
    return hit || net;
  }));
});
