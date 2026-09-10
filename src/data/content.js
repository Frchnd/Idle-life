defineFromTemplate('activities','timed_activity',{
  id:'job_search',name:'Cari Kerja',duration:6,hint:'6j · cari peluang kerja',tags:['career','search'],
  requirements:[{preset:'unemployed'}],
  effects:[{type:'hours',value:6},{type:'fatigue',value:8},{type:'path_increment',path:'career.jobSearchCount',value:1}],
  result:'Kamu menghabiskan waktu mencari lowongan dan bertanya ke beberapa tempat.'
});
defineFromTemplate('activities','timed_activity',{
  id:'family',name:'Bantu Keluarga',duration:4,hint:'4j · jaga hubungan',tags:['life','relationship'],
  effects:[{type:'hours',value:4},{type:'fatigue',value:7},{type:'relationship',target:'family',value:4},{type:'skill',skill:'social',value:3}],
  result:'Kamu membantu keluarga dan menghabiskan waktu bersama mereka.'
});
defineFromTemplate('activities','timed_activity',{
  id:'rian',name:'Main dengan Rian',duration:3,hint:'3j · sosial',tags:['life','relationship'],
  effects:[{type:'hours',value:3},{type:'fatigue',value:5},{type:'relationship_clamped',target:'rian',value:3,min:-100,max:80},{type:'skill',skill:'social',value:6}],
  result:'Kamu menghabiskan waktu bersama Rian. Hubungan kalian tetap hangat.'
});
defineFromTemplate('activities','timed_activity',{
  id:'career_search',name:'Cari Peluang Lain',duration:4,hint:'4j · lihat arah karier lain',tags:['career','search'],
  requirements:[{preset:'employed'},{preset:'career_work_min',params:{count:4}}],
  effects:[{type:'hours',value:4},{type:'fatigue',value:5},{type:'path_increment',path:'career.changeSearchCount',value:1}],
  result:'Kamu meluangkan waktu melihat lowongan, bertanya ke kenalan, dan membandingkan arah hidup lain.'
});

defineFromTemplate('opportunities','debt_repayment',{
  id:'repay_family',name:'Lunasi Utang Keluarga',
  requirements:[{preset:'money_min',params:{amount:300000}},{preset:'status_present',params:{status:'utang_keluarga'}}],
  lockedText:'Kamu membutuhkan Rp300.000 untuk melunasi utang keluarga.',
  effects:[{type:'money',value:-300000},{type:'status_remove',status:'utang_keluarga'},{type:'relationship',target:'family',value:8},{type:'history',text:'Umur 18 · Melunasi utang kepada keluarga.'}],
  result:'Utang keluarga lunas. Beban hubungan itu selesai.'
});
defineFromTemplate('opportunities','debt_repayment',{
  id:'repay_rian',name:'Lunasi Utang Rian',
  requirements:[{preset:'money_min',params:{amount:300000}},{preset:'status_present',params:{status:'utang_rian'}}],
  lockedText:'Kamu membutuhkan Rp300.000 untuk melunasi utang kepada Rian.',
  effects:[{type:'money',value:-300000},{type:'status_remove',status:'utang_rian'},{type:'relationship',target:'rian',value:8},{type:'history',text:'Umur 18 · Melunasi utang kepada Rian.'}],
  result:'Utang kepada Rian lunas. Hubungan kalian kembali lebih ringan.'
});

registerContent('events',[
  {
    id:'exhausted',name:'Sudah Terlalu Dipaksakan',type:'KONDISI',priority:100,pool:'urgent',tags:['condition','urgent','fatigue'],once:true,
    title:'Sudah Terlalu Dipaksakan',text:'Kamu mulai sulit fokus. Kalau terus dipaksa, keputusan kecil bisa berubah menjadi masalah besar.',
    requirements:[{path:'player.fatigue',op:'gte',value:70},{preset:'flag_false',params:{flag:'exhaustedWarningSeen'}}],
    choices:[
      {label:'Istirahat sekarang',effects:[{type:'hours',value:8},{type:'fatigue',value:-45},{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu berhenti memaksakan diri dan memulihkan kondisi.'},
      {label:'Tetap lanjut',effects:[{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu memilih tetap jalan. Kondisimu masih buruk dan risiko tetap ada.'}
    ]
  }
]);

defineFromTemplate('events','career_lead',{
  id:'job_leads',name:'Dua Lowongan yang Masuk Akal',type:'PELUANG AWAL',priority:80,
  title:'Dua Lowongan yang Masuk Akal',text:'Setelah bertanya ke beberapa tempat, kamu menemukan dua lowongan yang bisa langsung dicoba. Jalurnya berbeda, dan kamu tidak harus memutuskan sekarang.',
  requirements:[{path:'career.jobSearchCount',op:'gte',value:1},{preset:'flag_false',params:{flag:'workshopOfferSeen'}}],
  choices:[
    {label:'Catat lowongan bengkel',hint:'Mekanik Junior · Rp120rb/hari',effects:[{type:'flag',key:'workshopOfferSeen',value:true},{type:'opportunity',opportunity:{id:'workshop_job',name:'Mekanik Junior',summary:'8j/hari · Rp120rb · belajar Mekanik'}},{type:'recent',text:'Lowongan Bengkel Sinar Jaya masuk daftar peluangmu.'}],result:'Kamu menyimpan kontak Bengkel Sinar Jaya.'},
    {label:'Catat keduanya',hint:'Tambahkan juga pekerjaan toko.',effects:[{type:'flag',key:'workshopOfferSeen',value:true},{type:'flag',key:'storeOfferSeen',value:true},{type:'opportunity',opportunity:{id:'workshop_job',name:'Mekanik Junior',summary:'8j/hari · Rp120rb · belajar Mekanik'}},{type:'opportunity',opportunity:{id:'store_job',name:'Pramuniaga',summary:'8j/hari · Rp100rb · banyak interaksi sosial'}},{type:'recent',text:'Dua lowongan awal sekarang tersedia.'}],result:'Sekarang kamu punya dua jalur kerja yang benar-benar berbeda.'}
  ]
});

defineFromTemplate('events','career_lead',{
  id:'store_lead',name:'Lowongan Lain Muncul',priority:70,
  title:'Lowongan Lain Muncul',text:'Pencarian kedua membawamu ke Toko Serba Ada. Gajinya sedikit lebih rendah dari bengkel, tapi pekerjaan ini lebih banyak melatih cara menghadapi orang.',
  requirements:[{preset:'unemployed'},{path:'career.jobSearchCount',op:'gte',value:2},{flag:'workshopOfferSeen',value:true},{preset:'flag_false',params:{flag:'storeOfferSeen'}}],
  choices:[
    {label:'Catat lowongan toko',effects:[{type:'flag',key:'storeOfferSeen',value:true},{type:'opportunity',opportunity:{id:'store_job',name:'Pramuniaga',summary:'8j/hari · Rp100rb · banyak interaksi sosial'}},{type:'recent',text:'Lowongan Toko Serba Ada sekarang tersedia.'}],result:'Sekarang kamu punya alternatif pekerjaan yang lebih sosial.'},
    {label:'Tidak tertarik',effects:[{type:'flag',key:'storeOfferSeen',value:true}],result:'Kamu memilih tidak mengejar pekerjaan toko.'}
  ]
});

defineFromTemplate('events','first_day',{
  id:'first_workshop',name:'Hari Pertama di Bengkel',
  title:'Hari Pertama di Bengkel',text:'Pak Surya memasangkanmu dengan Dika. Bengkel lebih sibuk dari yang terlihat dari luar.',
  requirements:[{preset:'job_is',params:{job:'mechanic_junior'}},{preset:'job_work_min',params:{job:'mechanic_junior',count:1}},{preset:'flag_false',params:{flag:'firstWorkshopDay'}}],
  choices:[
    {label:'Dengarkan baik-baik',effects:[{type:'skill',skill:'mechanics',value:10},{type:'skill',skill:'learning',value:6},{type:'relationship',target:'pak_arman',value:4},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Pak Surya melihat kamu serius belajar.'}],result:'Kamu fokus memahami ritme bengkel.'},
    {label:'Coba menonjol sejak awal',effects:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'dika',value:-2},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Dika mulai menganggapmu sebagai pesaing.'}],result:'Kamu belajar cepat, tapi persaingan dengan Dika mulai terasa.'}
  ]
});

defineFromTemplate('events','first_day',{
  id:'first_store',name:'Hari Pertama di Toko',
  title:'Hari Pertama di Toko',text:'Mira langsung menaruhmu di depan pelanggan. Pekerjaan ini lebih banyak soal membaca orang daripada mengangkat barang.',
  requirements:[{preset:'job_is',params:{job:'store_clerk'}},{preset:'job_work_min',params:{job:'store_clerk',count:1}},{preset:'flag_false',params:{flag:'firstStoreDay'}}],
  choices:[
    {label:'Amati cara Mira melayani',effects:[{type:'skill',skill:'social',value:12},{type:'skill',skill:'learning',value:5},{type:'relationship',target:'maya',value:4},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true},{type:'recent',text:'Mira melihat kamu cepat menangkap cara menghadapi pelanggan.'}],result:'Kamu belajar dari cara Mira berbicara dan menyelesaikan masalah.'},
    {label:'Langsung coba sendiri',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:1},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true}],result:'Kamu memilih belajar lewat pengalaman langsung.'}
  ]
});

// === Build S: migrasi opportunity sederhana ke framework data-driven ===
defineFromTemplate('opportunities','learning_investment',{
  id:'tech_course',name:'Kelas Komputer Dasar',
  requirements:[{preset:'money_min',params:{amount:250000}}],
  lockedText:'Kamu membutuhkan Rp250.000 untuk mengikuti kelas ini.',
  effects:[
    {type:'money',value:-250000},{type:'hours',value:8},{type:'fatigue',value:12},
    {type:'skill',skill:'technology',value:80},{type:'skill',skill:'learning',value:25},
    {type:'history',text:'Umur 18 · Mengikuti kelas komputer dasar.'},
    {type:'recent',text:'Kelas terstruktur membuat kemampuan Teknologimu melonjak.'}
  ],
  result:'Kelas selesai. Teknologi meningkat pesat dan jalur baru mulai terbuka.'
});

defineFromTemplate('opportunities','asset_purchase',{
  id:'buy_laptop',name:'Beli Laptop Bekas',
  requirements:[{preset:'money_min',params:{amount:750000}},{preset:'asset_false',params:{asset:'laptop'}}],
  lockedText:'Kamu membutuhkan Rp750.000 untuk membeli laptop itu.',
  effects:[
    {type:'money',value:-750000},{type:'asset',asset:'laptop',value:true},
    {type:'skill',skill:'technology',value:15},
    {type:'history',text:'Umur 18 · Membeli laptop bekas untuk belajar dan kerja sampingan.'},
    {type:'recent',text:'Laptop membuka kemungkinan kerja teknologi dari rumah.'}
  ],
  result:'Kamu membeli laptop bekas. Tabungan turun, tetapi Teknologi sekarang bisa menghasilkan uang lebih fleksibel.'
});

defineFromTemplate('opportunities','life_change',{
  id:'rent_room',name:'Sewa Kamar Sendiri',
  requirements:[{any:[
    {all:[{flag:'familySupport',value:true},{path:'player.money',op:'gte',value:1000000}]},
    {all:[{flag:'familySupport',value:false},{path:'player.money',op:'gte',value:1200000}]}
  ]}],
  lockedText:'Tabunganmu belum cukup untuk deposit dan biaya awal tempat tinggal.',
  effects:[
    {type:'money',value:{base:-1200000,rules:[{when:[{flag:'familySupport',value:true}],set:-1000000}]}},
    {type:'housing',value:{id:'rented_room',label:'Kamar sewa sendiri',monthlyCost:1100000,movedAt:null}},
    {type:'path_set',path:'housing.movedAt',fromPath:'time.totalHours'},
    {type:'status_remove',status:'tinggal_bersama_keluarga'},{type:'status_add',status:'tinggal_sendiri'},
    {type:'flag',key:'movedOut',value:true},{type:'relationship',target:'family',value:-2},
    {type:'schedule',after:12,kind:'move_out_reflection'},
    {type:'history',text:'Umur 18 · Pindah dari rumah keluarga ke kamar sewa sendiri.'},
    {type:'recent',text:'Kamu mulai tinggal sendiri. Biaya hidup naik, tetapi ruang dan ritmemu sekarang milikmu sendiri.'}
  ],
  result:'Kamu pindah ke kamar sewa. Biaya hidup bulanan naik menjadi Rp1.100.000, tetapi belajar dan istirahat menjadi lebih efektif.'
});

// === Build S: lebih banyak event lama pindah ke event pools data-driven ===
defineFromTemplate('events','life_milestone',{
  id:'family_milestone',name:'Keluarga Membutuhkan Kehadiranmu',priority:54,weight:4,
  title:'Keluarga Membutuhkan Satu Hari yang Benar-benar Hadir',
  text:'Ada urusan keluarga penting yang harus diselesaikan di jam kerja. Mereka tidak sekadar butuh uang—mereka butuh waktumu.',
  requirements:[{preset:'career_work_min',params:{count:6}},{preset:'relationship_min',params:{target:'family',value:55}},{preset:'flag_false',params:{flag:'familyMilestoneSeen'}}],
  choices:[
    {label:'Luangkan waktu untuk keluarga',hint:'6j · mengorbankan waktu produktif',effects:[{type:'hours',value:6},{type:'fatigue',value:5},{type:'relationship',target:'family',value:12},{type:'flag',key:'familyMilestoneSeen',value:true},{type:'flag',key:'familySupport',value:true},{type:'history',text:'Umur 18 · Memilih hadir untuk keluarga saat mereka benar-benar membutuhkan waktu.'}],result:'Keluargamu tahu kamu bisa diandalkan ketika hal penting terjadi.'},
    {label:'Prioritaskan pekerjaan',hint:'+Rp80rb · hubungan sedikit menjauh',effects:[{type:'hours',value:4},{type:'money',value:80000},{type:'relationship',target:'family',value:-4},{type:'flag',key:'familyMilestoneSeen',value:true}],result:'Kamu memilih pekerjaan. Keputusan itu masuk akal, tapi keluarga mengingat bahwa kali ini kamu tidak bisa hadir.'}
  ]
});

defineFromTemplate('events','life_milestone',{
  id:'rian_milestone',name:'Rian Meminta Bantuan Tanpa Imbalan',priority:52,weight:4,
  title:'Rian Minta Bantuan yang Tidak Bisa Dibayar',
  text:'Rian mendapat shift yang tidak bisa ditinggalkan dan perlu seseorang menangani urusan penting untuk keluarganya. Kali ini tidak ada uang atau pekerjaan sebagai gantinya.',
  requirements:[{preset:'relationship_min',params:{target:'rian',value:50}},{preset:'flag_false',params:{flag:'rianMilestoneSeen'}}],
  choices:[
    {label:'Bantu Rian',hint:'4j · tidak ada bayaran',effects:[{type:'hours',value:4},{type:'fatigue',value:5},{type:'relationship',target:'rian',value:12},{type:'flag',key:'rianMilestoneSeen',value:true},{type:'flag',key:'rianTrusted',value:true},{type:'history',text:'Umur 18 · Membantu Rian ketika tidak ada keuntungan langsung.'}],result:'Rian sekarang melihatmu sebagai orang yang bisa dipercaya, bukan cuma teman atau koneksi kerja.'},
    {label:'Tidak bisa kali ini',effects:[{type:'relationship',target:'rian',value:-1},{type:'flag',key:'rianMilestoneSeen',value:true}],result:'Rian memahami. Hubungan kalian tetap baik, tapi tidak berubah menjadi kepercayaan yang lebih dalam.'}
  ]
});

defineFromTemplate('events','major_choice',{
  id:'trajectory_choice',name:'Pilih Arah Utama Hidup',priority:66,weight:3,
  title:'Dua Arah yang Sama-sama Masuk Akal',
  text:'Pekerjaan utama mulai stabil, tapi pemasukan sampingan juga sudah terbukti nyata. Kamu tidak bisa memberi energi maksimal ke keduanya tanpa trade-off.',
  requirements:[{preset:'employed'},{preset:'career_work_min',params:{count:8}},{path:'career.sideIncomeTotal',op:'gte',value:500000},{preset:'trajectory_is',params:{trajectory:'open'}},{preset:'flag_false',params:{flag:'trajectoryChoiceSeen'}}],
  choices:[
    {label:'Perkuat karier utama',hint:'Progres promosi lebih cepat saat bekerja',effects:[{type:'trajectory',value:'career'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'fokus_karier'},{type:'history',text:'Umur 18 · Memilih memperkuat karier utama sebagai arah hidup.'}],result:'Kamu memilih stabilitas dan kedalaman di pekerjaan utama.'},
    {label:'Bangun jalur mandiri juga',hint:'Kerja sampingan lebih kuat · kerja utama sedikit lebih melelahkan',effects:[{type:'trajectory',value:'independent'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'jalur_mandiri'},{type:'history',text:'Umur 18 · Memilih membangun jalur mandiri di samping pekerjaan utama.'}],result:'Kamu menerima hidup yang lebih padat demi membangun sumber penghasilan di luar pekerjaan utama.'}
  ]
});

defineFromTemplate('events','learning_lead',{
  id:'tech_course_offer',name:'Kelas Komputer Malam',priority:47,weight:3,
  title:'Kelas Komputer Malam',
  text:'Kamu menemukan kelas komputer dasar yang lebih terstruktur daripada belajar sendiri. Biayanya cukup terasa untuk kondisi keuanganmu sekarang.',
  requirements:[{path:'skills.technology',op:'gte',value:25},{preset:'flag_false',params:{flag:'techCourseSeen'}}],
  choices:[
    {label:'Simpan informasinya',hint:'Biaya Rp250rb · 8j',effects:[{type:'flag',key:'techCourseSeen',value:true},{type:'opportunity',opportunity:{id:'tech_course',name:'Kelas Komputer Dasar',summary:'8j · Rp250rb · peningkatan Teknologi besar'}}],result:'Kelas itu sekarang tersedia sebagai peluang.'},
    {label:'Belajar sendiri dulu',effects:[{type:'flag',key:'techCourseSeen',value:true}],result:'Kamu memilih tidak mengeluarkan uang sekarang.'}
  ]
});

defineFromTemplate('events','learning_lead',{
  id:'laptop_offer_data',name:'Laptop Bekas yang Masih Layak',priority:43,weight:2,
  type:'KEPUTUSAN FINANSIAL',tags:['learning','technology','finance','investment'],
  title:'Laptop Bekas yang Masih Layak',
  text:'Rian menemukan laptop bekas yang cukup untuk belajar dan mengambil pekerjaan teknologi ringan. Harganya Rp750rb—cukup besar dibanding tabunganmu sekarang.',
  requirements:[{path:'skills.technology',op:'gte',value:60},{preset:'asset_false',params:{asset:'laptop'}},{preset:'flag_false',params:{flag:'laptopOfferSeen'}}],
  choices:[
    {label:'Simpan peluang pembelian',hint:'Rp750rb · investasi untuk kerja sampingan Teknologi',effects:[{type:'flag',key:'laptopOfferSeen',value:true},{type:'opportunity',opportunity:{id:'buy_laptop',name:'Beli Laptop Bekas',summary:'Rp750rb · membuka kerja lepas Teknologi'}}],result:'Laptop itu sekarang menjadi pilihan investasi, bukan kewajiban.'},
    {label:'Jangan beli',effects:[{type:'flag',key:'laptopOfferSeen',value:true}],result:'Kamu menjaga tabunganmu. Teknologi tetap bisa dipelajari tanpa membeli aset sekarang.'}
  ]
});

// === Build Z: city expansion — dua jalur kerja baru ===
defineFromTemplate('events','career_lead',{
  id:'city_job_leads',name:'Kota Mulai Terasa Lebih Luas',type:'PELUANG KOTA',priority:68,weight:4,
  title:'Dua Tempat Baru Membuka Pintu',
  text:'Pencarianmu membawa kabar dari Kafe Senja dan Lintas Kota Logistik. Satu lebih banyak berurusan dengan orang dan ritme pelayanan; satunya lagi soal alur barang, ketepatan, dan kerja tim.',
  requirements:[{preset:'unemployed'},{path:'career.jobSearchCount',op:'gte',value:3},{preset:'flag_false',params:{flag:'cafeOfferSeen'}},{preset:'flag_false',params:{flag:'logisticsOfferSeen'}}],
  choices:[
    {label:'Catat Kafe Senja',hint:'Barista Pemula · Rp110rb/hari',effects:[{type:'flag',key:'cafeOfferSeen',value:true},{type:'opportunity',opportunity:{id:'cafe_job',name:'Barista Pemula',summary:'8j/hari · Rp110rb · Hospitality'}},{type:'recent',text:'Kafe Senja masuk daftar peluang kerja barumu.'}],result:'Kamu menyimpan kontak Kafe Senja.'},
    {label:'Catat Lintas Kota',hint:'Staf Gudang · Rp120rb/hari',effects:[{type:'flag',key:'logisticsOfferSeen',value:true},{type:'opportunity',opportunity:{id:'logistics_job',name:'Staf Gudang',summary:'8j/hari · Rp120rb · Logistik'}},{type:'recent',text:'Lintas Kota Logistik masuk daftar peluang kerja barumu.'}],result:'Kamu menyimpan kontak Lintas Kota Logistik.'},
    {label:'Catat keduanya',hint:'Biarkan pilihan tetap terbuka.',effects:[{type:'flag',key:'cafeOfferSeen',value:true},{type:'flag',key:'logisticsOfferSeen',value:true},{type:'opportunity',opportunity:{id:'cafe_job',name:'Barista Pemula',summary:'8j/hari · Rp110rb · Hospitality'}},{type:'opportunity',opportunity:{id:'logistics_job',name:'Staf Gudang',summary:'8j/hari · Rp120rb · Logistik'}}],result:'Kamu sekarang punya dua arah kota baru untuk dicoba.'}
  ]
});



defineFromTemplate('events','career_lead',{
  id:'city_career_discovery',name:'Ada Jalur yang Belum Pernah Kamu Coba',type:'ARAH KARIER',priority:69,weight:4,
  title:'Kota Punya Pilihan Lebih Banyak',
  text:'Saat melihat lowongan di luar rutinitas sekarang, dua bidang yang belum pernah kamu jalani mulai terasa realistis: pelayanan di Kafe Senja atau operasi di Lintas Kota Logistik. Keduanya menerima orang yang mau belajar dari dasar.',
  requirements:[{preset:'employed'},{path:'career.changeSearchCount',op:'gte',value:1},{path:'player.job',op:'neq',value:'cafe_crew'},{path:'player.job',op:'neq',value:'cafe_lead'},{path:'player.job',op:'neq',value:'warehouse_staff'},{path:'player.job',op:'neq',value:'dispatch_coordinator'}],
  choices:[
    {label:'Lihat Kafe Senja',hint:'Mulai dari Barista Pemula · skill baru',effects:[{type:'opportunity',opportunity:{id:'career_cafe',name:'Coba Jalur Kafe Senja',summary:'Barista Pemula · mulai Hospitality dari dasar'}},{type:'career_search_handled'}],result:'Kafe Senja masuk ke peluang aktifmu.'},
    {label:'Lihat Lintas Kota',hint:'Mulai dari Staf Gudang · skill baru',effects:[{type:'opportunity',opportunity:{id:'career_logistics',name:'Coba Jalur Logistik',summary:'Staf Gudang · mulai Logistik dari dasar'}},{type:'career_search_handled'}],result:'Lintas Kota Logistik masuk ke peluang aktifmu.'},
    {label:'Catat keduanya',effects:[{type:'opportunity',opportunity:{id:'career_cafe',name:'Coba Jalur Kafe Senja',summary:'Barista Pemula · mulai Hospitality dari dasar'}},{type:'opportunity',opportunity:{id:'career_logistics',name:'Coba Jalur Logistik',summary:'Staf Gudang · mulai Logistik dari dasar'}},{type:'career_search_handled'}],result:'Dua arah baru masuk ke peluang aktifmu.'}
  ]
});

defineFromTemplate('events','first_day',{
  id:'first_cafe',name:'Hari Pertama di Kafe Senja',
  title:'Hari Pertama di Kafe Senja',text:'Sari menunjukkan bahwa pekerjaan di kafe bukan cuma membuat minuman. Kamu harus membaca antrean, mengingat pesanan, dan tetap ramah ketika ritme mulai padat.',
  requirements:[{preset:'job_is',params:{job:'cafe_crew'}},{preset:'job_work_min',params:{job:'cafe_crew',count:1}},{preset:'flag_false',params:{flag:'firstCafeDay'}}],
  choices:[
    {label:'Pelajari ritme pelayanan',effects:[{type:'skill',skill:'hospitality',value:14},{type:'skill',skill:'social',value:6},{type:'relationship',target:'sari',value:5},{type:'npc_known',npc:'sari'},{type:'flag',key:'firstCafeDay',value:true}],result:'Kamu mulai memahami bagaimana pelayanan yang baik tetap terasa ringan di tengah kesibukan.'},
    {label:'Fokus ke teknik minuman',effects:[{type:'skill',skill:'hospitality',value:20},{type:'relationship',target:'sari',value:2},{type:'npc_known',npc:'sari'},{type:'flag',key:'firstCafeDay',value:true}],result:'Teknikmu tumbuh lebih cepat, walau kamu masih perlu belajar membaca pelanggan.'}
  ]
});

defineFromTemplate('events','first_day',{
  id:'first_logistics',name:'Hari Pertama di Lintas Kota',
  title:'Hari Pertama di Lintas Kota Logistik',text:'Dimas memberimu daftar barang dan jadwal keberangkatan. Kesalahan kecil di sini bisa membuat satu rute terlambat, jadi kerja cepat saja tidak cukup.',
  requirements:[{preset:'job_is',params:{job:'warehouse_staff'}},{preset:'job_work_min',params:{job:'warehouse_staff',count:1}},{preset:'flag_false',params:{flag:'firstLogisticsDay'}}],
  choices:[
    {label:'Utamakan ketelitian',effects:[{type:'skill',skill:'logistics',value:16},{type:'skill',skill:'learning',value:5},{type:'relationship',target:'dimas',value:5},{type:'npc_known',npc:'dimas'},{type:'flag',key:'firstLogisticsDay',value:true}],result:'Dimas melihat kamu nggak asal cepat; alur kerja mulai masuk akal di kepalamu.'},
    {label:'Ikuti ritme tim',effects:[{type:'skill',skill:'logistics',value:12},{type:'skill',skill:'social',value:8},{type:'relationship',target:'dimas',value:4},{type:'npc_known',npc:'dimas'},{type:'flag',key:'firstLogisticsDay',value:true}],result:'Kamu belajar bahwa gudang berjalan karena koordinasi, bukan tenaga satu orang.'}
  ]
});
