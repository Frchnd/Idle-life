# Hidup — Build Q

Build Q memulai Fase 4 (Content Framework). Fokus build ini adalah membuat konten baru bisa ditambahkan lewat data, bukan menambah percabangan `if/else` baru ke core game.

## Yang baru

- Save Build P otomatis dimigrasikan ke version 13.
- `src/core/content.js` menambahkan Content Registry terpusat.
- Requirement Engine generik mendukung path state, flag, status, relationship, skill tier, `all`, `any`, dan `not`.
- Effect data bisa memakai effect engine lama plus `path_increment`, `path_set`, dan `relationship_clamped`.
- Aktivitas dasar `Cari Kerja`, `Bantu Keluarga`, `Main dengan Rian`, dan `Cari Peluang Lain` sekarang didefinisikan sebagai data.
- Pelunasan utang keluarga/Rian sekarang memakai definisi opportunity data-driven.
- Event awal `Sudah Terlalu Dipaksakan`, pencarian lowongan, serta hari pertama bengkel/toko dipindahkan ke content catalog.
- Ada validator content registry untuk mendeteksi ID duplikat dan effect type yang tidak dikenal.
- Sistem lama tetap berjalan berdampingan, sehingga migrasi ke framework baru bisa dilakukan bertahap tanpa mematahkan save atau Fase 3.

## Struktur penting

- `src/core/content.js` — registry, requirement engine, content effect executor, validator.
- `src/data/content.js` — contoh konten data-driven yang sudah aktif di gameplay.
- File lama seperti `events.js`, `opportunities.js`, dan `activities.js` masih dipakai untuk konten kompleks yang belum dimigrasikan.

Ini sengaja transisi bertahap. Memaksa seluruh Build P menjadi data-driven dalam satu update akan meningkatkan risiko regresi tanpa manfaat gameplay langsung.

## Deploy

Upload seluruh isi folder ini ke root GitHub Pages, termasuk `src/` dan `styles/`. Setelah deploy, refresh/tutup-buka PWA agar service worker Build Q mengganti cache lama.
