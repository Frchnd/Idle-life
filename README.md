# HIDUP — Build AG

Build AG menambahkan **Assets & Ownership**. Barang pribadi sekarang bukan flag pasif: sebagian bisa membuka peluang, mempercepat hidup, aus karena dipakai, rusak, dan membutuhkan uang + waktu untuk dirawat.

## Aset pribadi

- **Laptop Bekas** tetap didapat lewat jalur Teknologi lama, sekarang punya kondisi dan bisa perlu perawatan.
- **Toolkit Mekanik Pribadi** terbuka setelah Mekanik cukup berkembang. Toolkit meningkatkan nilai servis sampingan dan bisa memunculkan `Servis Panggilan`.
- **Meja Belajar Nyaman** meningkatkan efektivitas belajar dan sedikit mengurangi beban sesi belajar.
- **Kasur yang Lebih Nyaman** meningkatkan recovery saat Istirahat tanpa memaksa pemain menaikkan gaya hidup bulanan.
- **Sepeda Bekas** dan **Motor Bekas** yang sudah dimiliki lewat sistem Finance sekarang ikut masuk ke sistem kondisi aset.

## Kondisi & perawatan

Kondisi internal memakai angka untuk simulation, tetapi UI menampilkannya sebagai `Baik`, `Mulai aus`, `Bermasalah`, atau `Rusak`. Kondisi turun saat barang benar-benar dipakai. Barang yang rusak kehilangan manfaat sampai dirawat.

Perawatan membutuhkan uang dan waktu game. Biaya perawatan ikut indeks harga dunia.

## Integrasi sistem

- Toolkit memengaruhi kerja/servis Mekanik dan membuka peluang produktif.
- Laptop memengaruhi kerja lepas Teknologi.
- Sepeda/Motor yang bermasalah tidak lagi memberi penghematan commute penuh.
- Meja belajar dan kasur terhubung langsung ke activity `Belajar` dan `Istirahat`.
- Aset ditampilkan kontekstual di `KAMU`; tidak ada tab Inventory baru.

## Save

Save version **29**. SAVE_KEY lama tetap dipakai sehingga Build AF v28 bermigrasi otomatis tanpa reset progress. Laptop dan kendaraan yang sudah dimiliki otomatis dikonversi ke state aset baru.

## Deploy

Upload seluruh isi folder ke root GitHub Pages, termasuk `src/`, `styles/`, dan `assets/`. Setelah deploy, hard refresh atau tutup-buka PWA agar cache Build AG aktif.

Aplikasi tetap **Rp0 app**: tidak ada paywall, IAP, premium currency, loot box, atau fitur gameplay berbayar.
