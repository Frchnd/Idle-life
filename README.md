# Hidup — Build AC

## Character Storylines

Build AC memperdalam Social City Layer dengan cerita karakter bertahap. NPC tetap punya hidup sendiri: kedekatan memberi Raka kesempatan ikut membantu, tetapi melewatkan tugas cerita tidak membekukan perkembangan mereka.

### Yang baru
- **4 character story arcs** untuk Andi, Bu Lestari, Sari, dan Dimas.
- Setiap cerita punya tahap: pembuka → kebutuhan/tugas → outcome/follow-up.
- Tugas cerita punya deadline. Kalau dilewatkan, NPC tetap mengambil keputusan sendiri dan cerita bergerak ke outcome berbeda.
- Kartu NPC di tab **DUNIA** menampilkan status cerita singkat seperti `Butuh bantuan`, `Ada kabar baru`, atau `Bab selesai`.
- Event cerita memakai portrait karakter yang sudah ada, jadi tetap konsisten dengan presentation layer anime.
- Outcome cerita menyentuh simulation engine:
  - membantu **Andi** membuat proyek kampus lebih sering terbuka;
  - membantu **Bu Lestari** meningkatkan nilai kerja pasar berikutnya;
  - membantu **Sari** sedikit memperkuat kondisi Kafe Senja;
  - membantu **Dimas** menurunkan tekanan operasional Lintas Kota.
- Life state NPC ikut berubah: Andi bisa jadi koordinator komunitas, Bu Lestari bisa membangun jaringan kiriman atau mengecilkan kios, Sari bisa berkembang sebagai mentor, dan Dimas bisa membangun sistem kerja yang lebih teratur.

### Save
Build AB (v24) otomatis dimigrasikan ke Build AC (v25). SAVE_KEY lama tetap dipertahankan; uang, skill, karier, relasi, kunjungan kota, dan progress lain tidak di-reset.

### Deploy
Upload seluruh isi folder ke root GitHub Pages. Setelah deploy, hard refresh atau tutup-buka PWA agar cache `hidup-build-ac-v1` aktif.
