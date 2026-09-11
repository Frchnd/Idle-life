function event(id,type,title,text,choices){ return {id,type,title,text,choices}; }
function workCount(state,job){ return state.career.jobWorkCounts?.[job]||0; }

function managerTargetForWorkplace(id){
  if(id==='sinar_jaya') return 'pak_arman';
  if(id==='serba_ada') return 'maya';
  if(id==='nusa_komputer') return 'nadia';
  if(id==='kafe_senja') return 'sari';
  if(id==='lintas_kota') return 'dimas';
  return null;
}

function basicSkillCount(state){
  return ['mechanics','social','technology','hospitality','logistics','learning'].filter(id=>getSkillTier(state.skills[id]||0).id!=='novice').length;
}

function housingDecisionEvent(state,revisit=false){
  return event(revisit?'housing_revisit':'housing_choice','ARAH HIDUP',revisit?'Pilihan Tempat Tinggal Muncul Lagi':'Mulai Memilih Tempat Tinggal Sendiri?',
    revisit
      ? 'Kondisi hidupmu berubah. Pilihan hunian di kota masih terbuka, dan setiap lingkungan punya biaya serta ritme yang berbeda.'
      : 'Penghasilanmu mulai lebih stabil. Sekarang pilihan tempat tinggal bukan cuma rumah keluarga atau satu kamar sewa—lokasi, biaya, privasi, dan waktu perjalanan mulai jadi bagian dari hidupmu.',[
      {label:'Lihat pilihan hunian',hint:'Kost pusat kota · rumah bersama · kontrakan tepi kota',effects:[{type:'flag',key:'housingOfferSeen',value:true},{type:'recent',text:'Pilihan tempat tinggal baru terbuka di profilmu.'}],result:'Pilihan hunian sekarang tersedia di KAMU. Kamu bisa pindah saat uang dan waktunya masuk akal.'},
      {label:'Tetap di rumah keluarga dulu',hint:'Biaya rendah · akses pusat kota lebih lambat',effects:[{type:'flag',key:'housingOfferSeen',value:true},{type:'relationship',target:'family',value:2},{type:'schedule',after:360,kind:'housing_revisit'}],result:'Kamu tetap bersama keluarga. Pasar hunian tetap bisa kamu lihat kapan pun setelah ini.'}
    ]);
}

function dueScheduledEvent(state){
  const idx=state.scheduled.findIndex(item=>item.at<=state.time.totalHours);
  if(idx<0) return null;
  const item=state.scheduled.splice(idx,1)[0];

  if(item.kind==='lestari_commitment_repay'){
    return event('lestari_commitment_repay','HUBUNGAN','Bu Lestari Mengembalikan Uangmu','Satu putaran dagangan selesai. Bu Lestari datang dengan catatan yang sama seperti saat meminjam dan mengembalikan uangmu, ditambah sedikit bagian dari hasil putaran itu.',[
      {label:'Terima Rp280.000',effects:[{type:'money',value:280000},{type:'relationship',target:'bu_lestari',value:2},{type:'recent',text:'Bu Lestari mengembalikan talangan tepat seperti yang dijanjikan.'}],result:'Urusan uang selesai dengan jelas. Kepercayaan kalian justru terasa lebih kuat karena nggak ada yang dibuat samar.'},
      {label:'Ambil pokoknya saja',hint:'Rp250rb kembali · sisanya untuk kios',effects:[{type:'money',value:250000},{type:'relationship',target:'bu_lestari',value:4},{type:'recent',text:'Kamu mengambil kembali modal pokok dan membiarkan sisanya tetap berputar di kios.'}],result:'Bu Lestari tidak banyak bicara, tapi ekspresinya cukup jelas menunjukkan dia akan mengingat pilihanmu.'}
    ]);
  }

  if(item.kind==='dika_return_favor'){
    return event('dika_return_favor','KONSEKUENSI','Dika Membalas Bantuanmu','Beberapa hari setelah kamu membantunya pulang terlambat, Dika menawarkan menutup satu shift supaya kamu bisa beristirahat.',[
      {label:'Terima bantuannya',hint:'8j · pulihkan kondisi',effects:[{type:'hours',value:8},{type:'fatigue',value:-35},{type:'relationship',target:'dika',value:4},{type:'recent',text:'Dika menutup satu shift untukmu.'}],result:'Kamu menerima bantuan Dika. Hubungan kalian mulai terasa seperti kerja sama, bukan sekadar persaingan.'},
      {label:'Tidak perlu',effects:[{type:'relationship',target:'dika',value:1}],result:'Kamu menolak dengan baik. Dika tetap mengingat bahwa utang bantuannya sudah dia tawarkan.'}
    ]);
  }

  if(item.kind==='store_customer_returns'){
    return event('store_customer_returns','KONSEKUENSI','Pelanggan Itu Kembali','Pelanggan yang dulu kamu tangani kembali ke toko dan langsung mencarimu. Mira memperhatikan itu.',[
      {label:'Layani sendiri',effects:[{type:'skill',skill:'social',value:15},{type:'relationship',target:'maya',value:4},{type:'store_progress',value:2},{type:'recent',text:'Seorang pelanggan mulai mengenalmu secara pribadi.'}],result:'Kamu menyelesaikan urusannya dengan lebih lancar. Mira mulai melihatmu sebagai orang yang bisa diandalkan.'},
      {label:'Serahkan ke rekan lain',effects:[{type:'skill',skill:'learning',value:4}],result:'Kamu memilih tidak mengambil semua perhatian. Pelanggan tetap terlayani.'}
    ]);
  }

  if(item.kind==='private_referral'){
    return event('private_referral','KONSEKUENSI','Nama Kamu Mulai Disebut','Pelanggan servis privatmu puas dan merekomendasikanmu ke temannya.',[
      {label:'Ambil pelanggan baru',effects:[{type:'opportunity',opportunity:{id:'private_repeat',name:'Servis dari Rekomendasi',summary:'4j · Rp300rb · pelanggan baru',expireAt:state.time.totalHours+72}},{type:'relationship',target:'rian',value:3},{type:'history',text:'Umur 18 · Mulai mendapat pelanggan dari rekomendasi.'}],result:'Pekerjaan sampinganmu mulai punya aliran pelanggan sendiri.'},
      {label:'Jangan dulu',effects:[],result:'Kamu memilih tidak memperbesar pekerjaan sampingan sekarang.'}
    ]);
  }

  if(item.kind==='tech_referral'){
    return event('tech_referral','KONSEKUENSI','Pekerjaan Kecil Membuka Pintu','Pemilik usaha yang kamu bantu merekomendasikanmu ke Nusa Komputer. Mereka sedang mencari asisten teknisi junior.',[
      {label:'Minta informasi lowongannya',effects:[{type:'opportunity',opportunity:{id:'it_job',name:'Asisten Teknisi IT',summary:'8j/hari · Rp140rb · jalur Teknologi'}},{type:'flag',key:'techJobSeen',value:true},{type:'recent',text:'Lowongan Nusa Komputer terbuka lewat rekomendasi klien.'}],result:'Kemampuan Teknologi yang tadinya cuma hobi sekarang membuka jalur kerja nyata.'},
      {label:'Tetap sebagai kerja sampingan',effects:[{type:'flag',key:'techJobSeen',value:true}],result:'Kamu memilih belum menjadikan Teknologi sebagai pekerjaan utama.'}
    ]);
  }

  if(item.kind==='mechanic_complaint'){
    return event('mechanic_complaint','KONSEKUENSI','Mobil Itu Kembali','Perbaikan sulit yang kamu kerjakan ternyata belum sepenuhnya menyelesaikan masalah. Pelanggan kembali ke bengkel.',[
      {label:'Perbaiki lagi tanpa biaya',hint:'2j · lebih melelahkan',effects:[{type:'hours',value:2},{type:'fatigue',value:5},{type:'skill',skill:'mechanics',value:12},{type:'relationship',target:'pak_arman',value:3},{type:'promotion',value:1},{type:'recent',text:'Kamu memperbaiki ulang pekerjaanmu tanpa melempar tanggung jawab.'}],result:'Kesalahan itu memakan waktu, tapi cara kamu menanganinya justru menambah kepercayaan Pak Surya.'},
      {label:'Minta Pak Surya mengambil alih',effects:[{type:'relationship',target:'pak_arman',value:-2}],result:'Masalah selesai, tetapi Pak Surya tahu kamu belum siap menangani semuanya sendiri.'}
    ]);
  }


  if(item.kind==='private_repeat_offer'){
    return event('private_repeat_offer','PELUANG SAMPINGAN','Pelanggan Lama Membawa Teman Lagi','Beberapa hari berlalu dan jaringan kecil pelangganmu masih hidup. Ada satu servis baru yang bisa kamu ambil tanpa meninggalkan pekerjaan utama.',[
      {label:'Buka jadwal servis',effects:[{type:'opportunity',opportunity:{id:'private_repeat',name:'Servis Rekomendasi',summary:'4j · Rp300rb · bisa dijalankan sebagai kerja sampingan',expireAt:state.time.totalHours+72}}],result:'Satu servis rekomendasi masuk ke peluang aktifmu.'},
      {label:'Lewatkan kali ini',effects:[],result:'Kamu membiarkan kesempatan itu lewat tanpa merusak jaringan pelangganmu.'}
    ]);
  }

  if(item.kind==='tech_freelance_offer'){
    return event('tech_freelance_offer','PELUANG SAMPINGAN','Ada Pesan Masuk ke Laptopmu','Seseorang membutuhkan bantuan setup, backup, dan perapihan komputer. Pekerjaan kecil ini bisa dikerjakan di luar jam kerja utama.',[
      {label:'Ambil detail pekerjaannya',effects:[{type:'opportunity',opportunity:{id:'tech_freelance',name:'Kerja Lepas Teknologi',summary:'4j · Rp220rb · dari laptop sendiri',expireAt:state.time.totalHours+72}}],result:'Pekerjaan lepas tersedia selama beberapa hari.'},
      {label:'Abaikan dulu',effects:[{type:'schedule',after:96,kind:'tech_freelance_offer'}],result:'Kamu memilih menjaga waktu luangmu. Peluang lain bisa muncul nanti.'}
    ]);
  }

  if(item.kind==='promo_side_offer'){
    return event('promo_side_offer','PELUANG SAMPINGAN','Shift Promosi Akhir Pekan','Sebuah brand lokal butuh orang untuk menjaga booth promosi selama beberapa jam. Kemampuan Sosialmu membuat pekerjaan seperti ini mulai datang dari mulut ke mulut.',[
      {label:'Ambil shift promosi',effects:[{type:'opportunity',opportunity:{id:'promo_side_job',name:'Shift Promosi',summary:'4j · Rp180rb · latih Sosial',expireAt:state.time.totalHours+72}}],result:'Shift promosi masuk ke peluang aktifmu.'},
      {label:'Lewatkan',effects:[{type:'schedule',after:120,kind:'promo_side_offer'}],result:'Kamu memilih tidak memenuhi setiap jam kosong dengan pekerjaan.'}
    ]);
  }

  if(item.kind==='move_out_reflection' && state.housing?.id!=='family_home'){
    return event('move_out_reflection','KEHIDUPAN','Malam Pertama di Tempat Baru',`${housingLabel(state)} terasa berbeda setelah hari mulai tenang. Ada kebebasan baru, tapi ritme lingkungan ini juga punya harga sendiri.`,[
      {label:'Telepon keluarga',effects:[{type:'relationship',target:'family',value:4},{type:'flag',key:'moveReflectionSeen',value:true},{type:'recent',text:'Kamu tetap menjaga hubungan keluarga setelah pindah.'}],result:'Tinggal terpisah tidak berarti hubungan harus menjauh.'},
      {label:'Nikmati ruang sendiri',effects:[{type:'skill',skill:'learning',value:5},{type:'flag',key:'moveReflectionSeen',value:true}],result:'Kamu mulai menikmati bahwa waktu dan ruangmu sekarang benar-benar milikmu.'}
    ]);
  }

  if(item.kind==='housing_revisit' && state.housing?.id==='family_home'){
    state.flags.housingRevisitSeen=true;
    return housingDecisionEvent(state,true);
  }

  if(item.kind==='job_restructure'){
    const currentId=workplaceIdFromState(state);
    if(!state.player.job || (item.workplace && currentId!==item.workplace)) return null;
    const company=currentWorkplaceSnapshot(state);
    const salary=state.player.salary||JOBS[state.player.job]?.salary||0;
    const manager=managerTargetForWorkplace(currentId);
    const choices=[];
    if(basicSkillCount(state)>=2){
      choices.push({label:'Tawarkan peran lebih luas',hint:'Pertahankan pekerjaan · hari kerja sedikit lebih berat',effects:[{type:'status_add',status:'peran_ganda'},{type:'career_restructure'},{type:'relationship',target:manager||'rian',value:4},{type:'recent',text:'Kamu mempertahankan posisi dengan mengambil tanggung jawab lintas fungsi.'}],result:'Kemampuan lintas bidang membuatmu lebih sulit digantikan, tapi beban kerja bertambah.'});
    }
    choices.push({label:'Terima kompensasi yang lebih ketat',hint:'Tetap bekerja · gaji turun sekitar 10%',effects:[{type:'salary_scale',value:.9},{type:'status_add',status:'gaji_ditekan'},{type:'career_restructure'}],result:'Pekerjaanmu aman untuk sekarang, tetapi kompensasinya ikut tertekan oleh kondisi perusahaan.'});
    choices.push({label:'Ambil pesangon dan pergi',hint:`+Rp${Math.round(salary*2).toLocaleString('id-ID')} · kembali mencari arah`,effects:[{type:'money',value:salary*2},{type:'job_clear'},{type:'career_restructure'},{type:'history',text:'Umur 18 · Keluar dari pekerjaan setelah restrukturisasi perusahaan.'}],result:'Kamu memilih keluar dengan pesangon daripada bertahan di tempat yang sedang memangkas biaya.'});
    return event('job_restructure','RISIKO KERJA','Posisimu Ikut Ditinjau',`${company?.name||'Tempat kerjamu'} sedang mengurangi biaya setelah beberapa minggu yang berat. Bukan semua orang akan kehilangan pekerjaan, tapi posisi kamu ikut dibahas.`,choices);
  }

  return null;
}

function getNextEvent(state){
  if(state.pendingEvent) return state.pendingEvent;

  const scheduled=dueScheduledEvent(state);
  if(scheduled) return scheduled;

  const dataEvent=nextDataEvent(state);
  if(dataEvent) return dataEvent;


  if(state.housing?.id!=='family_home' && state.player.money<housingPressureThreshold(state) && !state.flags.rentPressureSeen){
    return event('rent_pressure','KEUANGAN','Biaya Hidup Mulai Terasa',`${housingLabel(state)} memberi ritme hidup yang berbeda, tapi saldo mulai menipis. Biaya bulan berikutnya sekarang terasa seperti keputusan nyata.`,[
      {label:'Bertahan sendiri',hint:`Pertahankan biaya sekitar Rp${Math.round(housingCurrentMonthlyCost(state)/1000).toLocaleString('id-ID')}rb/bulan`,effects:[{type:'flag',key:'rentPressureSeen',value:true},{type:'recent',text:'Kamu memilih mempertahankan tempat tinggal sendiri meski cashflow ketat.'}],result:'Kamu mempertahankan kemandirian dan menerima tekanan keuangannya.'},
      {label:'Pulang ke keluarga sementara',hint:'Kembali ke biaya keluarga yang lebih ringan',effects:[{type:'flag',key:'rentPressureSeen',value:true},{type:'flag',key:'movedOut',value:false},{type:'housing',value:{id:'family_home',label:'Bersama keluarga',neighborhood:'Kampung Melati',monthlyCost:600000,baseMonthlyCost:600000,movedAt:null}},{type:'status_remove',status:'tinggal_sendiri'},{type:'status_remove',status:'tinggal_bersama_penghuni'},{type:'status_remove',status:'tinggal_tepi_kota'},{type:'status_add',status:'tinggal_bersama_keluarga'},{type:'relationship',target:'family',value:3},{type:'schedule',after:360,kind:'housing_revisit'},{type:'history',text:'Umur 18 · Kembali tinggal bersama keluarga untuk menstabilkan keuangan.'}],result:'Kamu pulang. Ini bukan reset—hanya perubahan strategi hidup karena kondisi keuangan.'}
    ]);
  }

  if(state.career.workCount>=6 && state.relationships.family>=55 && !state.flags.familyMilestoneSeen){
    return event('family_milestone','HUBUNGAN','Keluarga Membutuhkan Satu Hari yang Benar-benar Hadir','Ada urusan keluarga penting yang harus diselesaikan di jam kerja. Mereka tidak sekadar butuh uang—mereka butuh waktumu.',[
      {label:'Luangkan waktu untuk keluarga',hint:'6j · mengorbankan waktu produktif',effects:[{type:'hours',value:6},{type:'fatigue',value:5},{type:'relationship',target:'family',value:12},{type:'flag',key:'familyMilestoneSeen',value:true},{type:'flag',key:'familySupport',value:true},{type:'history',text:'Umur 18 · Memilih hadir untuk keluarga saat mereka benar-benar membutuhkan waktu.'}],result:'Hubungan ini sekarang lebih dari sekadar angka. Keluargamu tahu kamu bisa diandalkan ketika hal penting terjadi.'},
      {label:'Prioritaskan pekerjaan',hint:'+Rp80rb · hubungan sedikit menjauh',effects:[{type:'hours',value:4},{type:'money',value:80000},{type:'relationship',target:'family',value:-4},{type:'flag',key:'familyMilestoneSeen',value:true}],result:'Kamu memilih pekerjaan. Keputusan itu masuk akal, tapi keluarga mengingat bahwa kali ini kamu tidak bisa hadir.'}
    ]);
  }

  if(state.relationships.rian>=50 && !state.flags.rianMilestoneSeen){
    return event('rian_milestone','HUBUNGAN','Rian Minta Bantuan yang Tidak Bisa Dibayar','Rian mendapat shift yang tidak bisa ditinggalkan dan perlu seseorang menangani urusan penting untuk keluarganya. Kali ini dia tidak menawarkan uang atau pekerjaan sebagai gantinya.',[
      {label:'Bantu Rian',hint:'4j · tidak ada bayaran',effects:[{type:'hours',value:4},{type:'fatigue',value:5},{type:'relationship',target:'rian',value:12},{type:'flag',key:'rianMilestoneSeen',value:true},{type:'flag',key:'rianTrusted',value:true},{type:'history',text:'Umur 18 · Membantu Rian ketika tidak ada keuntungan langsung.'}],result:'Rian sekarang melihatmu sebagai orang yang bisa dipercaya, bukan cuma teman nongkrong atau koneksi kerja.'},
      {label:'Tidak bisa kali ini',effects:[{type:'relationship',target:'rian',value:-1},{type:'flag',key:'rianMilestoneSeen',value:true}],result:'Rian memahami. Hubungan kalian tetap baik, tapi tidak berubah menjadi kepercayaan yang lebih dalam.'}
    ]);
  }

  if(state.player.job && state.career.workCount>=10 && state.housing?.id==='family_home' && !state.flags.housingOfferSeen){
    return housingDecisionEvent(state,false);
  }

  if(state.player.job && state.career.workCount>=8 && (state.career.sideIncomeTotal||0)>=500000 && state.life?.trajectory==='open' && !state.flags.trajectoryChoiceSeen){
    return event('trajectory_choice','KEPUTUSAN BESAR','Dua Arah yang Sama-sama Masuk Akal','Pekerjaan utama mulai stabil, tapi pemasukan sampingan juga sudah terbukti nyata. Kamu tidak bisa memberi energi maksimal ke keduanya tanpa trade-off.',[
      {label:'Perkuat karier utama',hint:'Progres promosi lebih cepat saat bekerja',effects:[{type:'trajectory',value:'career'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'fokus_karier'},{type:'history',text:'Umur 18 · Memilih memperkuat karier utama sebagai arah hidup.'}],result:'Kamu memilih stabilitas dan kedalaman di pekerjaan utama. Progres karier akan lebih cepat saat bekerja.'},
      {label:'Bangun jalur mandiri juga',hint:'Kerja sampingan +15% dan lebih sering · kerja utama sedikit lebih melelahkan',effects:[{type:'trajectory',value:'independent'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'jalur_mandiri'},{type:'history',text:'Umur 18 · Memilih membangun jalur mandiri di samping pekerjaan utama.'}],result:'Kamu menerima hidup yang lebih padat demi membangun sumber penghasilan dan identitas di luar pekerjaan utama.'}
    ]);
  }


  if(state.business?.active){
    const b=ensureBusinessState(state);
    const meta=businessMeta(state);

    if(b.helperIssuePending){
      return event('business_helper_issue','USAHA KECIL','Ari Mengambil Keputusan Tanpa Menunggumu',`Saat kamu tidak ada, Ari menangani masalah pelanggan sendiri. Masalahnya selesai, tapi caranya tidak sepenuhnya sesuai standar yang biasa kamu pakai di ${b.name||'usahamu'}.`,[
        {label:'Dukung Ari dan evaluasi bersama',hint:'Kepercayaan naik · reputasi sedikit turun',effects:[{type:'business_helper_issue',backHelper:true},{type:'hours',value:2},{type:'history',text:'Umur 18 · Memilih membina helper setelah keputusan usaha yang kurang rapi.'}],result:'Kamu tidak mengambil alih semuanya. Ari tahu dia dipercaya, tapi juga paham standar yang harus dijaga.'},
        {label:'Ambil kembali kontrol',hint:'Reputasi lebih aman · kepercayaan Ari turun',effects:[{type:'business_helper_issue',backHelper:false},{type:'hours',value:3},{type:'fatigue',value:4}],result:'Kamu menyelesaikan masalah sendiri. Pelanggan tenang, tapi Ari jadi lebih berhati-hati mengambil keputusan tanpa izin.'}
      ]);
    }

    if(b.marketEventPending){
      const pressure=b.marketEventPending;
      const rival=pressure.competitor||'kompetitor lokal';
      const actionText={harga:'menurunkan harga untuk mengejar volume',kualitas:'menonjolkan kualitas dan testimoni',ekspansi:'menambah kapasitas dan mengejar lebih banyak pelanggan'}[pressure.action]||'mengubah strateginya';
      const choices=[
        {label:'Menang lewat kualitas',hint:'2j · reputasi naik · kapasitas sedikit lebih ketat sementara',effects:[{type:'hours',value:2},{type:'fatigue',value:3},{type:'business_market_strategy',strategy:'quality'},{type:'business_market_reputation',value:2}],result:'Kamu memilih tidak ikut perang harga. Fokusmu dua minggu ke depan adalah kualitas dan alasan pelanggan untuk tetap percaya.'},
        {label:'Turunkan harga sementara',hint:'Lebih mudah menarik permintaan · margin per pekerjaan turun',effects:[{type:'business_market_strategy',strategy:'price'}],result:'Kamu menerima margin lebih tipis untuk menjaga arus pelanggan selama tekanan kompetitor tinggi.'}
      ];
      if((b.retainedClients||0)>0){
        choices.push({label:'Lindungi pelanggan tetap',hint:'Pertumbuhan baru lebih lambat · pelanggan rutin lebih sulit direbut',effects:[{type:'business_market_strategy',strategy:'retention'},{type:'business_market_reputation',value:1}],result:'Kamu memilih melindungi basis pelanggan yang sudah percaya daripada mengejar semua permintaan baru.'});
      }else{
        choices.push({label:'Jangan bereaksi berlebihan',hint:'Tetap seimbang · tidak keluar waktu atau margin ekstra',effects:[{type:'business_market_strategy',strategy:'balanced'}],result:'Kamu memilih menjaga ritme usaha dan membiarkan pasar membuktikan apakah gerakan kompetitor benar-benar bertahan.'});
      }
      return event('business_market_move','PASAR LOKAL','Kompetitor Mengubah Permainan',`${rival} sedang ${actionText}. Permintaan pasar yang sama sekarang harus dibagi lebih keras; keputusanmu akan memengaruhi beberapa minggu usaha berikutnya.`,choices);
    }

    if(!b.helperActive && state.player.money>=350000 && (b.lossStreak||0)<2 && (b.reputation||0)>=42 && (b.growthStreak||0)>=2 && ((b.missedDemand||0)>=2 || (b.inquiries||0)>=Math.max(4,b.capacity||2)) && state.time.totalHours-(b.lastScaleDecisionAt||-999)>=12*24){
      return event('business_first_helper','KEPUTUSAN BESAR','Usahamu Mulai Melebihi Kapasitas Satu Orang',`${b.name||'Usahamu'} sudah punya cukup permintaan sehingga masalah utamanya bukan mencari pelanggan lagi, tapi siapa yang mengerjakan semuanya. Ari, kenalan dari jaringan lokal, bersedia membantu paruh waktu.`,[
        {label:'Ajak Ari bergabung',hint:'Rp350rb awal · upah Rp220rb/minggu · kapasitas naik',effects:[{type:'business_hire_helper'},{type:'flag',key:'businessScaleSeen',value:true}],result:'Usaha ini sekarang bukan lagi pekerjaan solo. Kapasitas naik, tapi setiap minggu ada orang lain yang harus dibayar dan dipercaya.'},
        {label:'Tetap kerja sendiri',hint:'Tidak ada biaya pegawai · kapasitas tetap terbatas',effects:[{type:'business_stamp',key:'lastScaleDecisionAt'},{type:'flag',key:'businessScaleSeen',value:true}],result:'Kamu mempertahankan usaha sebagai operasi satu orang. Margin lebih sederhana, tapi sebagian permintaan mungkin tetap harus dilepas.'}
      ]);
    }

    if(b.helperActive && !b.delegated && (b.helperWeeks||0)>=2 && state.time.totalHours-(b.lastDelegationDecisionAt||-999)>=14*24){
      return event('business_delegation','ARAH USAHA','Berapa Banyak yang Mau Kamu Serahkan ke Ari?',`Ari sudah beberapa minggu bekerja bersamamu. Kalau dia hanya membantu saat kamu hadir, kontrol tetap kuat tapi waktumu tetap tersedot. Kalau pekerjaan rutin mulai didelegasikan, kapasitas dan waktu membaik—namun kualitas tidak lagi sepenuhnya berada di tanganmu.`,[
        {label:'Delegasikan pekerjaan rutin',hint:'Kapasitas bisa naik · risiko kualitas bergantung ke Ari',effects:[{type:'business_delegate',value:true},{type:'flag',key:'businessDelegationSeen',value:true},{type:'history',text:'Umur 18 · Mulai mendelegasikan pekerjaan rutin usaha kepada Ari.'}],result:'Kamu mulai membangun sistem yang tidak selalu membutuhkan kehadiranmu. Sekarang kualitas usaha juga bergantung pada perkembangan Ari.'},
        {label:'Tetap awasi langsung',hint:'Kontrol lebih tinggi · waktumu tetap jadi bottleneck',effects:[{type:'business_delegate',value:false}],result:'Ari tetap membantu, tapi keputusan dan kualitas utama masih bergantung langsung padamu. Pilihan delegasi bisa kamu pertimbangkan lagi setelah beberapa minggu.'}
      ]);
    }

    if(b.helperActive && state.player.job && !state.flags.businessOwnerChoiceSeen && state.time.totalHours-(b.lastOwnerChoiceAt||-999)>=30*24 && (b.reputation||0)>=55 && (b.totalProfit||0)>=1500000 && (b.growthStreak||0)>=3 && (b.lastWeeklyProfit||0)>0){
      const salary=state.player.salary||JOBS[state.player.job]?.salary||0;
      return event('business_owner_choice','KEPUTUSAN BESAR','Usahamu Sudah Cukup Besar untuk Menuntut Pilihan',`${b.name||'Usahamu'} sekarang punya pelanggan, helper, dan beberapa minggu pertumbuhan. Untuk pertama kalinya masuk akal mempertimbangkan meninggalkan gaji tetap Rp${salary.toLocaleString('id-ID')}/hari dan menjadikan usaha sebagai pekerjaan utama.`,[
        {label:'Fokus penuh pada usaha',hint:'Lepas gaji tetap · kapasitas & reputasi usaha naik',effects:[{type:'business_owner_fulltime'},{type:'flag',key:'businessOwnerChoiceSeen',value:true}],result:'Kamu melepas keamanan gaji tetap. Mulai sekarang kalau usaha melemah, tidak ada perusahaan lain yang otomatis menutup lubangnya.'},
        {label:'Tetap jalankan keduanya',hint:'Pertahankan gaji · waktu dan energi tetap terbagi',effects:[{type:'business_stamp',key:'lastOwnerChoiceAt'}],result:'Kamu memilih model hybrid. Lebih aman secara pendapatan, tapi waktu tetap menjadi batas terbesar. Keputusan fokus penuh bisa muncul lagi nanti jika usaha terus tumbuh.'}
      ]);
    }
    if((b.lossStreak||0)<2 && (b.reputation||0)>=28 && (b.servedClients||b.clients||0)>=3 && (b.retainedClients||0)<3 && state.time.totalHours-(b.lastRetainerAt||-999)>=7*24){
      return event('business_retainer','USAHA KECIL','Pelanggan Meminta Jadwal Tetap',`Salah satu pelanggan ${b.name||'usahamu'} tidak ingin terus berebut slot. Mereka menawarkan pekerjaan rutin setiap minggu selama kualitas dan komunikasimu tetap terjaga.`,[
        {label:'Terima pelanggan tetap',hint:'Permintaan lebih stabil · tanggung jawab mingguan bertambah',effects:[{type:'business_retainer'},{type:'business_stamp',key:'lastRetainerAt'},{type:'history',text:`Umur 18 · ${b.name||'Usaha kecil'} mendapat pelanggan tetap.`}],result:'Usahamu sekarang punya permintaan yang lebih pasti. Tapi pelanggan rutin akan cepat terasa kalau jadwal dan kualitas mulai berantakan.'},
        {label:'Tetap fleksibel',hint:'Tidak ada kewajiban rutin',effects:[{type:'business_stamp',key:'lastRetainerAt'}],result:'Kamu memilih menjaga usaha tetap fleksibel dan tidak menjanjikan slot rutin.'}
      ]);
    }

    const reinvestCost=600000+(b.equipmentLevel||0)*250000;
    if((b.lossStreak||0)<2 && (b.missedDemand||0)>=2 && (b.equipmentLevel||0)<3 && state.player.money>=reinvestCost && state.time.totalHours-(b.lastReinvestOfferAt||-999)>=10*24){
      return event('business_capacity','USAHA KECIL','Permintaan Mulai Melebihi Kapasitas',`${b.name||'Usahamu'} menerima lebih banyak permintaan daripada yang sanggup ditangani. Upgrade peralatan senilai Rp${reinvestCost.toLocaleString('id-ID')} bisa menambah kapasitas, tapi uang itu tidak lagi tersedia sebagai bantalan hidup.`,[
        {label:'Investasikan ke peralatan',hint:`-Rp${reinvestCost.toLocaleString('id-ID')} · kapasitas mingguan naik`,effects:[{type:'business_reinvest'},{type:'business_stamp',key:'lastReinvestOfferAt'}],result:'Kamu memilih mengubah uang tunai menjadi kapasitas usaha. Mulai minggu berikutnya kamu bisa menangani lebih banyak pekerjaan.'},
        {label:'Jaga usaha tetap kecil',hint:'Tidak keluar modal · sebagian permintaan akan lewat',effects:[{type:'business_stamp',key:'lastReinvestOfferAt'}],result:'Kamu memilih tidak mengejar setiap permintaan. Usahamu tetap kecil, tapi cadangan uangmu aman.'}
      ]);
    }

    if((b.lossStreak||0)<2 && state.player.job && (b.retainedClients||0)>0 && (b.missedDemand||0)>=1 && state.time.totalHours-(b.lastConflictAt||-999)>=10*24){
      const company=currentWorkplaceSnapshot(state);
      const manager=company?managerTargetForWorkplace(company.id):null;
      const workSalary=state.player.salary||JOBS[state.player.job]?.salary||0;
      const protectJobEffects=[{type:'business_client_loss',value:1},{type:'business_stamp',key:'lastConflictAt'}];
      const serveEffects=[{type:'hours',value:4},{type:'fatigue',value:8},{type:'business_reputation',value:5},{type:'business_stamp',key:'lastConflictAt'}];
      if(manager) serveEffects.push({type:'relationship',target:manager,value:-2});
      return event('business_time_conflict','WAKTU','Pelanggan Tetap Bertabrakan dengan Pekerjaan Utama',`Pelanggan rutin ${b.name||'usahamu'} membutuhkan slot tambahan di hari kerja. Menjaga keduanya berarti ada pihak yang tidak mendapat waktu penuh darimu.`,[
        {label:'Prioritaskan pelanggan usaha',hint:'4j · reputasi usaha naik · hubungan kerja bisa sedikit terganggu',effects:serveEffects,result:'Kamu meluangkan waktu untuk usaha. Pelanggan melihat komitmenmu, tapi pekerjaan utama mulai merasakan bahwa perhatianmu terbagi.'},
        {label:'Jaga pekerjaan utama',hint:`Lindungi gaji Rp${workSalary.toLocaleString('id-ID')}/hari · satu pelanggan tetap bisa pergi`,effects:protectJobEffects,result:'Kamu menjaga pekerjaan utama sebagai fondasi. Usahamu kehilangan sebagian kepastian yang sudah dibangun.'}
      ]);
    }
  }


  if(state.business?.active && (state.business.lossStreak||0)>=2){
    return event('business_losses','USAHA KECIL','Usahamu Dua Minggu Berturut-turut Merugi',`${state.business.name||'Usaha kecilmu'} belum menemukan ritme yang sehat. Menutupnya sekarang berarti mengakui kerugian lebih cepat; mempertahankannya berarti memberi waktu dan tenaga lagi.`,[
      {label:'Urus lebih serius',hint:'4j · tambah reputasi · pertahankan usaha',effects:[{type:'hours',value:4},{type:'fatigue',value:8},{type:'business_recover'},{type:'recent',text:'Kamu turun tangan lebih serius untuk memperbaiki usaha kecilmu.'}],result:'Kamu memilih memberi usaha ini satu kesempatan lagi. Aktivitas Urus Usaha akan membantu reputasi dan klien.'},
      {label:'Tutup usaha',hint:'Hentikan profit/rugi mingguan · karier dan skill tetap',effects:[{type:'business_close'},{type:'history',text:'Umur 18 · Menutup usaha kecil setelah beberapa minggu merugi.'}],result:'Kamu menutup usaha sebelum kerugiannya menjadi lubang yang lebih besar. Skill, kontak, dan pengalaman yang didapat tetap menjadi milikmu.'}
    ]);
  }


  if(state.player.job && !(state.career.salaryNegotiatedJobs||[]).includes(state.player.job)){
    const company=currentWorkplaceSnapshot(state);
    const count=workCount(state,state.player.job);
    if(company && count>=8 && company.health>=58 && company.cashReserve>=42){
      const manager=managerTargetForWorkplace(company.id);
      const salary=state.player.salary||JOBS[state.player.job]?.salary||0;
      const raise=Math.max(10000,Math.round((salary*.12)/5000)*5000);
      return event('salary_talk','KARIER','Waktunya Membahas Kompensasi',`${company.name} sedang cukup sehat dan kamu sudah punya jam terbang. Ini salah satu momen ketika meminta sesuatu dari perusahaan masuk akal—tapi pilihanmu tidak harus selalu uang.`,[
        {label:'Minta kenaikan gaji',hint:`Target sekitar +Rp${raise.toLocaleString('id-ID')}/hari`,effects:[{type:'salary_delta',value:raise},{type:'salary_negotiated'},{type:'relationship',target:manager||'rian',value:-1},{type:'history',text:'Umur 18 · Berhasil menegosiasikan kompensasi yang lebih tinggi.'}],result:'Perusahaan menyetujui kenaikan yang masih masuk akal terhadap kondisi usahanya.'},
        {label:'Minta jadwal lebih fleksibel',hint:'Gaji tetap · kerja utama sedikit lebih ringan',effects:[{type:'status_add',status:'jam_lebih_fleksibel'},{type:'salary_negotiated'},{type:'relationship',target:manager||'rian',value:2}],result:'Kamu menukar kesempatan kenaikan langsung dengan ritme kerja yang lebih fleksibel.'},
        {label:'Jangan dorong sekarang',effects:[{type:'salary_negotiated'},{type:'relationship',target:manager||'rian',value:1}],result:'Kamu memilih menjaga posisi dan tidak menegosiasikan apa pun sekarang.'}
      ]);
    }
  }

  if(state.life?.trajectory==='independent' && !state.business?.active && (state.career.sideIncomeTotal||0)>=900000 && strongestBusinessSector(state) && !state.flags.businessPathSeen){
    const sector=strongestBusinessSector(state);
    const meta=BUSINESS_META[sector];
    return event('business_path','ARAH HIDUP','Kerja Sampinganmu Mulai Terlihat Seperti Usaha',`Pemasukan sampinganmu sudah berulang, bukan lagi kebetulan satu-dua kali. Dengan modal Rp850rb, ${meta?.label?.toLowerCase()||'jasa kecil'} bisa mulai diperlakukan sebagai usaha sungguhan.`,[
      {label:'Siapkan usaha kecil',hint:'Modal Rp850rb · profit mingguan mengikuti permintaan pasar',effects:[{type:'flag',key:'businessPathSeen',value:true},{type:'opportunity',opportunity:{id:'start_business',name:`Mulai ${meta?.name||'Usaha Kecil'}`,summary:'Modal Rp850rb · usaha tetap berjalan bersama karier utama'}}],result:'Opsi membuka usaha sekarang tersedia. Kamu tetap boleh mempertahankan pekerjaan utama.'},
      {label:'Tetap sebagai pekerja lepas',effects:[{type:'flag',key:'businessPathSeen',value:true}],result:'Kamu memilih fleksibilitas kerja lepas tanpa biaya dan tanggung jawab usaha formal.'}
    ]);
  }


  if(state.player.statuses.includes('utang_keluarga') && state.player.money>=500000 && !state.flags.familyDebtRepaySeen){
    return event('repay_family_ready','KEUANGAN','Kamu Sudah Bisa Membayar Kembali','Tabunganmu sudah cukup untuk mengembalikan uang yang pernah kamu pinjam dari keluarga.',[
      {label:'Siapkan pelunasan',hint:'Rp300rb',effects:[{type:'flag',key:'familyDebtRepaySeen',value:true},{type:'opportunity',opportunity:{id:'repay_family',name:'Lunasi Utang Keluarga',summary:'Rp300rb · hilangkan beban utang'}}],result:'Pelunasan sekarang tersedia sebagai keputusan finansial.'},
      {label:'Tahan uangnya dulu',effects:[{type:'flag',key:'familyDebtRepaySeen',value:true}],result:'Kamu memilih menjaga kas untuk sekarang. Utangnya tetap ada.'}
    ]);
  }

  if(state.player.statuses.includes('utang_rian') && state.player.money>=500000 && !state.flags.rianDebtRepaySeen){
    return event('repay_rian_ready','KEUANGAN','Utang ke Rian Masih Ada','Kondisi keuanganmu sudah membaik. Kamu sekarang bisa mengembalikan uang Rian tanpa menghabiskan seluruh saldo.',[
      {label:'Siapkan pelunasan',hint:'Rp300rb',effects:[{type:'flag',key:'rianDebtRepaySeen',value:true},{type:'opportunity',opportunity:{id:'repay_rian',name:'Lunasi Utang Rian',summary:'Rp300rb · pulihkan beban hubungan'}}],result:'Pelunasan sekarang tersedia.'},
      {label:'Belum sekarang',effects:[{type:'flag',key:'rianDebtRepaySeen',value:true}],result:'Kamu menunda. Rian tidak menagih, tapi utang itu belum hilang.'}
    ]);
  }

  // Perkembangan hidup NPC sekarang ditangani Simulation Engine mingguan.

  if(state.career.changeSearchCount>state.career.changeHandledCount){
    const choices=[];
    const isMechanic=['mechanic_junior','mechanic_senior','mechanic_diagnostic'].includes(state.player.job);
    const isStore=['store_clerk','store_supervisor','operations_coordinator'].includes(state.player.job);
    const isTech=['it_assistant','network_technician'].includes(state.player.job);
    const isCafe=['cafe_crew','cafe_lead'].includes(state.player.job);
    const isLogistics=['warehouse_staff','dispatch_coordinator'].includes(state.player.job);
    if(!isMechanic && getSkillTier(state.skills.mechanics).id!=='novice') choices.push({label:'Lihat jalur bengkel',hint:'Skill Mekanikmu sudah cukup untuk kembali masuk.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_mechanic',name:'Beralih ke Jalur Bengkel',summary:'Pakai skill Mekanik yang sudah kamu bangun'}}],result:'Jalur bengkel masuk ke peluang aktifmu.'});
    if(!isStore && getSkillTier(state.skills.social).id!=='novice') choices.push({label:'Lihat jalur toko',hint:'Skill Sosialmu sudah cukup untuk pindah.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_store',name:'Beralih ke Jalur Pelayanan',summary:'Pakai kemampuan Sosial sebagai karier utama'}}],result:'Jalur pelayanan masuk ke peluang aktifmu.'});
    if(!isTech && getSkillTier(state.skills.technology).id!=='novice') choices.push({label:'Lihat jalur teknologi',hint:'Teknologi sudah cukup kuat untuk dicoba sebagai pekerjaan utama.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_it',name:'Beralih ke Jalur Teknologi',summary:'Jadikan Teknologi pekerjaan utama'}}],result:'Jalur Teknologi masuk ke peluang aktifmu.'});
    if(!isCafe && getSkillTier(state.skills.hospitality||0).id!=='novice') choices.push({label:'Lihat jalur kafe',hint:'Pengalaman Hospitality-mu bisa dibawa ke Kafe Senja.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_cafe',name:'Beralih ke Kafe Senja',summary:'Jadikan Hospitality pekerjaan utama'}}],result:'Jalur Kafe Senja masuk ke peluang aktifmu.'});
    if(!isLogistics && getSkillTier(state.skills.logistics||0).id!=='novice') choices.push({label:'Lihat jalur logistik',hint:'Skill Logistikmu sudah cukup untuk dicoba sebagai pekerjaan utama.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_logistics',name:'Beralih ke Logistik',summary:'Jadikan Logistik pekerjaan utama'}}],result:'Jalur logistik masuk ke peluang aktifmu.'});
    choices.push({label:'Belum ada yang terasa tepat',effects:[{type:'career_search_handled'}],result:'Kamu tetap di pekerjaan sekarang. Tidak ada penalti karena sekadar melihat pilihan lain.'});
    return event('career_crossroads','ARAH HIDUP','Kamu Melihat ke Luar Jalur Sekarang','Beberapa jam mencari informasi membuatmu sadar bahwa kemampuan yang dibangun di luar pekerjaan utama bisa dipakai untuk benar-benar pindah arah.',choices);
  }

  if(state.skills.technology>=60 && !state.assets.laptop && !state.flags.laptopOfferSeen){
    return event('laptop_offer','KEPUTUSAN FINANSIAL','Laptop Bekas yang Masih Layak','Rian menemukan laptop bekas yang cukup untuk belajar dan mengambil pekerjaan teknologi ringan. Harganya Rp750rb—cukup besar dibanding tabunganmu sekarang.',[
      {label:'Simpan peluang pembelian',hint:'Rp750rb · investasi untuk kerja sampingan Teknologi',effects:[{type:'flag',key:'laptopOfferSeen',value:true},{type:'opportunity',opportunity:{id:'buy_laptop',name:'Beli Laptop Bekas',summary:'Rp750rb · membuka kerja lepas Teknologi'}}],result:'Laptop itu sekarang menjadi pilihan investasi, bukan kewajiban.'},
      {label:'Jangan beli',effects:[{type:'flag',key:'laptopOfferSeen',value:true}],result:'Kamu menjaga tabunganmu. Teknologi tetap bisa dipelajari tanpa membeli aset sekarang.'}
    ]);
  }

  if(getSkillTier(state.skills.social).id!=='novice' && !state.flags.firstPromoSideSeen){
    return event('promo_side_intro','PELUANG SAMPINGAN','Mira Menyebut Shift Promosi Lepas','Ada event promosi akhir pekan yang mencari orang untuk menghadapi pengunjung. Ini bukan pekerjaan tetap dan bisa diambil meski karier utamamu ada di bidang lain.',[
      {label:'Minta kontaknya',effects:[{type:'flag',key:'firstPromoSideSeen',value:true},{type:'opportunity',opportunity:{id:'promo_side_job',name:'Shift Promosi',summary:'4j · Rp180rb · kerja sampingan Sosial',expireAt:state.time.totalHours+72}}],result:'Kerja sampingan Sosial sekarang tersedia.'},
      {label:'Tidak tertarik',effects:[{type:'flag',key:'firstPromoSideSeen',value:true}],result:'Kamu memilih tidak memenuhi semua peluang dengan kerja tambahan.'}
    ]);
  }

  if(state.player.money<0 && !state.flags.moneyPressureSeen){
    return event('money_pressure','KEUANGAN','Uangmu Sudah Habis','Pengeluaran hidup membuat saldo masuk negatif. Kamu masih bisa lanjut, tapi sekarang setiap pilihan uang punya tekanan yang berbeda.',[
      {label:'Pinjam dari keluarga',hint:'+Rp300rb · hubungan keluarga turun',effects:[{type:'money',value:300000},{type:'relationship',target:'family',value:-6},{type:'status_add',status:'utang_keluarga'},{type:'flag',key:'moneyPressureSeen',value:true},{type:'history',text:'Umur 18 · Meminjam uang dari keluarga.'}],result:'Kamu punya ruang bernapas, tapi utang itu sekarang menjadi bagian dari hidupmu.'},
      {label:'Pinjam dari Rian',hint:'+Rp300rb · hubungan dengan Rian terpengaruh',effects:[{type:'money',value:300000},{type:'relationship',target:'rian',value:-6},{type:'status_add',status:'utang_rian'},{type:'flag',key:'moneyPressureSeen',value:true},{type:'history',text:'Umur 18 · Meminjam uang dari Rian.'}],result:'Rian membantu, tetapi hubungan kalian sekarang punya beban baru.'},
      {label:'Cari jalan sendiri',effects:[{type:'flag',key:'moneyPressureSeen',value:true}],result:'Kamu memilih tidak berutang pada siapa pun. Tekanan keuangan tetap ada.'}
    ]);
  }

  if(state.player.job==='it_assistant' && workCount(state,'it_assistant')>=1 && !state.flags.firstTechDay){
    return event('first_tech_day','HARI PERTAMA','Hari Pertama di Nusa Komputer','Nadia memberimu meja kerja kecil dan daftar masalah pelanggan. Ternyata pekerjaan IT bukan cuma soal komputer—kamu juga harus menjelaskan masalah ke orang yang tidak paham teknis.',[
      {label:'Fokus menyelesaikan masalah',effects:[{type:'skill',skill:'technology',value:18},{type:'relationship',target:'nadia',value:2},{type:'tech_progress',value:1},{type:'flag',key:'firstTechDay',value:true}],result:'Kamu cepat masuk ke pekerjaan teknis dan membuktikan dasar kemampuanmu.'},
      {label:'Fokus memahami pelanggan',effects:[{type:'skill',skill:'technology',value:10},{type:'skill',skill:'social',value:10},{type:'relationship',target:'nadia',value:4},{type:'tech_progress',value:1},{type:'flag',key:'firstTechDay',value:true}],result:'Kamu belajar bahwa solusi yang benar tetap harus bisa dijelaskan dengan sederhana.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && workCount(state,'mechanic_junior')>=3 && !state.flags.dikaHelpSeen){
    return event('dika_help','HUBUNGAN','Dika Belum Selesai','Bengkel hampir tutup, tapi Dika masih punya satu kendaraan yang belum selesai.',[
      {label:'Bantu Dika',hint:'2j · lebih melelahkan',effects:[{type:'hours',value:2},{type:'fatigue',value:5},{type:'relationship',target:'dika',value:8},{type:'flag',key:'dikaHelpSeen',value:true},{type:'flag',key:'helpedDika',value:true},{type:'schedule',after:48,kind:'dika_return_favor'},{type:'recent',text:'Kamu pulang terlambat untuk membantu Dika.'}],result:'Dika tidak banyak bicara, tetapi jelas menghargainya.'},
      {label:'Pulang',effects:[{type:'flag',key:'dikaHelpSeen',value:true},{type:'relationship',target:'dika',value:-1}],result:'Kamu memilih menjaga tenagamu dan pulang.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && workCount(state,'mechanic_junior')>=5 && !state.flags.difficultRepairSeen){
    const canHandle=(state.skills.mechanics||0)>=70 && getCondition(state.player.fatigue).id!=='exhausted';
    return event('difficult_repair','PEKERJAAN','Perbaikan Sulit','Pak Surya memberimu pekerjaan yang sedikit di atas kemampuanmu sekarang. Ini kesempatan belajar, tapi kesalahan akan terlihat.',[
      {label:'Coba tangani sendiri',hint:canHandle?'Risiko masih masuk akal.':'Risikonya tinggi dengan kondisi/skill sekarang.',effects:canHandle?[{type:'skill',skill:'mechanics',value:25},{type:'relationship',target:'pak_arman',value:5},{type:'promotion',value:4},{type:'flag',key:'difficultRepairSeen',value:true},{type:'recent',text:'Kamu menangani perbaikan sulit sendiri.'}]:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'pak_arman',value:-1},{type:'schedule',after:24,kind:'mechanic_complaint'},{type:'flag',key:'difficultRepairSeen',value:true},{type:'recent',text:'Kamu mengambil perbaikan sulit meski belum benar-benar siap.'}],result:canHandle?'Kamu menyelesaikannya sendiri. Pak Surya mulai melihatmu berbeda.':'Kamu menyelesaikannya, tapi belum yakin hasilnya benar-benar beres.'},
      {label:'Minta arahan Pak Surya',effects:[{type:'skill',skill:'mechanics',value:12},{type:'relationship',target:'pak_arman',value:4},{type:'promotion',value:2},{type:'flag',key:'difficultRepairSeen',value:true}],result:'Kamu mengurangi risiko dan belajar langsung dari pengalaman Pak Surya.'},
      {label:'Minta bantuan Dika',effects:[{type:'skill',skill:'mechanics',value:14},{type:'relationship',target:'dika',value:state.flags.helpedDika?4:0},{type:'flag',key:'difficultRepairSeen',value:true}],result:state.flags.helpedDika?'Dika membalas bantuanmu tanpa banyak komentar.':'Dika membantu, tapi hubungan kalian belum cukup dekat untuk terasa seperti kerja sama.'}
    ]);
  }

  if(state.player.job==='store_clerk' && workCount(state,'store_clerk')>=3 && !state.flags.storeCustomerSeen){
    return event('store_customer','PEKERJAAN','Pelanggan yang Sulit','Seorang pelanggan marah karena harga di rak berbeda dengan harga di kasir. Mira sedang sibuk di belakang.',[
      {label:'Tangani sendiri',hint:'Kemampuan Sosial membantu.',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:3},{type:'store_progress',value:2},{type:'flag',key:'storeCustomerSeen',value:true},{type:'schedule',after:48,kind:'store_customer_returns'},{type:'recent',text:'Kamu menyelesaikan masalah pelanggan tanpa memanggil Mira.'}],result:'Percakapannya tidak nyaman, tapi kamu berhasil menenangkan situasi.'},
      {label:'Panggil Mira',effects:[{type:'skill',skill:'learning',value:6},{type:'relationship',target:'maya',value:1},{type:'store_progress',value:1},{type:'flag',key:'storeCustomerSeen',value:true}],result:'Mira mengambil alih dan kamu memperhatikan bagaimana dia menyelesaikannya.'}
    ]);
  }

  if(state.player.job==='store_clerk' && workCount(state,'store_clerk')>=6 && !state.flags.storeRushSeen){
    return event('store_rush','PEKERJAAN','Toko Mendadak Penuh','Dua rekan kerja tidak masuk dan antrean mulai panjang. Mira harus memilih siapa yang memegang lantai toko.',[
      {label:'Ambil kendali di depan',hint:'Lebih melelahkan · progres karier tinggi',effects:[{type:'hours',value:2},{type:'fatigue',value:8},{type:'skill',skill:'social',value:20},{type:'relationship',target:'maya',value:5},{type:'store_progress',value:4},{type:'flag',key:'storeRushSeen',value:true}],result:'Kamu menjaga situasi tetap terkendali. Mira melihatmu bukan lagi sekadar pegawai baru.'},
      {label:'Tetap di tugas biasa',effects:[{type:'skill',skill:'social',value:8},{type:'store_progress',value:1},{type:'flag',key:'storeRushSeen',value:true}],result:'Kamu membantu sebisanya tanpa mengambil tanggung jawab ekstra.'}
    ]);
  }

  if(state.player.job==='it_assistant' && workCount(state,'it_assistant')>=3 && !state.flags.techDeadlineSeen){
    return event('tech_deadline','PEKERJAAN','Klien Butuh Selesai Hari Ini','Satu komputer kantor harus kembali berfungsi sebelum sore. Masalahnya belum jelas dan waktumu terbatas.',[
      {label:'Diagnosa sampai ketemu akar masalah',hint:'Lebih melelahkan · Teknologi meningkat besar',effects:[{type:'hours',value:2},{type:'fatigue',value:8},{type:'skill',skill:'technology',value:24},{type:'relationship',target:'nadia',value:4},{type:'tech_progress',value:3},{type:'flag',key:'techDeadlineSeen',value:true}],result:'Kamu berhasil menemukan masalah yang tidak kelihatan dari awal. Nadia mulai percaya pada penilaian teknismu.'},
      {label:'Gunakan solusi cepat yang aman',effects:[{type:'skill',skill:'technology',value:12},{type:'tech_progress',value:1},{type:'flag',key:'techDeadlineSeen',value:true}],result:'Komputer kembali bisa dipakai. Solusinya bukan yang paling elegan, tapi kebutuhan klien terpenuhi.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && state.skills.social>=100 && !state.flags.crossMechanicSocialSeen){
    return event('mechanic_social_cross','KOMBINASI SKILL','Pelanggan Tidak Percaya','Seorang pelanggan tidak yakin dengan penjelasan biaya perbaikan. Pak Surya sedang menangani mobil lain.',[
      {label:'Jelaskan masalahnya sendiri',hint:'Sosial Dasar membuka pilihan ini.',effects:[{type:'skill',skill:'social',value:12},{type:'relationship',target:'pak_arman',value:4},{type:'promotion',value:3},{type:'flag',key:'crossMechanicSocialSeen',value:true},{type:'recent',text:'Kamu menangani pelanggan sulit tanpa bantuan Pak Surya.'}],result:'Kemampuan sosialmu membuat skill mekanikmu lebih berguna. Pelanggan akhirnya memahami keputusan perbaikan.'},
      {label:'Tunggu Pak Surya',effects:[{type:'flag',key:'crossMechanicSocialSeen',value:true}],result:'Kamu menunggu Pak Surya. Masalah selesai, tapi kamu tidak mengambil peran lebih jauh.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.skills.technology>=100 && !state.flags.crossStoreTechSeen){
    return event('store_tech_cross','KOMBINASI SKILL','Kasir Mendadak Bermasalah','Sistem kasir berhenti merespons saat toko sedang ramai. Teknisi baru bisa datang beberapa jam lagi.',[
      {label:'Coba periksa sendiri',hint:'Teknologi Dasar membuka pilihan ini.',effects:[{type:'skill',skill:'technology',value:18},{type:'relationship',target:'maya',value:5},{type:'store_progress',value:3},{type:'flag',key:'crossStoreTechSeen',value:true},{type:'recent',text:'Kemampuan teknologimu menyelamatkan operasional toko.'}],result:'Kamu menemukan masalah sederhana pada koneksi perangkat dan membuat kasir berjalan lagi.'},
      {label:'Jalankan kasir manual',effects:[{type:'skill',skill:'social',value:8},{type:'flag',key:'crossStoreTechSeen',value:true}],result:'Kamu menjaga pelanggan tetap tenang sampai teknisi datang.'}
    ]);
  }

  if(state.skills.technology>=25 && !state.flags.techCourseSeen){
    return event('tech_course','PELUANG BELAJAR','Kelas Komputer Malam','Kamu menemukan kelas komputer dasar yang lebih terstruktur daripada belajar sendiri. Biayanya cukup terasa untuk kondisi keuanganmu sekarang.',[
      {label:'Simpan informasinya',hint:'Biaya Rp250rb · 8j',effects:[{type:'flag',key:'techCourseSeen',value:true},{type:'opportunity',opportunity:{id:'tech_course',name:'Kelas Komputer Dasar',summary:'8j · Rp250rb · peningkatan Teknologi besar'}}],result:'Kelas itu sekarang tersedia sebagai peluang.'},
      {label:'Belajar sendiri dulu',effects:[{type:'flag',key:'techCourseSeen',value:true}],result:'Kamu memilih tidak mengeluarkan uang sekarang.'}
    ]);
  }

  if(getSkillTier(state.skills.mechanics).id!=='novice' && state.relationships.rian>=20 && !state.flags.privateIntroSeen){
    return event('private_intro','PELUANG','Rian Punya Kenalan','Rian kenal seseorang yang butuh servis sederhana. Dia mulai percaya kemampuanmu cukup untuk mengerjakannya di luar bengkel.',[
      {label:'Minta detailnya',effects:[{type:'flag',key:'privateIntroSeen',value:true},{type:'opportunity',opportunity:{id:'private_repair',name:'Servis Privat',summary:'4j · Rp350rb · dari Rian',expireAt:state.time.totalHours+48}}],result:'Pekerjaan itu tersedia selama dua hari.'},
      {label:'Belum sekarang',effects:[{type:'flag',key:'privateIntroSeen',value:true}],result:'Rian tidak mempermasalahkannya.'}
    ]);
  }

  if(getSkillTier(state.skills.technology).id!=='novice' && state.relationships.rian>=20 && !state.flags.techSideJobSeen){
    return event('tech_side_intro','PELUANG','Bukan Cuma Servis Motor','Rian punya kenalan lain yang butuh bantuan memasang komputer dan printer untuk usaha kecilnya. Bayarannya lumayan untuk pekerjaan beberapa jam.',[
      {label:'Ambil kontaknya',effects:[{type:'flag',key:'techSideJobSeen',value:true},{type:'opportunity',opportunity:{id:'tech_side_job',name:'Setup Komputer Usaha',summary:'4j · Rp250rb · butuh Teknologi Dasar',expireAt:state.time.totalHours+72}}],result:'Sekarang kemampuan Teknologimu mulai punya nilai ekonomi.'},
      {label:'Lewatkan',effects:[{type:'flag',key:'techSideJobSeen',value:true}],result:'Kamu belum ingin mengambil pekerjaan itu.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && state.career.promotionProgress>=12 && getSkillTier(state.skills.mechanics).id!=='novice' && !companyCanPromote(state,'sinar_jaya') && !state.flags.mechanicPromotionFrozenSeen){
    const company=workplaceSnapshot(state,'sinar_jaya');
    return event('mechanic_promotion_frozen','KONDISI TEMPAT KERJA','Promosi Belum Bisa Dibuka',`Pak Surya sebenarnya mulai percaya padamu, tapi ${company?.name||'bengkel'} sedang dalam kondisi ${company?.label?.toLowerCase()||'rentan'}. Pemasukan dan ruang untuk menaikkan posisi sedang sempit.`,[
      {label:'Tetap bangun reputasi',hint:'Promosi bisa muncul saat kondisi bengkel pulih.',effects:[{type:'flag',key:'mechanicPromotionFrozenSeen',value:true},{type:'relationship',target:'pak_arman',value:2}],result:'Skillmu tidak hilang. Hambatannya sekarang datang dari kondisi tempat kerja, bukan kemampuanmu.'},
      {label:'Mulai lihat peluang lain',effects:[{type:'flag',key:'mechanicPromotionFrozenSeen',value:true},{type:'recent',text:'Kamu mulai memperhatikan lowongan di tempat yang kondisi usahanya lebih sehat.'}],result:'Kamu mulai lebih terbuka pada kemungkinan bahwa tempat kerja yang sehat juga bagian dari strategi karier.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && state.career.promotionProgress>=12 && getSkillTier(state.skills.mechanics).id!=='novice' && companyCanPromote(state,'sinar_jaya') && !state.flags.promotionTalkSeen){
    return event('promotion_talk','PELUANG KARIER','Pak Surya Ingin Bicara','Pak Surya merasa kamu mulai bisa diberi tanggung jawab lebih besar.',[
      {label:'Pertimbangkan promosi',effects:[{type:'flag',key:'promotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'promotion',name:'Promosi Mekanik Senior',summary:'Gaji Rp170rb/hari · tanggung jawab lebih besar'}}],result:'Promosi sekarang tersedia sebagai pilihan.'},
      {label:'Belum sekarang',effects:[{type:'flag',key:'promotionTalkSeen',value:true}],result:'Kamu memilih tidak terburu-buru.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.storeProgress>=10 && getSkillTier(state.skills.social).id!=='novice' && state.relationships.maya>=10 && !companyCanPromote(state,'serba_ada') && !state.flags.storePromotionFrozenSeen){
    const company=workplaceSnapshot(state,'serba_ada');
    return event('store_promotion_frozen','KONDISI TEMPAT KERJA','Tanggung Jawab Naik, Jabatan Belum',`Mira mulai mengandalkanmu, tapi ${company?.name||'toko'} sedang dalam kondisi ${company?.label?.toLowerCase()||'rentan'}. Cabang belum punya ruang untuk membuka posisi supervisor baru.`,[
      {label:'Tetap tunjukkan kemampuan',effects:[{type:'flag',key:'storePromotionFrozenSeen',value:true},{type:'relationship',target:'maya',value:2}],result:'Kamu tetap membangun posisi. Saat bisnis pulih, progres itu masih ada.'},
      {label:'Cari tempat yang sedang tumbuh',effects:[{type:'flag',key:'storePromotionFrozenSeen',value:true},{type:'recent',text:'Kamu mulai membandingkan cabang dan perusahaan yang sedang tumbuh.'}],result:'Kamu mulai melihat kondisi perusahaan sebagai bagian dari keputusan karier.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.storeProgress>=10 && getSkillTier(state.skills.social).id!=='novice' && state.relationships.maya>=10 && companyCanPromote(state,'serba_ada') && !state.flags.storePromotionTalkSeen){
    return event('store_promotion_talk','PELUANG KARIER','Mira Menawarkan Tanggung Jawab Baru','Mira ingin kamu mulai memegang shift ketika dia tidak ada. Gajinya lebih tinggi, tapi masalah orang lain juga akan ikut menjadi masalahmu.',[
      {label:'Pertimbangkan posisi supervisor',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'store_promotion',name:'Supervisor Toko',summary:'Gaji Rp145rb/hari · tanggung jawab tim'}}],result:'Posisi Supervisor Toko sekarang tersedia.'},
      {label:'Tetap sebagai pramuniaga',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true}],result:'Kamu belum ingin membawa pekerjaan lebih jauh.'}
    ]);
  }

  if(state.player.job==='cafe_crew' && workCount(state,'cafe_crew')>=6 && getSkillTier(state.skills.hospitality||0).id!=='novice' && (state.relationships.sari||0)>=8 && companyCanPromote(state,'kafe_senja') && !state.flags.cafePromotionTalkSeen){
    return event('cafe_promotion_talk','PELUANG KARIER','Sari Mulai Menyerahkan Satu Shift','Kafe Senja makin ramai. Sari butuh orang yang bisa menjaga kualitas minuman sekaligus ritme pelayanan saat dia tidak terus berada di sampingmu.',[
      {label:'Pertimbangkan jadi Barista Senior',effects:[{type:'flag',key:'cafePromotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'cafe_promotion',name:'Barista Senior',summary:'Gaji Rp165rb/hari · jaga kualitas & ritme shift'}}],result:'Posisi Barista Senior sekarang tersedia.'},
      {label:'Tetap belajar dulu',effects:[{type:'flag',key:'cafePromotionTalkSeen',value:true},{type:'relationship',target:'sari',value:1}],result:'Kamu memilih memperkuat dasar sebelum membawa tanggung jawab lebih besar.'}
    ]);
  }

  if(state.player.job==='warehouse_staff' && workCount(state,'warehouse_staff')>=6 && getSkillTier(state.skills.logistics||0).id!=='novice' && (state.relationships.dimas||0)>=8 && companyCanPromote(state,'lintas_kota') && !state.flags.logisticsPromotionTalkSeen){
    return event('logistics_promotion_talk','PELUANG KARIER','Dimas Butuh Orang di Meja Koordinasi','Volume pengiriman naik. Dimas menawarkanmu pindah dari sekadar menangani barang ke posisi yang ikut menentukan urutan rute dan prioritas tim.',[
      {label:'Pertimbangkan jadi Koordinator',effects:[{type:'flag',key:'logisticsPromotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'logistics_promotion',name:'Koordinator Pengiriman',summary:'Gaji Rp180rb/hari · koordinasi rute & tim'}}],result:'Posisi Koordinator Pengiriman sekarang tersedia.'},
      {label:'Tetap di operasional dulu',effects:[{type:'flag',key:'logisticsPromotionTalkSeen',value:true},{type:'relationship',target:'dimas',value:1}],result:'Kamu belum ingin menukar kerja langsung dengan tanggung jawab koordinasi.'}
    ]);
  }

  return null;
}

function applyEventChoice(state,choice){
  const resolvedEventId=state.pendingEvent?.id||null;
  resolveEffects(state,choice.effects||[]);
  if(resolvedEventId) recordDataEventResolved(state,resolvedEventId);
  state.pendingEvent=null;
  state.pacing=state.pacing||{lastResolvedEventAt:-999,lastSurfacedEventAt:-999,eventCount:0,minGapHours:8};
  state.pacing.lastResolvedEventAt=state.time.totalHours;
  state.pacing.eventCount=(state.pacing.eventCount||0)+1;
}

function urgentStateNeedsAttention(state){
  const rentPressure=state.housing?.id!=='family_home' && state.player.money<housingPressureThreshold(state) && !state.flags.rentPressureSeen;
  const moneyCrisis=state.player.money<0 && !state.flags.moneyPressureSeen;
  const exhaustion=getCondition(state.player.fatigue).id==='exhausted' && !state.flags.exhaustedWarningSeen;
  const restructure=state.scheduled.some(item=>item.kind==='job_restructure' && item.at<=state.time.totalHours);
  const helperIssue=!!state.business?.helperIssuePending;
  const healthPressure=typeof healthNeedsUrgentAttention==='function'&&healthNeedsUrgentAttention(state);
  return rentPressure||moneyCrisis||exhaustion||restructure||helperIssue||healthPressure;
}

function refreshEvent(state){
  if(state.pendingEvent) return;
  state.pacing=state.pacing||{lastResolvedEventAt:-999,lastSurfacedEventAt:-999,eventCount:0,minGapHours:8};
  const gap=Math.max(4,state.pacing.minGapHours||8);
  const elapsed=state.time.totalHours-(state.pacing.lastResolvedEventAt??-999);
  if(!urgentStateNeedsAttention(state) && elapsed<gap) return;
  let next;
  if(urgentStateNeedsAttention(state)) next=(typeof getNextHealthEvent==='function'?getNextHealthEvent(state):null)||getNextEvent(state);
  else next=(typeof getNextLifePhaseEvent==='function'?getNextLifePhaseEvent(state):null)||getNextRelationshipStakeEvent(state)||(typeof getNextHealthEvent==='function'?getNextHealthEvent(state):null)||getNextCharacterStoryEvent(state)||getNextEvent(state);
  if(next){
    state.pendingEvent=next;
    state.pacing.lastSurfacedEventAt=state.time.totalHours;
  }
}

function expireOpportunities(state){
  const expired=state.opportunities.filter(item=>item.expireAt && item.expireAt<=state.time.totalHours);
  if(expired.length) addRecent(state,'Sebuah peluang lewat karena waktunya habis.');
  state.opportunities=state.opportunities.filter(item=>!item.expireAt || item.expireAt>state.time.totalHours);
}
