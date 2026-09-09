# Hidup — Vertical Slice Build G

Build G memperdalam Fase 2 tanpa menambah tab baru.

## Perubahan utama

- Save Build F dimigrasikan otomatis; progres tidak perlu di-reset.
- Jalur Bengkel: perbaikan sulit, konsekuensi pelanggan kembali, bantuan Dika yang bisa dibalas, dan promosi Mekanik Senior.
- Jalur Toko: pelanggan sulit, rush shift, pelanggan kembali, kombinasi Teknologi + pekerjaan toko, dan promosi Supervisor Toko.
- Jalur Teknologi: kelas komputer, side job melalui Rian, rekomendasi tertunda, pekerjaan Asisten Teknisi IT, dan event deadline klien.
- Skill lintas jalur mulai berinteraksi. Sosial bisa membantu karier mekanik; Teknologi bisa membantu pekerjaan toko.
- State hidup baru: arah hidup, kondisi keuangan, dan utang kontekstual.
- Biaya hidup bulanan mulai berjalan untuk memberi tekanan ekonomi jangka menengah.
- Service worker/cache diperbarui untuk Build G.

## Deploy GitHub Pages

Ganti isi root repo dengan isi folder ini, commit, lalu push ke branch yang dipakai GitHub Pages.

Karena service worker lama bisa masih aktif beberapa saat, setelah deploy lakukan refresh/reopen aplikasi. Build G memakai nama cache baru dan akan membersihkan cache Build F saat service worker baru aktif.
