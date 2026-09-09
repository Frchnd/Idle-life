# Hidup — Vertical Slice Build I

Build I memperdalam konsekuensi hidup tanpa menambah tab baru.

## Perubahan utama

- Save Build F–H tetap dipakai dan dimigrasikan otomatis ke versi 5.
- Sistem **tempat tinggal**: mulai bersama keluarga, lalu bisa memilih menyewa kamar sendiri.
- Tinggal bersama keluarga lebih murah (Rp600rb/bulan); kamar sewa sendiri lebih mahal (Rp1,1jt/bulan) tetapi membuat belajar dan istirahat lebih efektif.
- Jika cashflow tinggal sendiri terlalu berat, pemain bisa kembali ke keluarga tanpa reset progres.
- Relationship milestone tidak lagi bisa dicapai hanya dengan grinding: keluarga dan Rian punya kejadian penting yang membutuhkan waktu nyata.
- Membantu keluarga pada momen penting dapat mengurangi biaya awal saat pindah.
- Mendapat kepercayaan Rian meningkatkan nilai beberapa pekerjaan sampingan yang datang melalui jaringannya.
- Keputusan trajectory baru setelah pekerjaan utama dan side income sama-sama terbukti:
  - **Fokus karier utama** → progres karier lebih cepat saat bekerja.
  - **Bangun jalur mandiri** → side income +15% dan peluang berulang lebih cepat, tetapi pekerjaan utama sedikit lebih melelahkan.
- Biaya hidup mengikuti tempat tinggal secara dinamis.
- UI tetap hanya **HIDUP / DUNIA / KAMU**.
- Cache service worker diperbarui untuk Build I.

## Deploy GitHub Pages

Ganti isi root repo dengan isi folder/ZIP Build I, commit, lalu push. Setelah deploy, tutup dan buka ulang PWA atau refresh agar service worker Build I mengambil cache terbaru.
