const SCHOOLING_OPTIONS={
  neighborhood_public:{
    id:'neighborhood_public',name:'Sekolah Negeri Lingkungan',baseMonthlyCost:280000,
    summary:'Dekat dengan ritme lingkungan sehari-hari. Biaya lebih ringan dan waktu perjalanan cenderung pendek.',
    fit:'stability',tags:['local','balanced','community'],
    commute:{family_home:0,rented_room:1,shared_house:1,outskirts_room:1},
    influence:{stability:2,people:1,focus:1}
  },
  city_public:{
    id:'city_public',name:'Sekolah Kota Terbuka',baseMonthlyCost:520000,
    summary:'Pilihan belajar lebih beragam dan lingkungan lebih ramai, tapi perjalanan dan biaya rutin lebih terasa.',
    fit:'curiosity',tags:['city','exploration','academic'],
    commute:{family_home:1,rented_room:0,shared_house:0,outskirts_room:2},
    influence:{curiosity:2,systems:1,expression:1}
  },
  community_school:{
    id:'community_school',name:'Sekolah Komunitas Cendana',baseMonthlyCost:420000,
    summary:'Belajar banyak lewat proyek kecil, kelompok, dan hubungan dengan lingkungan sekitar.',
    fit:'social',tags:['community','project','social'],
    commute:{family_home:1,rented_room:1,shared_house:0,outskirts_room:1},
    influence:{people:2,initiative:1,empathy:1}
  }
};

const SCHOOL_SUPPORT_MODES={
  home_routine:{
    id:'home_routine',name:'Rutinitas Rumah',baseMonthlyCost:120000,pressure:1,workFatigue:1,
    summary:'Kalian lebih banyak menemani sendiri: murah, dekat, tapi mengambil ruang dari jadwal kerja.',
    influence:{focus:2,presence:2,stability:1}
  },
  balanced_support:{
    id:'balanced_support',name:'Dukungan Seimbang',baseMonthlyCost:260000,pressure:0,workFatigue:0,
    summary:'Sebagian tugas sekolah ditopang dari rumah, sebagian lewat kegiatan ringan di luar.',
    influence:{curiosity:1,focus:1,confidence:1,presence:1}
  },
  after_school:{
    id:'after_school',name:'Program Sepulang Sekolah',baseMonthlyCost:520000,pressure:-2,workFatigue:-1,
    summary:'Jadwal kerja lebih mudah diprediksi dan Nara punya ruang aktivitas tambahan, dengan biaya rutin lebih tinggi.',
    influence:{confidence:2,people:1,initiative:1}
  }
};

const CHILD_INTEREST_LABELS={
  making:{label:'Suka membuat & membongkar',summary:'Nara paling hidup ketika ada sesuatu yang bisa disentuh, dirakit, atau dicoba langsung.'},
  stories:{label:'Tertarik cerita & ekspresi',summary:'Nara mudah tertarik pada cerita, gambar, bahasa, dan cara menyampaikan ide.'},
  people:{label:'Tertarik pada orang & kelompok',summary:'Nara banyak belajar dari percakapan, kerja kelompok, dan membaca suasana sosial.'},
  systems:{label:'Suka pola & cara kerja',summary:'Nara sering tertarik pada aturan, urutan, angka, dan mengapa sesuatu bisa bekerja.'}
};

const CHILD_ABILITY_LABELS={
  focus:{label:'Makin tekun',summary:'Kalau sudah merasa cocok, Nara bisa bertahan lebih lama pada satu hal.'},
  expression:{label:'Ekspresif',summary:'Nara cukup mudah mengubah pikiran menjadi cerita, gambar, atau penjelasan.'},
  problemSolving:{label:'Pemecah masalah',summary:'Nara cenderung mencoba beberapa jalan sebelum meminta jawaban.'},
  initiative:{label:'Berani memulai',summary:'Nara makin sering bergerak dulu tanpa menunggu disuruh.'}
};

const CHILD_LEARNING_LABELS={
  hands_on:{label:'Belajar lewat mencoba',summary:'Pengalaman langsung lebih cepat menempel daripada penjelasan panjang.'},
  reflective:{label:'Suka memahami dulu',summary:'Nara cenderung mengamati, bertanya, lalu bergerak setelah punya gambaran.'},
  social:{label:'Belajar lewat orang lain',summary:'Diskusi, contoh, dan kerja bersama membuat proses belajar lebih hidup.'},
  self_directed:{label:'Mulai mengatur caranya sendiri',summary:'Nara makin nyaman mencari cara belajar yang terasa cocok untuk dirinya.'}
};

registerContent('events',[
  {
    id:'schooling_first_choice',type:'KELUARGA & SEKOLAH',title:'Sekolah Pertama Nara',
    text:'Nara sudah sampai pada usia ketika hari-harinya tidak lagi hanya berputar di rumah. Pilihan sekolah akan memengaruhi biaya, perjalanan, lingkungan sosial, dan cara kalian membagi waktu.',
    pool:'life',priority:68,weight:1,tags:['family','schooling','legacy'],once:true,
    requirements:[{path:'family.schooling.stage',op:'eq',value:'eligible'},{path:'family.schooling.choiceReady',op:'truthy'}],
    choices:[
      {label:'Sekolah Negeri Lingkungan',hint:'Biaya ringan · dekat lingkungan rumah',effects:[{type:'school_enroll',value:'neighborhood_public'}],result:'Kalian memilih sekolah yang dekat dengan ritme hidup sehari-hari.'},
      {label:'Sekolah Kota Terbuka',hint:'Biaya lebih tinggi · pilihan belajar lebih beragam',effects:[{type:'school_enroll',value:'city_public'}],result:'Kalian memilih lingkungan belajar yang lebih luas meski perjalanan dan biaya ikut naik.'},
      {label:'Sekolah Komunitas Cendana',hint:'Proyek & kelompok · biaya sedang',effects:[{type:'school_enroll',value:'community_school'}],result:'Kalian memilih sekolah dengan banyak kegiatan kelompok dan proyek kecil.'}
    ]
  },
  {
    id:'schooling_support_choice',type:'RITME KELUARGA',title:'Childcare Berubah Menjadi Dukungan Sekolah',
    text:'Jam sekolah membantu sebagian hari, tapi pekerjaan rumah, jemputan, dan waktu setelah sekolah tetap butuh pola yang jelas. Pola lama menjaga anak sekarang berubah menjadi cara mendukung sekolah.',
    pool:'life',priority:64,weight:1,tags:['family','schooling','routine'],once:true,
    requirements:[{path:'family.schooling.stage',op:'eq',value:'enrolled'},{path:'family.schooling.supportReady',op:'truthy'},{path:'family.schooling.supportMode',op:'eq',value:null}],
    choices:[
      {label:'Lebih banyak ditangani di rumah',hint:'Biaya rendah · waktu kerja lebih mudah terganggu',effects:[{type:'school_support',value:'home_routine'}],result:'Kalian memilih lebih banyak hadir langsung setelah sekolah dan menerima jadwal kerja yang sedikit lebih rapuh.'},
      {label:'Bagi dukungan secara seimbang',hint:'Biaya sedang · ritme paling netral',effects:[{type:'school_support',value:'balanced_support'}],result:'Kalian menyebar beban antara rumah dan dukungan luar agar tidak ada satu sisi yang mendominasi.'},
      {label:'Pakai program sepulang sekolah',hint:'Biaya tinggi · dua karier lebih mudah berjalan',effects:[{type:'school_support',value:'after_school'}],result:'Kalian membeli kepastian jadwal kerja dengan biaya bulanan yang lebih besar.'}
    ]
  },
  {
    id:'schooling_parenting_approach',type:'KELUARGA',title:'Cara Mendampingi Nara Mulai Punya Dampak Panjang',
    text:'Nara mulai punya tugas, teman, rasa suka, dan rasa tidak suka yang tidak selalu sama dengan kalian. Cara kalian merespons mulai membentuk bukan hanya nilai sekolah, tapi cara Nara melihat dirinya sendiri.',
    pool:'life',priority:58,weight:1,tags:['family','schooling','legacy','parenting'],once:true,
    requirements:[{path:'family.schooling.parentApproachReady',op:'truthy'}],
    choices:[
      {label:'Beri ruang mengeksplorasi',hint:'Kemandirian & rasa ingin tahu · hasil tidak selalu rapi',effects:[{type:'legacy_parenting_choice',value:'explore'}],result:'Kalian memilih menjadi pagar, bukan setir. Nara mendapat lebih banyak ruang untuk menemukan hal yang memang menarik baginya.'},
      {label:'Bangun rutinitas yang konsisten',hint:'Fokus & stabilitas · ruang spontan sedikit berkurang',effects:[{type:'legacy_parenting_choice',value:'structure'}],result:'Kalian membuat ritme belajar yang cukup jelas agar Nara punya pijakan tanpa mengatur semua detail.'},
      {label:'Dorong pencapaian lebih tinggi',hint:'Dorongan belajar kuat · tekanan bisa ikut tumbuh',effects:[{type:'legacy_parenting_choice',value:'achievement'}],result:'Kalian menaikkan ekspektasi. Itu bisa memperkuat dorongan belajar, tapi Nara juga mulai merasakan bahwa hasil punya bobot lebih besar.'}
    ]
  },
  {
    id:'schooling_first_year',type:'MILESTONE KELUARGA',title:'Satu Tahun Sekolah Mengubah Ritme Rumah',
    text:'Satu tahun berlalu sejak Nara mulai sekolah. Yang terlihat bukan cuma hasil belajar, tapi pola yang terbentuk: perjalanan, dukungan rumah, teman, dan bagaimana kalian bereaksi ketika sesuatu tidak berjalan mulus.',
    pool:'life',priority:55,weight:1,tags:['family','schooling','milestone','legacy'],once:true,
    requirements:[{path:'family.schooling.yearMilestonePending',op:'truthy'}],
    choices:[
      {label:'Tanya apa yang paling dia suka',hint:'Minat & suara Nara lebih terlihat',effects:[{type:'school_year_response',value:'listen'}],result:'Kalian menutup tahun pertama dengan mendengar apa yang paling membekas untuk Nara, bukan hanya apa yang tercetak di laporan.'},
      {label:'Lihat apa yang perlu diperbaiki',hint:'Fokus & disiplin naik · suasana sedikit lebih serius',effects:[{type:'school_year_response',value:'improve'}],result:'Kalian menjadikan tahun pertama sebagai bahan memperbaiki rutinitas berikutnya.'}
    ]
  }
]);

registerContentPack('life_legacy_foundation',{
  name:'Life & Legacy Foundation',version:1,dependsOn:['core_life'],
  description:'Schooling, perkembangan Nara, keputusan orang tua berjangka panjang, dan fondasi data generasi berikutnya.',
  content:{events:['schooling_first_choice','schooling_support_choice','schooling_parenting_approach','schooling_first_year']}
});
