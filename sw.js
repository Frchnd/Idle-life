const CACHE='hidup-vs-g-v1';
const ASSETS=[
  './','./index.html','./styles/app.css','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './src/app.js','./src/core/state.js','./src/core/save.js','./src/core/time.js','./src/core/effects.js','./src/core/economy.js',
  './src/data/jobs.js','./src/data/activities.js','./src/data/events.js','./src/data/opportunities.js','./src/ui/render.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{
    const copy=resp.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return resp;
  }).catch(()=>caches.match('./index.html'))));
});
