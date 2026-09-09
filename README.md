# Hidup — Vertical Slice Build F

Build awal Fase 2 untuk **Hidup**, idle life simulation berbahasa Indonesia.

## Apa yang berubah dari Build E

- Karakter sekarang mulai **menganggur**, bukan otomatis menjadi mekanik.
- Jalur awal mulai bercabang:
  - **Bengkel** → Mekanik → servis privat → promosi.
  - **Toko** → Pramuniaga → perkembangan Sosial.
  - **Belajar Teknologi** → kelas komputer → pekerjaan setup komputer lewat Rian.
- Source code dipecah menjadi `core`, `data`, dan `ui`.
- Save memakai slot/version baru agar perubahan struktur state tidak merusak save Build E.
- PWA, service worker, offline routine, dan install prompt tetap tersedia.

## Struktur

```text
index.html
styles/app.css
src/
  app.js
  core/
    state.js
    save.js
    time.js
    effects.js
  data/
    jobs.js
    activities.js
    events.js
    opportunities.js
  ui/
    render.js
manifest.webmanifest
sw.js
icon-192.png
icon-512.png
```

## Deploy GitHub Pages

Upload **isi folder ini** ke root repository GitHub Pages. Jangan upload folder pembungkusnya sebagai subfolder tambahan.

Setelah commit/push, refresh GitHub Pages. Bila perangkat masih memuat build lama, tutup aplikasi PWA lalu buka kembali; perubahan service worker memakai cache `hidup-vs-f-v1`.

## Checklist playtest Build F

1. Mulai dari kondisi menganggur.
2. Coba `Cari Kerja` dan pastikan peluang kerja muncul.
3. Uji minimal dua save terpisah dengan jalur berbeda:
   - Bengkel.
   - Toko atau Teknologi.
4. Pastikan event penting menghentikan rutinitas/offline progression.
5. Tutup dan buka aplikasi; save harus tetap ada.
6. Coba mode offline setelah rutinitas terbuka.

## Catatan

Ini masih Vertical Slice awal, bukan rilis publik final. Target build ini adalah membuktikan bahwa satu UI sederhana bisa mendukung beberapa jalur hidup yang berbeda.
