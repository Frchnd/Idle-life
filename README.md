# Hidup — Build W

Build W adalah **Anime UI Overhaul**. Simulation Engine dan Content Framework tetap dipertahankan, tetapi presentation layer sekarang menggunakan image-based anime art, palette colorful/playful, workplace thumbnails, portrait character, dan viewport app yang dikunci dari pinch zoom.

## Perubahan utama

- Scene SVG lama tidak lagi dipakai oleh runtime.
- Scene utama menggunakan WebP anime art: rumah/lingkungan, bengkel, toko, teknologi, dan usaha.
- Tempat kerja di layar DUNIA memakai image thumbnail, bukan inisial huruf.
- Profile utama memakai portrait image.
- Event overlay memakai image scene aktif.
- Opportunity card memakai thumbnail visual berdasarkan jenis peluang.
- Karakter utama sekarang bernama **Raka**, nama fiksi. Save lama yang masih memakai nama prototipe otomatis dimigrasikan.
- Tampilan lebih colorful/playful: sky blue, mint, coral, warm yellow, violet, dan cream dengan kontras lembut.
- Viewport dikunci untuk pengalaman aplikasi: pinch zoom, ctrl+wheel zoom, dan shortcut zoom diblokir saat game aktif.
- Bottom navigation tetap HIDUP / DUNIA / KAMU.

## Save

Build V -> Build W otomatis migrasi ke Save Version 19 dengan SAVE_KEY lama tetap dipertahankan. Progress pemain tidak direset.

## Deploy

Upload/replace seluruh isi folder ke root GitHub Pages, termasuk `assets/`, `src/`, dan `styles/`. Setelah deploy, lakukan hard refresh atau tutup-buka PWA agar cache Build W terpasang.
