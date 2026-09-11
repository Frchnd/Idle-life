# Hidup — Content Catalog (Build AI)

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

### `career_specialization` — Career Specialization v1
Pendidikan formal ringan yang mengubah skill matang menjadi akses ke posisi spesialis.

- Certifications: `engine_diagnostics`, `retail_operations`, `network_foundations`
- Jobs: `mechanic_diagnostic`, `operations_coordinator`, `network_technician`
- Opportunities: 3 jalur sertifikasi + 3 lowongan spesialis

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


## Build Y — Career Specialization
Pack `career_specialization` menambahkan tipe konten `certifications`, tiga pendidikan lanjutan, dan tiga pekerjaan spesialis. Opportunity pendidikan muncul ketika skill mencapai tier Terampil; lowongan spesialis baru disinkronkan setelah sertifikasi selesai dan kondisi perusahaan memungkinkan.


## Build Z — City Expansion I
Pack `city_expansion_one` memperluas kota tanpa mengubah core loop.

- Jobs: `cafe_crew`, `cafe_lead`, `warehouse_staff`, `dispatch_coordinator`
- Events: `city_job_leads`, `city_career_discovery`, `first_cafe`, `first_logistics`
- World sectors: `hospitality`, `logistics`
- Workplaces: `kafe_senja`, `lintas_kota`
- NPC: `sari`, `dimas`

Lowongan awal baru muncul setelah pemain cukup lama mencari kerja. Sesudah masuk, promosi tetap mempertimbangkan jam terbang, relationship dengan orang di tempat kerja, dan kesehatan perusahaan. Demand sektor juga dapat memunculkan opportunity pasar yang diperebutkan.

## Build AA — City Life Expansion

Lapisan kota ditambahkan sebagai data `src/data/locations.js` + runtime `src/core/city.js`. Lokasi sengaja bukan tab baru; pemain mengaksesnya dari DUNIA dan setiap kunjungan langsung mengonsumsi waktu serta biaya.

Lokasi awal: `kampus_harapan`, `pasar_tradisional`, `gym_sehat`.


## Build AB — Social City Layer
Build AB menambahkan `src/data/social.js` + `src/core/social.js` sebagai simulation/presentation layer di luar data-driven content registry. Jadwal NPC sengaja dipisahkan dari event pool karena presence dihitung dari waktu + lokasi. Pertemuan sosial menghasilkan event runtime dengan portrait, cooldown, dan relationship gates.


## Build AC — Character Storylines

`src/data/storylines.js` mendefinisikan arc karakter, sedangkan `src/core/storylines.js` menangani state, deadline, outcome, dan task runtime. Layer ini sengaja berada di atas Content Registry karena cerita karakter membutuhkan stateful multi-stage progression dan consequence yang berubah mengikuti waktu.

Arc awal: `andi`, `bu_lestari`, `sari`, `dimas`. Masing-masing memiliki intro event, optional story opportunity, missed path, dan follow-up. NPC tidak berhenti berkembang ketika player tidak ikut campur.

## Build AD — Relationship Stakes

`src/data/relationship-stakes.js` mendefinisikan komitmen hubungan, sedangkan `src/core/relationship-stakes.js` menangani eligibility, deadline, fulfillment, missed promise, strain, follow-up, dan repair interaction.

Layer ini sengaja berada setelah Character Storylines: sebuah stake baru terbuka ketika arc karakter terkait sudah selesai dan relationship cukup tinggi. Sistem membatasi satu komitmen besar aktif pada satu waktu dan memberi jarak minimal antar-stake supaya social content tidak mendominasi core loop.

Stake awal: `andi_workshop`, `sari_closing`, `lestari_stock`, `dimas_audit`.


## Build AE — Housing system

Housing bukan content pack event; definisi hunian ada di `src/data/housing.js` dan runtime logic di `src/core/housing.js`. Sistem ini sengaja terpisah karena modifiers-nya dipakai lintas activity, city travel, economy, dan UI.

## Build AF — Personal Finance & Lifestyle

`src/data/finance.js` mendefinisikan pilihan lifestyle dan transportasi. `src/core/finance.js` menangani dana darurat, biaya rutin, commute modifier, city travel modifier, ownership transport, dan anti-exploit cooldown. Layer ini sengaja berada di luar Content Registry karena nilainya menjadi modifier lintas housing, economy, activities, city, save, dan UI.

Tidak ada tab finansial baru. Presentation ditempatkan kontekstual di KAMU.


## Build AG — Assets & Ownership

`src/data/assets.js` mendefinisikan aset pribadi, sedangkan `src/core/assets.js` menangani ownership, kondisi, wear, maintenance, migration, dan peluang produktif berbasis aset.

Aset awal: `laptop`, `mechanic_toolkit`, `study_desk`, `comfort_bed`, `bicycle`, `motorbike`.

Sistem ini sengaja tidak menjadi content pack atau tab Inventory. Aset bekerja sebagai modifier lintas Finance, Activities, Opportunities, City travel, Save, dan KAMU. Kondisi numerik tetap backend-only; UI menampilkan label kondisi dan progress visual.

## Build AJ — Time, Age & Life Phases

`src/core/life-phases.js` memproses umur, fase hidup, ulang tahun, focus modifier, dan jendela peluang usia. `src/data/life-phases.js` berisi opportunity data-driven yang memang memiliki batas umur.

Fase awal:
- 18–20: `finding_footing` / Mencari pijakan
- 21–24: `building_direction` / Membangun arah
- 25–29: `adult_rhythm` / Menata hidup dewasa
- 30+: `established_life` / fondasi fase jangka panjang sebelum Life & Legacy

Requirement preset baru: `age_min`, `age_max`, `age_between`.

Pack `life_phases` memiliki `young_talent_program` dan `young_professional_forum`. Konten usia sengaja bersifat sampingan; tidak boleh mengunci career core karena pemain tidak boleh dihukum permanen hanya karena memilih bermain lebih lama.

## Build AK — Partnership layer
Build AK menambahkan sistem partnership sebagai systemic life layer di luar Content Registry utama. Candidate definition berada di `src/data/partnership.js`, sementara state machine dan event generator berada di `src/core/partnership.js`.

Tahap saat ini: `single -> exploring -> dating -> committed`. Kandidat awal adalah Sari dan Andi. Sistem hanya aktif setelah character story dan relationship stake kandidat cukup berkembang; memilih tetap sahabat menonaktifkan jalur romantis kandidat itu tanpa menghapus hubungan sosialnya.


## Build AL — Shared Life Decisions
Build AL menambah lapisan sistemik `sharedLife` di luar Content Registry karena ia merupakan state kehidupan lintas-event, bukan content pack mandiri. Event yang dihasilkan meliputi pembicaraan tinggal bersama, konflik rutinitas rumah, pertunangan, dan pernikahan. Save version: 34.


## Build AM — Family Foundations
Family Foundations berada di `src/data/family.js` + `src/core/family.js`. Sistem ini sengaja tidak menjadi content pack besar karena ia adalah life-stage engine yang membaca partnership/shared-life state.

State utama: `family.intent`, `family.prepared`, `family.stage`, `family.children`, `family.parentingStyle`.

Prinsip desain:
- jalur tanpa anak adalah outcome valid;
- tidak memaksakan jalur biologis tertentu;
- anak tidak muncul dari satu tombol instan;
- rumah, uang, relasi, dan tekanan ikut menentukan kesiapan;
- parenting menambah biaya/pressure tetapi tidak menjadi punishment ekstrem.


## Build AN — Early Parenting & Child Development

`src/data/parenting.js` mendefinisikan tahap perkembangan dan trait yang tampil ke pemain. `src/core/parenting.js` menangani umur anak, sleep debt, care rhythm, family-time cooldown, milestone fase, development signals, dan modifier lintas kerja/belajar/istirahat.

State utama berada di `family.parenting`. Angka seperti `sleepDebt`, `careRhythm`, dan score trait tetap backend-only; UI hanya menampilkan label manusiawi seperti “Kurang tidur”, “Hangat & terjaga”, atau kecenderungan “Penasaran”.

Prinsip desain:
- parenting mengubah opportunity cost waktu, bukan menjadi mini-game;
- milestone lama tidak diputar ulang saat migration;
- offline routine boleh menjaga koneksi keluarga saat ritme sudah terlalu rendah;
- perkembangan anak muncul dari pola berulang dan keputusan milestone, bukan dari point allocation;
- jalur Life & Legacy tetap kompatibel dengan keluarga tanpa anak dari Build AM.

## Build AO — Family & Career Tension

`src/data/family-career.js` mendefinisikan pola penjagaan dan profil ritme kerja pasangan. `src/core/family-career.js` menangani biaya penjagaan, cooldown perubahan pola, tekanan kerja-keluarga, momentum karier Raka, kesempatan karier pasangan, serta event “siapa yang mengalah” secara bergiliran.

State utama berada di `family.careerCare`. Layer ini sengaja bukan content pack karena ia menjadi modifier lintas Economy, Parenting, Health, Activities, Shared Life, Save, dan UI.

Prinsip desain:
- pasangan tidak menjadi karakter kedua yang harus dimicromanage;
- childcare membeli stabilitas waktu, bukan “bonus parenting” abstrak;
- kesempatan karier bisa datang ke salah satu pihak;
- mengalah sekali adalah keputusan, mengalah terus-menerus bisa menjadi pola yang menimbulkan strain;
- save lama tidak dipaksa memutar event childcare/career yang seolah sudah terjadi di masa lalu.
