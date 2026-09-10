# Hidup — Build T

Build T adalah checkpoint **Fase 4.5 — UI/UX Foundation + Main Menu**.

## Fokus Build T

- Main Menu minimal dengan Continue / Mulai Hidup / Mulai Hidup Baru.
- Snapshot save terakhir di Main Menu.
- Settings foundation yang tersimpan terpisah dari save:
  - Tema Sistem / Terang / Gelap
  - Ukuran teks Normal / Besar
  - Animasi lembut on/off
- Header gameplay dan bottom navigation dipoles tanpa menambah tab baru.
- Event penting mendapat visual focus yang lebih kuat.
- DUNIA dan KAMU dipecah menjadi section yang lebih mudah dipindai.
- Riwayat hidup menjadi panel expandable agar layar tidak terlalu padat.
- Responsive pass untuk mobile dan desktop.
- Save Build S tetap dimigrasikan otomatis ke save version 16.

## Struktur

Project memakai struktur folder normal (`src/`, `styles/`) dan bisa langsung di-host sebagai static site / GitHub Pages.

## Save

Save key lama tetap dipertahankan agar save Build F–S terbawa. Pengaturan aplikasi memakai key terpisah, sehingga Mulai Hidup Baru tidak mereset tema/aksesibilitas.
