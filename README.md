# Hidup — Build AD

## Relationship Stakes

Build AD memperdalam hubungan setelah character storyline. Kedekatan sekarang dapat menciptakan ekspektasi nyata: seseorang bisa meminta Raka membuat janji, dan keputusan untuk menepati, menolak secara jujur, atau mangkir menghasilkan state hubungan yang berbeda.

### Yang baru
- **4 relationship stakes** lanjutan untuk Andi, Bu Lestari, Sari, dan Dimas.
- Hanya satu janji besar aktif pada satu waktu agar UI dan ritme keputusan tetap sederhana.
- Janji memiliki deadline dalam waktu game dan muncul sebagai opportunity khusus.
- Menepati janji meningkatkan kedekatan dan membuka status `bisa saling mengandalkan`.
- Menolak secara jujur tidak menimbulkan `strain`; penalti hubungan kecil atau nol.
- Berjanji lalu melewatkan deadline menurunkan relationship dan menambah **relationship strain**.
- Strain tidak hilang otomatis. Pertemuan berikutnya dapat berubah menjadi momen memperbaiki hubungan.
- Kartu NPC di **DUNIA** menampilkan status singkat seperti `Janji aktif`, `Ada rasa kecewa`, atau `Sudah terbukti bisa saling mengandalkan`.
- **Janji Aktif** juga ditampilkan sebagai satu kartu ringkas di DUNIA tanpa menambah tab baru.

### Empat komitmen awal
- **Andi** — hadir membantu workshop komunitas.
- **Sari** — menemani shift penutup saat ia mencoba pola closing baru.
- **Bu Lestari** — menalangi Rp250.000 untuk satu putaran stok; jika dipenuhi, pengembalian uang dijadwalkan kemudian.
- **Dimas** — membantu audit rute satu malam tanpa bayaran.

### Prinsip desain
Relationship tinggi bukan hadiah pasif. Semakin dekat seseorang, semakin mungkin hidup mereka benar-benar meminta ruang di jadwal, uang, atau perhatian Raka. Failure tetap bukan game over: hubungan yang renggang dapat diperbaiki lewat waktu dan interaksi berikutnya.

### Save
Build AC (v25) otomatis dimigrasikan ke Build AD (v26). SAVE_KEY lama tetap dipertahankan; progress karier, uang, skill, kota, character stories, dan relationship lama tidak di-reset.

### Deploy
Upload seluruh isi folder ke root GitHub Pages. Setelah deploy, hard refresh atau tutup-buka PWA agar cache `hidup-build-ad-v1` aktif.
