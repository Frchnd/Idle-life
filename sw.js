const CACHE='hidup-build-ap-aq-v38';
const ASSETS=[
  './','./index.html','./manifest.webmanifest','./styles/main.css',
  './icon-192.png','./icon-512.png',
  './assets/scenes/home.webp','./assets/housing/family_home.webp','./assets/housing/rented_room.webp','./assets/housing/shared_house.webp','./assets/housing/outskirts_room.webp','./assets/scenes/workshop.webp','./assets/scenes/store.webp','./assets/scenes/tech.webp','./assets/scenes/business.webp','./assets/scenes/cafe.webp','./assets/scenes/logistics.webp',
  './assets/ui/sinar_jaya.webp','./assets/ui/serba_ada.webp','./assets/ui/nusa_komputer.webp','./assets/ui/kafe_senja.webp','./assets/ui/lintas_kota.webp',
  './assets/portraits/raka.webp','./assets/portraits/pak_surya.webp','./assets/portraits/mira.webp','./assets/portraits/sari.webp','./assets/portraits/dimas.webp','./assets/portraits/andi.webp','./assets/portraits/bu_lestari.webp',
  './assets/locations/kampus_harapan.webp','./assets/locations/pasar_tradisional.webp','./assets/locations/gym_sehat.webp',
  './src/core/prefs.js','./src/core/time.js','./src/core/state.js','./src/core/effects.js','./src/core/content.js','./src/data/ownership.js','./src/core/ownership.js','./src/core/business.js','./src/core/world.js','./src/data/housing.js','./src/core/housing.js','./src/data/finance.js','./src/data/assets.js','./src/core/finance.js','./src/core/assets.js','./src/core/health.js','./src/core/life-phases.js','./src/core/economy.js','./src/core/education.js','./src/core/social.js','./src/core/storylines.js','./src/core/relationship-stakes.js','./src/core/partnership.js','./src/data/shared-life.js','./src/core/shared-life.js','./src/data/family.js','./src/core/family.js','./src/data/parenting.js','./src/core/parenting.js','./src/data/family-career.js','./src/core/family-career.js','./src/data/schooling.js','./src/core/legacy.js','./src/core/schooling.js','./src/core/city.js','./src/core/save.js','./src/core/outcome.js',
  './src/data/content-foundation.js','./src/data/jobs.js','./src/data/education.js','./src/data/life-phases.js','./src/data/locations.js','./src/data/social.js','./src/data/storylines.js','./src/data/relationship-stakes.js','./src/data/partnership.js','./src/data/content.js','./src/data/content-packs.js','./src/data/activities.js','./src/data/opportunities.js','./src/data/events.js',
  './src/ui/render.js','./src/app.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return resp;}).catch(()=>caches.match('./index.html'))));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
