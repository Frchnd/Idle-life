# Hidup — Build S

Build S menutup **Fase 4 — Content Framework**. Fokusnya adalah membuat konten bisa tumbuh dalam volume besar tanpa mengubah core engine untuk setiap pekerjaan, event, atau opportunity baru.

## Yang baru

- Save Build R otomatis dimigrasikan ke **version 15**.
- Ada **Content Packs** dengan ownership konten yang divalidasi.
- Pack aktif saat ini: `core_life`, `career_core`, `learning_technology`, dan `life_finance`.
- Runtime menyimpan `enabledPacks` + `packVersions`, sehingga ekspansi konten nanti bisa ditambah sebagai pack tanpa branching core.
- Ada **Content Catalog** runtime (`window.__HIDUP_CONTENT_CATALOG__`) dan dokumentasi `CONTENT_CATALOG.md`.
- Event data-driven sekarang memakai **weighted selection** di dalam kelas prioritasnya.
- Randomness memakai **seeded RNG yang disimpan di save**, sehingga urutan bisa direproduksi untuk debugging.
- Ada anti-repeat per event pool melalui `poolRecent` dan `poolHistory`.
- Event urgent/major tetap didahulukan oleh pool priority; weight tidak bisa membuat event ringan menenggelamkan kondisi penting.
- Validator sekarang memeriksa ownership pack, dependency pack, duplicate ownership, weight, template/preset/reference, dan coverage seluruh konten data-driven.
- Requirement preset bertambah menjadi 13, termasuk `relationship_min`, `trajectory_is`, `asset_false`, dan `housing_is`.

## Konten yang dimigrasikan di Build S

Selain konten Build R, sekarang framework data-driven juga menangani:

- `tech_course` — Kelas Komputer Dasar
- `buy_laptop` — pembelian laptop bekas
- `rent_room` — pindah ke kamar sewa dengan deposit dinamis
- `family_milestone` — keputusan hadir untuk keluarga
- `rian_milestone` — trust milestone Rian
- `trajectory_choice` — fokus karier vs jalur mandiri
- `tech_course_offer` — discovery pendidikan Teknologi
- `laptop_offer_data` — discovery investasi laptop

Sistem bisnis/market yang sangat dinamis masih memakai logic khusus. Itu sengaja: abstraction hanya dibuat setelah polanya cukup stabil.

## Struktur penting

- `src/core/content.js` — registry, templates, presets, packs, weighted event picker, catalog, validator.
- `src/data/content-foundation.js` — template/preset/event-pool reusable.
- `src/data/content.js` — konten data-driven.
- `src/data/content-packs.js` — manifest ownership dan dependency pack.
- `CONTENT_CATALOG.md` — panduan authoring dan katalog pack saat ini.

## Debug content

Buka DevTools browser:

```js
window.__HIDUP_CONTENT_REPORT__
window.__HIDUP_CONTENT_CATALOG__
```

Build layak deploy bila `__HIDUP_CONTENT_REPORT__.ok === true`.

## Deploy

Replace seluruh isi repo GitHub Pages dengan isi folder Build S, termasuk `src/` dan `styles/`, lalu commit/push. Setelah Pages selesai update, refresh keras atau tutup-buka PWA agar cache `hidup-build-s-v1` menggantikan Build R.

## Roadmap

Fase 4 selesai setelah Build S. Langkah berikutnya adalah **Fase 4.5 — UI/UX Foundation + Main Menu** sebelum ekspansi konten besar di Fase 5.
