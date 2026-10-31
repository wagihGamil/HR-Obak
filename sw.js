// Service worker بسيط: يخلي الموقع قابل للتثبيت كتطبيق (من غير كاش للبيانات)
// + كاش لملفات نموذج التعرف على الوجه (face/ و CDN) عشان تتحمل مرة واحدة بس
const FC='face-models-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(e.request.method==='GET'&&(/\/face\/[^/]+$/.test(u)||u.includes('face-api@1.7.13'))){
    e.respondWith(caches.open(FC).then(c=>c.match(e.request).then(h=>h||fetch(e.request).then(r=>{ if(r.ok) c.put(e.request,r.clone()); return r; }))));
  }
});
