# Hidup — Build R

Build R melanjutkan Fase 4 (Content Framework). Fokusnya adalah mengurangi copy-paste saat menambah konten dan membuat kesalahan referensi terdeteksi lebih awal.

## Yang baru

- Save Build Q otomatis dimigrasikan ke version 14.
- Content Registry sekarang juga menyimpan `jobs` dan `eventPools`.
- Ada **Content Template** reusable untuk pekerjaan, aktivitas, opportunity, dan event.
- Semua job prototype sekarang dibuat dari template pekerjaan (`entry_job` / `advanced_job`) tanpa mengubah perilaku gameplay.
- Ada **Requirement Preset** parameterized seperti `unemployed`, `employed`, `job_is`, `job_work_min`, `money_min`, `status_present`, `career_work_min`, dan `skill_min`.
- Event data-driven sekarang punya `pool`, `tags`, `once`, dan dukungan cooldown.
- Pool aktif saat ini: `urgent`, `early_career`, `first_days`, dan `life`.
- Migrated events awal sekarang benar-benar memakai event pool + tags untuk prioritas selection.
- Validator lebih ketat: schema activity/job/event, template reference, event-pool reference, requirement preset parameter, skill reference, choice label, dan effect reference.
- Validator mengembalikan `errors` dan `warnings`, jadi referensi baru yang mungkin valid bisa diperingatkan tanpa selalu memblokir build.

## Kenapa ini penting

Mulai titik ini, menambah pekerjaan baru tidak perlu menyalin struktur penuh:

```js
defineFromTemplate('jobs','entry_job',{
  id:'barista',
  name:'Barista',
  workplace:'Kedai Pagi',
  salary:110000,
  skill:'social'
});
```

Requirement juga bisa tetap terbaca:

```js
requirements:[
  {preset:'job_is',params:{job:'mechanic_junior'}},
  {preset:'job_work_min',params:{job:'mechanic_junior',count:1}}
]
```

Tujuannya bukan sekadar file lebih rapi. Tujuannya supaya Fase 5 nanti bisa menambah banyak career/event tanpa setiap konten baru membutuhkan branching logic baru.

## Struktur baru

- `src/core/content.js` — registry, template engine, preset engine, event-pool selection, validator.
- `src/data/content-foundation.js` — template, preset, dan pool reusable.
- `src/data/jobs.js` — katalog job berbasis template.
- `src/data/content.js` — konten yang sudah dimigrasikan ke framework.

File legacy `events.js`, `opportunities.js`, dan `activities.js` tetap dipakai untuk sistem kompleks yang belum layak dipindahkan sekaligus.

## Deploy

Upload seluruh isi folder ini ke root GitHub Pages, termasuk `src/` dan `styles/`. Setelah deploy, refresh/tutup-buka PWA agar cache Build R mengganti Build Q.
