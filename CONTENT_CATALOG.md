# Hidup — Content Catalog (Build V)

Fase 4 memisahkan **engine** dari **content**. Konten data-driven dimiliki oleh satu content pack, memakai template/preset bila cocok, dan harus lolos validator sebelum game boot.

## Content packs

### `core_life` — Core Life v1
Aktivitas hidup dasar, warning kondisi, dan milestone hubungan.

- Activities: `family`, `rian`
- Events: `exhausted`, `family_milestone`, `rian_milestone`

### `career_core` — Career Core v1
Pekerjaan prototype, pencarian kerja, hari pertama, dan arah karier.

- Jobs: `mechanic_junior`, `mechanic_senior`, `store_clerk`, `store_supervisor`, `it_assistant`
- Activities: `job_search`, `career_search`
- Events: `job_leads`, `store_lead`, `first_workshop`, `first_store`, `trajectory_choice`

### `learning_technology` — Learning & Technology v1
Investasi belajar dan aset Teknologi.

- Opportunities: `tech_course`, `buy_laptop`
- Events: `tech_course_offer`, `laptop_offer_data`

### `life_finance` — Life & Finance v1
Utang dan perubahan tempat tinggal.

- Opportunities: `repay_family`, `repay_rian`, `rent_room`

## Event pools

| Pool | Prioritas | Fungsi |
|---|---:|---|
| `urgent` | 100 | kondisi yang tidak boleh ditenggelamkan randomness |
| `early_career` | 80 | lowongan dan arah awal kerja |
| `major_decisions` | 70 | keputusan hidup besar |
| `first_days` | 60 | pengalaman awal pekerjaan |
| `learning` | 50 | pendidikan dan investasi diri |
| `life` | 40 | relationship dan kejadian kehidupan |

Pool priority menentukan **kelas urgensi**. Di dalam kelas yang sama, `weight` menentukan peluang relatif. Seed RNG disimpan di save agar variasi bisa direproduksi saat debugging.

## Authoring rule

1. Gunakan ID `snake_case` unik.
2. Gunakan template/preset kalau struktur yang sama sudah ada.
3. Semua konten data-driven harus dimiliki **tepat satu** content pack.
4. Event wajib punya minimal dua pilihan bermakna.
5. Jangan hardcode branching core kalau bisa dijelaskan lewat `requirements` + `effects`.
6. Sistem yang sangat dinamis boleh tetap legacy sampai abstraction-nya jelas.
7. Jalankan `validateContentFramework()`; build tidak layak deploy bila ada error.

## Contoh event weighted

```js
defineFromTemplate('events','life_milestone',{
  id:'friend_needs_help',
  weight:3,
  requirements:[
    {preset:'relationship_min',params:{target:'rian',value:50}}
  ],
  title:'Rian Butuh Bantuan',
  text:'...',
  choices:[...]
});
```

## Runtime debug

Saat game dibuka di browser:

```js
window.__HIDUP_CONTENT_REPORT__
window.__HIDUP_CONTENT_CATALOG__
```

Report berisi hasil validasi; catalog berisi pack, jumlah konten per tipe, dan indeks tag.
