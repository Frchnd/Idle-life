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
  title:'Hari Pertama di Bengkel',text:'Pak Arman memasangkanmu dengan Dika. Bengkel lebih sibuk dari yang terlihat dari luar.',
  requirements:[{preset:'job_is',params:{job:'mechanic_junior'}},{preset:'job_work_min',params:{job:'mechanic_junior',count:1}},{preset:'flag_false',params:{flag:'firstWorkshopDay'}}],
  choices:[
    {label:'Dengarkan baik-baik',effects:[{type:'skill',skill:'mechanics',value:10},{type:'skill',skill:'learning',value:6},{type:'relationship',target:'pak_arman',value:4},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Pak Arman melihat kamu serius belajar.'}],result:'Kamu fokus memahami ritme bengkel.'},
    {label:'Coba menonjol sejak awal',effects:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'dika',value:-2},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Dika mulai menganggapmu sebagai pesaing.'}],result:'Kamu belajar cepat, tapi persaingan dengan Dika mulai terasa.'}
  ]
});

defineFromTemplate('events','first_day',{
  id:'first_store',name:'Hari Pertama di Toko',
  title:'Hari Pertama di Toko',text:'Maya langsung menaruhmu di depan pelanggan. Pekerjaan ini lebih banyak soal membaca orang daripada mengangkat barang.',
  requirements:[{preset:'job_is',params:{job:'store_clerk'}},{preset:'job_work_min',params:{job:'store_clerk',count:1}},{preset:'flag_false',params:{flag:'firstStoreDay'}}],
  choices:[
    {label:'Amati cara Maya melayani',effects:[{type:'skill',skill:'social',value:12},{type:'skill',skill:'learning',value:5},{type:'relationship',target:'maya',value:4},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true},{type:'recent',text:'Maya melihat kamu cepat menangkap cara menghadapi pelanggan.'}],result:'Kamu belajar dari cara Maya berbicara dan menyelesaikan masalah.'},
    {label:'Langsung coba sendiri',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:1},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true}],result:'Kamu memilih belajar lewat pengalaman langsung.'}
  ]
});
