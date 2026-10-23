// Service worker بسيط: يخلي الموقع قابل للتثبيت كتطبيق (من غير كاش للبيانات)
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{});
