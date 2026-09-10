# Hidup — Build X

Build X adalah **UI Stabilization & Responsive Audit** setelah Anime UI Overhaul Build W. Simulation Engine, Content Framework, save, dan seluruh anime image asset dipertahankan.

## Fokus revisi
- CSS Build W yang bertumpuk dibersihkan menjadi satu layout system.
- Kontras dark/light theme diperbaiki; tidak ada lagi panel putih yang mewarisi teks putih dari dark theme.
- Header mobile tidak lagi menyembunyikan nama dan pekerjaan Raka.
- Subtitle action tidak lagi sengaja disembunyikan pada breakpoint mobile.
- Action dock menjadi 2x2 di HP supaya label/hint tetap terbaca; 4 kolom tetap dipakai di layar lebih lebar.
- Opportunity card tidak lagi bergantung pada horizontal clipping; menjadi grid responsif penuh.
- Company/NPC cards, profile cards, metrics, event sheet, menu, settings, dan prologue diberi aturan wrapping/min-width yang aman.
- Hero caption dan HUD diberi ruang terpisah untuk mengurangi overlap.
- Tidak ada reset gameplay.

## Save
Build W -> Build X otomatis migrasi ke Save Version 20. SAVE_KEY lama tetap dipertahankan.

## Deploy
Replace seluruh isi project di GitHub Pages dengan isi folder Build X, termasuk `assets/`, `src/`, dan `styles/`. Lalu hard refresh / tutup-buka PWA supaya cache `hidup-build-x-v1` aktif.
