const ADOLESCENCE_STAGES=[
  {id:'preteen',label:'Mulai punya dunia sendiri',minMonths:120,maxMonths:155,summary:'Nara mulai membawa cerita, teman, dan keputusan kecil yang tidak semuanya berasal dari rumah.'},
  {id:'teen',label:'Masa remaja',minMonths:156,maxMonths:191,summary:'Teman, minat, sekolah, dan ruang pribadi mulai sama pentingnya dengan aturan keluarga.'},
  {id:'late_teen',label:'Menjelang dewasa muda',minMonths:192,maxMonths:215,summary:'Nara makin sering memikirkan hidup setelah sekolah dan ingin keputusan besarnya dianggap miliknya sendiri.'},
  {id:'young_adult',label:'Di ambang hidup mandiri',minMonths:216,maxMonths:999,summary:'Fondasi masa kecil sudah berubah menjadi arah hidup awal. Peran Raka bergeser dari pengatur menjadi tempat kembali.'}
];

const ADOLESCENCE_PEER_CIRCLES={
  makers:{id:'makers',name:'Teman proyek & utak-atik',summary:'Circle kecil yang senang bikin, membongkar, memperbaiki, dan mencoba hal praktis.',monthlyCost:140000,influence:{making:.7,problemSolving:.5,initiative:.25}},
  creative:{id:'creative',name:'Teman cerita & kreatif',summary:'Lingkungan yang banyak bertukar cerita, gambar, musik, ide, dan cara berekspresi.',monthlyCost:170000,influence:{stories:.7,expression:.55,confidence:.2}},
  academic:{id:'academic',name:'Teman belajar & eksplorasi',summary:'Circle yang senang membandingkan ide, mencari pola, dan mengejar proyek belajar yang lebih menantang.',monthlyCost:190000,influence:{systems:.65,focus:.5,problemSolving:.25}},
  social:{id:'social',name:'Circle sosial lingkungan',summary:'Teman yang terbentuk dari sekolah dan lingkungan sekitar; banyak belajar lewat orang, acara, dan dinamika kelompok.',monthlyCost:130000,influence:{people:.7,empathy:.5,confidence:.3}},
  mixed:{id:'mixed',name:'Circle campuran',summary:'Belum ada satu kelompok dominan. Nara bergerak antara teman kelas, lingkungan rumah, dan kegiatan yang berubah-ubah.',monthlyCost:110000,influence:{people:.25,confidence:.2,initiative:.2}}
};

const ADOLESCENCE_ACTIVITIES={
  making:{id:'maker_club',name:'Klub proyek praktis',summary:'Nara ingin punya tempat untuk membuat sesuatu yang hasilnya bisa disentuh dan diuji.',monthlyCost:260000,hours:5,influence:{making:2,problemSolving:1,initiative:1}},
  stories:{id:'creative_collective',name:'Komunitas cerita & kreatif',summary:'Nara ingin ikut ruang yang memberinya alasan untuk menulis, menggambar, tampil, atau menyampaikan ide.',monthlyCost:240000,hours:5,influence:{stories:2,expression:2,confidence:1}},
  people:{id:'student_group',name:'Kegiatan organisasi siswa',summary:'Nara tertarik ikut kegiatan yang membuatnya bertemu lebih banyak orang dan ikut mengatur sesuatu bersama.',monthlyCost:170000,hours:4,influence:{people:2,empathy:1,initiative:2}},
  systems:{id:'science_club',name:'Klub sains & sistem',summary:'Nara ingin punya tempat untuk mengejar pertanyaan yang lebih rumit daripada tugas sekolah biasa.',monthlyCost:280000,hours:5,influence:{systems:2,focus:1,problemSolving:2}}
};

const SECONDARY_EDUCATION_OPTIONS={
  local_secondary:{id:'local_secondary',name:'Sekolah Menengah Lingkungan',baseMonthlyCost:420000,summary:'Pilihan yang dekat, stabil, dan lebih ringan untuk keuangan keluarga.',commute:{family_home:0,rented_room:1,shared_house:1,outskirts_room:1},fit:['people','focus'],influence:{stability:2,people:1,focus:1}},
  city_academic:{id:'city_academic',name:'Sekolah Menengah Kota',baseMonthlyCost:760000,summary:'Pilihan akademik lebih luas dan jaringan lebih beragam, dengan biaya serta perjalanan yang lebih berat.',commute:{family_home:1,rented_room:0,shared_house:0,outskirts_room:2},fit:['systems','stories'],influence:{systems:2,focus:1,expression:1,pressure:1}},
  vocational_project:{id:'vocational_project',name:'Sekolah Vokasi Proyek',baseMonthlyCost:640000,summary:'Belajar lewat proyek, alat, praktik, dan masalah konkret yang harus diselesaikan.',commute:{family_home:1,rented_room:1,shared_house:1,outskirts_room:0},fit:['making'],influence:{making:2,problemSolving:2,initiative:1}},
  community_secondary:{id:'community_secondary',name:'Sekolah Komunitas Lanjutan',baseMonthlyCost:560000,summary:'Banyak kerja kelompok, proyek sosial, dan ruang untuk mencoba berbagai peran.',commute:{family_home:1,rented_room:1,shared_house:0,outskirts_room:1},fit:['people','stories'],influence:{people:2,empathy:1,expression:1,autonomy:1}}
};

registerContent('events',[
  {
    id:'adolescence_world_expands',type:'KELUARGA',title:'Dunia Nara Tidak Lagi Berhenti di Rumah',
    text:'Nara mulai lebih sering pulang membawa nama teman, rencana, candaan yang kalian tidak pahami, dan pendapat yang tidak selalu sama dengan rumah. Ini bukan menjauh secara otomatis—dunianya memang mulai membesar.',
    pool:'life',priority:67,weight:1,tags:['family','adolescence','legacy'],once:true,
    requirements:[{path:'family.adolescence.stageEventPending',op:'eq',value:'preteen'}],
    choices:[
      {label:'Dengar sebelum memberi aturan',hint:'Kedekatan & keterbukaan naik',effects:[{type:'adolescence_response',value:'listen'}],result:'Kalian membiarkan cerita Nara selesai dulu. Rumah tetap punya batas, tapi dia tahu suaranya tidak otomatis kalah oleh umur.'},
      {label:'Beri ruang dengan batas jelas',hint:'Autonomy naik · hubungan tetap terjaga',effects:[{type:'adolescence_response',value:'boundaries'}],result:'Kalian memperluas ruang geraknya sambil menjelaskan batas yang benar-benar penting.'},
      {label:'Awasi lebih ketat dulu',hint:'Risiko lebih terkendali · jarak bisa tumbuh',effects:[{type:'adolescence_response',value:'monitor'}],result:'Kalian memilih lebih banyak mengawasi. Hari-hari terasa lebih terkendali, tapi Nara mulai menyimpan beberapa hal untuk dirinya sendiri.'}
    ]
  },
  {
    id:'adolescence_activity_choice',type:'NARA',title:'Nara Menemukan Kegiatan yang Ingin Ia Kejar',
    text:'Untuk pertama kalinya, Nara datang bukan meminta kalian memilihkan kegiatan, tapi memberi tahu apa yang ingin ia coba. Minat itu lahir dari pengalaman bertahun-tahun, bukan dari menu karier.',
    pool:'life',priority:62,weight:1,tags:['family','adolescence','schooling','legacy'],once:true,
    requirements:[{path:'family.adolescence.activityReady',op:'truthy'}],
    choices:[
      {label:'Dukung pilihannya',hint:'Biaya rutin bertambah · minat & kepercayaan menguat',effects:[{type:'adolescence_activity_response',value:'support'}],result:'Kalian memberi ruang nyata untuk pilihan itu, termasuk waktu dan biaya yang menyertainya.'},
      {label:'Coba dulu dengan batas',hint:'Biaya lebih ringan · tetap ada ruang mencoba',effects:[{type:'adolescence_activity_response',value:'trial'}],result:'Kalian menyepakati masa coba. Nara tetap mendapat ruang, tapi keluarga tidak langsung mengikat ritme bulanan terlalu besar.'},
      {label:'Fokus sekolah dulu',hint:'Biaya aman · hubungan bisa lebih kaku',effects:[{type:'adolescence_activity_response',value:'decline'}],result:'Kalian menahan kegiatan itu demi ritme sekolah dan keuangan. Nara menurut, tapi pilihan itu tetap ia ingat.'}
    ]
  },
  {
    id:'adolescence_independent_commute',type:'KELUARGA',title:'Nara Minta Lebih Banyak Pergi Sendiri',
    text:'Jemputan dan perjalanan yang dulu sepenuhnya urusan orang tua mulai terasa terlalu sempit bagi Nara. Ia ingin mengurus sebagian perjalanan sekolah dan kegiatan sendiri.',
    pool:'life',priority:60,weight:1,tags:['family','adolescence','autonomy'],once:true,
    requirements:[{path:'family.adolescence.commuteReady',op:'truthy'}],
    choices:[
      {label:'Izinkan dengan kesepakatan',hint:'Waktu keluarga lebih longgar · autonomy naik',effects:[{type:'adolescence_commute_response',value:'allow'}],result:'Kalian membuat aturan praktis, lalu benar-benar memberi Nara kesempatan menjalankannya.'},
      {label:'Mulai dari rute tertentu',hint:'Autonomy tumbuh pelan · risiko lebih terkendali',effects:[{type:'adolescence_commute_response',value:'limited'}],result:'Nara mulai dari perjalanan yang paling familiar. Kalian tidak melepas sekaligus, tapi juga tidak menahannya di tempat.'},
      {label:'Belum, tetap antar-jemput',hint:'Lebih terkendali · beban waktu keluarga tetap tinggi',effects:[{type:'adolescence_commute_response',value:'deny'}],result:'Kalian belum siap melepas pola lama. Nara menerima keputusan itu tanpa berarti setuju sepenuhnya.'}
    ]
  },
  {
    id:'adolescence_secondary_path',type:'SEKOLAH & MASA DEPAN',title:'Nara Punya Pendapat tentang Sekolah Lanjutannya',
    text:'Pilihan sekolah lanjutan datang, tapi situasinya berbeda dari sekolah pertama: Nara sekarang punya minat, pengalaman, teman, dan alasan sendiri. Ia datang dengan preferensi, bukan kertas kosong.',
    pool:'life',priority:66,weight:1,tags:['family','adolescence','schooling','legacy'],once:true,
    requirements:[{path:'family.adolescence.secondaryReady',op:'truthy'}],
    choices:[
      {label:'Dukung pilihan Nara',hint:'Fit paling kuat · biaya/commute mengikuti pilihannya',effects:[{type:'adolescence_secondary_response',value:'support'}],result:'Kalian menempatkan preferensi Nara sebagai titik awal dan menerima trade-off yang ikut datang.'},
      {label:'Cari kompromi yang realistis',hint:'Fit sedang · pertimbangkan biaya & perjalanan',effects:[{type:'adolescence_secondary_response',value:'negotiate'}],result:'Kalian bicara sebagai satu keluarga: keinginan Nara tetap penting, tapi kondisi rumah juga nyata.'},
      {label:'Pilih jalur paling aman untuk keluarga',hint:'Biaya lebih stabil · autonomy & kedekatan bisa turun',effects:[{type:'adolescence_secondary_response',value:'control'}],result:'Kalian memilih jalur yang paling mudah dijaga dari sisi keluarga. Nara mengikutinya, meski bukan itu pilihan pertamanya.'}
    ]
  },
  {
    id:'adolescence_teen_shift',type:'KELUARGA',title:'Aturan Lama Mulai Perlu Dinegosiasikan',
    text:'Nara bukan lagi anak yang menerima semua aturan hanya karena orang tua bilang begitu. Jam pulang, teman, ruang pribadi, dan kegiatan sekarang lebih sering datang bersama pertanyaan: kenapa?',
    pool:'life',priority:61,weight:1,tags:['family','adolescence','relationship'],once:true,
    requirements:[{path:'family.adolescence.stageEventPending',op:'eq',value:'teen'}],
    choices:[
      {label:'Jelaskan alasan dan dengar balik',hint:'Hubungan lebih terbuka · negosiasi butuh waktu',effects:[{type:'adolescence_response',value:'listen'}],result:'Aturan rumah tidak hilang, tapi Nara tahu ia boleh mempertanyakan dan memahami alasannya.'},
      {label:'Bedakan batas penting dan fleksibel',hint:'Autonomy naik · struktur tetap ada',effects:[{type:'adolescence_response',value:'boundaries'}],result:'Kalian berhenti memperlakukan semua aturan sebagai hal yang sama pentingnya.'},
      {label:'Perketat sampai fase ini lewat',hint:'Lebih mudah dikontrol · jarak emosional bisa naik',effects:[{type:'adolescence_response',value:'monitor'}],result:'Kalian memilih kontrol lebih ketat. Konflik harian lebih mudah diputus, tapi percakapan jadi lebih pendek.'}
    ]
  },
  {
    id:'adolescence_late_teen_shift',type:'KELUARGA',title:'Masa Depan Nara Mulai Punya Suara Sendiri',
    text:'Pertanyaan tentang sekolah, kerja, kota, dan hidup setelah lulus mulai muncul. Kalian bisa memberi pengalaman dan batas nyata, tapi tidak lagi masuk akal memperlakukan masa depan Nara sebagai proyek orang tua.',
    pool:'life',priority:59,weight:1,tags:['family','adolescence','legacy'],once:true,
    requirements:[{path:'family.adolescence.stageEventPending',op:'eq',value:'late_teen'}],
    choices:[
      {label:'Tanya hidup seperti apa yang ia bayangkan',hint:'Arah pribadi & kedekatan menguat',effects:[{type:'adolescence_response',value:'listen'}],result:'Kalian mulai membicarakan masa depan sebagai sesuatu yang Nara akan jalani sendiri.'},
      {label:'Buat pagar realistis, bukan daftar perintah',hint:'Autonomy + stabilitas',effects:[{type:'adolescence_response',value:'boundaries'}],result:'Kalian bicara soal uang, risiko, dan pilihan tanpa mengubahnya menjadi satu jalur wajib.'},
      {label:'Arahkan ke jalur yang paling aman',hint:'Kontrol tinggi · legacy bisa terasa lebih sempit',effects:[{type:'adolescence_response',value:'monitor'}],result:'Kalian menekankan jalur yang dianggap paling aman. Nara memahami alasannya, tapi tidak semua bagian terasa seperti pilihannya.'}
    ]
  },
  {
    id:'adolescence_peer_tension',type:'KELUARGA',title:'Masalah Teman Tidak Bisa Diselesaikan Seperti Masalah Anak Kecil',
    text:'Ada konflik di circle Nara. Ia pulang lebih diam, tapi tidak langsung meminta solusi. Cara kalian masuk ke masalah ini menentukan apakah rumah terasa seperti tempat aman atau ruang pemeriksaan.',
    pool:'life',priority:54,weight:1,tags:['family','adolescence','relationship'],cooldownHours:2400,
    requirements:[{path:'family.adolescence.peerEventReady',op:'truthy'}],
    choices:[
      {label:'Tawarkan telinga, bukan solusi',hint:'Keterbukaan naik · Nara tetap memegang keputusan',effects:[{type:'adolescence_peer_response',value:'listen'}],result:'Kalian tidak buru-buru memperbaiki semuanya. Nara akhirnya bercerita lebih banyak karena tidak merasa hidupnya sedang diambil alih.'},
      {label:'Bantu menyusun pilihan',hint:'Dukungan kuat · autonomy tetap dijaga',effects:[{type:'adolescence_peer_response',value:'coach'}],result:'Kalian membantu Nara melihat pilihan tanpa memilihkan hasil akhirnya.'},
      {label:'Turun tangan langsung',hint:'Masalah cepat terkendali · kepercayaan bisa turun',effects:[{type:'adolescence_peer_response',value:'intervene'}],result:'Kalian mengambil alih sebagian masalah. Situasi lebih cepat tenang, tapi Nara merasa batas antara bantuan dan kontrol makin tipis.'}
    ]
  }
]);

registerContentPack('adolescence_independence',{name:'Adolescence & Independence',version:1,dependsOn:['life_legacy_foundation'],description:'Masa remaja Nara, peer circle, aktivitas pilihan sendiri, sekolah lanjutan, autonomy, dan hubungan orang tua-anak.',content:{events:['adolescence_world_expands','adolescence_activity_choice','adolescence_independent_commute','adolescence_secondary_path','adolescence_teen_shift','adolescence_late_teen_shift','adolescence_peer_tension']}});
