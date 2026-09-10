const CACHE='hidup-build-v-v1';
const ASSETS=[
  './','./index.html','./manifest.webmanifest','./styles/main.css',
  './icon-192.png','./icon-512.png',
  './assets/scenes/home.svg','./assets/scenes/workshop.svg','./assets/scenes/store.svg','./assets/scenes/tech.svg','./assets/scenes/business.svg',
  './src/core/prefs.js','./src/core/time.js','./src/core/state.js','./src/core/effects.js','./src/core/content.js','./src/core/business.js','./src/core/world.js','./src/core/economy.js','./src/core/save.js','./src/core/outcome.js',
  './src/data/content-foundation.js','./src/data/jobs.js','./src/data/content.js','./src/data/content-packs.js','./src/data/activities.js','./src/data/opportunities.js','./src/data/events.js',
  './src/ui/render.js','./src/app.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return resp;}).catch(()=>caches.match('./index.html'))));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
