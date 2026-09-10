# Hidup — Build V

Build V adalah **Visual Presentation Overhaul v1**. Engine dan Content Framework tetap dipertahankan, tetapi layer presentasi dirombak supaya game tidak terasa seperti text game penuh.

## Fokus Build V

- Hero scene visual tetap di layar HIDUP.
- Scene berubah sesuai kondisi Fernando: rumah, bengkel, toko, Nusa Komputer, atau usaha sendiri.
- Pencahayaan scene mengikuti waktu game: pagi, siang, sore, malam.
- Ambient motion ringan; bisa dimatikan lewat Pengaturan.
- Action dock dengan ikon menggantikan daftar tombol teks panjang.
- Opportunity cards menjadi horizontal visual track.
- Event penting muncul sebagai overlay/sheet yang mengambil fokus.
- Main Menu dan Settings memakai layout visual baru.
- DUNIA memakai city pulse visualization dan kartu NPC/perusahaan lebih visual.
- KAMU memakai profile hero, skill rings, dan identity strip.
- Prolog 2 beat muncul setiap kali pemain sengaja memulai Hidup Baru.
- Continue save lama tidak memunculkan prolog.

## Prolog

1. Fernando berumur 18 tahun, tinggal bersama keluarga, punya sedikit tabungan, belum punya pekerjaan tetap, dan arah hidup masih terbuka.
2. Pemain membangun hidup lewat waktu, kerja, belajar, hubungan, peluang, dan usaha. Dunia bergerak sendiri dan tidak ada satu ending terbaik.

## Save

Build U -> Build V otomatis migrasi ke Save Version 18 dengan SAVE_KEY lama tetap dipertahankan.

## Asset visual

`assets/scenes/` berisi SVG scene ringan supaya GitHub Pages/PWA tetap cepat dan offline-friendly. Ini adalah art direction pass pertama; aset bisa diganti dengan ilustrasi final tanpa mengubah simulation engine.
