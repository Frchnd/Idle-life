# Hidup — Build U

Build U menutup checkpoint **Fase 4.5 — UI/UX Foundation** dengan fokus pada UX operasional dan feedback pemain.

## Fokus Build U

- First-time onboarding 3 langkah yang hanya muncul untuk pemain baru.
- Pemain dengan save Build T atau lebih lama langsung dianggap sudah onboarded.
- Feedback setelah aksi/keputusan tanpa membocorkan angka backend mentah.
- Semantic visual states untuk kondisi positif, waspada, bahaya, dan informasi.
- Empty states yang menjelaskan kapan konten akan muncul.
- Dialog konfirmasi in-game untuk Mulai Hidup Baru.
- Boot/loading placeholder sebelum JavaScript selesai memuat.
- Status offline dan fondasi update PWA dengan tombol Muat ulang ketika service worker baru menunggu.
- Tema, ukuran teks, motion, dan status onboarding tetap tersimpan terpisah dari save game.
- Save Build T dimigrasikan otomatis ke save version 17.

## Struktur

Project tetap memakai struktur folder normal (`src/`, `styles/`) untuk static hosting / GitHub Pages.

## Save

Save key lama dipertahankan agar progres Build F–T terbawa. Mulai Hidup Baru tidak mereset preference aplikasi.
