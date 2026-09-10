function event(id,type,title,text,choices){ return {id,type,title,text,choices}; }
function workCount(state,job){ return state.career.jobWorkCounts?.[job]||0; }

function managerTargetForWorkplace(id){
  if(id==='sinar_jaya') return 'pak_arman';
  if(id==='serba_ada') return 'maya';
  if(id==='nusa_komputer') return 'nadia';
  return null;
}

function basicSkillCount(state){
  return ['mechanics','social','technology','learning'].filter(id=>getSkillTier(state.skills[id]||0).id!=='novice').length;
}

function housingDecisionEvent(state,revisit=false){
  const deposit=state.flags.familySupport?1000000:1200000;
  return event(revisit?'housing_revisit':'housing_choice','ARAH HIDUP',revisit?'Soal Tinggal Sendiri Muncul Lagi':'Tetap di Rumah atau Mulai Mandiri?',
    revisit
      ? 'Beberapa waktu berlalu. Ide untuk punya ruang sendiri masih terasa masuk akal, tapi biaya hidupnya juga belum berubah.'
      : 'Penghasilanmu mulai lebih stabil. Kamar sewa dekat area kerja tersedia, tapi pindah berarti deposit besar dan biaya bulanan hampir dua kali lipat.',[
      {label:'Pertimbangkan pindah',hint:`Deposit Rp${deposit.toLocaleString('id-ID')} · biaya hidup Rp1,1jt/bulan`,effects:[{type:'flag',key:'housingOfferSeen',value:true},{type:'opportunity',opportunity:{id:'rent_room',name:'Sewa Kamar Sendiri',summary:`Deposit Rp${deposit.toLocaleString('id-ID')} · belajar & istirahat lebih efektif`}}],result:'Pilihan pindah sekarang tersedia. Kamu tidak harus mengambilnya langsung.'},
      {label:'Tetap bersama keluarga dulu',hint:'Lebih murah · hubungan keluarga lebih dekat',effects:[{type:'flag',key:'housingOfferSeen',value:true},{type:'relationship',target:'family',value:2},{type:'schedule',after:360,kind:'housing_revisit'}],result:'Kamu memilih mempertahankan biaya hidup rendah. Pilihan mandiri bisa muncul lagi nanti.'}
    ]);
}

function dueScheduledEvent(state){
  const idx=state.scheduled.findIndex(item=>item.at<=state.time.totalHours);
  if(idx<0) return null;
  const item=state.scheduled.splice(idx,1)[0];

  if(item.kind==='dika_return_favor'){
    return event('dika_return_favor','KONSEKUENSI','Dika Membalas Bantuanmu','Beberapa hari setelah kamu membantunya pulang terlambat, Dika menawarkan menutup satu shift supaya kamu bisa beristirahat.',[
      {label:'Terima bantuannya',hint:'8j · pulihkan kondisi',effects:[{type:'hours',value:8},{type:'fatigue',value:-35},{type:'relationship',target:'dika',value:4},{type:'recent',text:'Dika menutup satu shift untukmu.'}],result:'Kamu menerima bantuan Dika. Hubungan kalian mulai terasa seperti kerja sama, bukan sekadar persaingan.'},
      {label:'Tidak perlu',effects:[{type:'relationship',target:'dika',value:1}],result:'Kamu menolak dengan baik. Dika tetap mengingat bahwa utang bantuannya sudah dia tawarkan.'}
    ]);
  }

  if(item.kind==='store_customer_returns'){
    return event('store_customer_returns','KONSEKUENSI','Pelanggan Itu Kembali','Pelanggan yang dulu kamu tangani kembali ke toko dan langsung mencarimu. Maya memperhatikan itu.',[
      {label:'Layani sendiri',effects:[{type:'skill',skill:'social',value:15},{type:'relationship',target:'maya',value:4},{type:'store_progress',value:2},{type:'recent',text:'Seorang pelanggan mulai mengenalmu secara pribadi.'}],result:'Kamu menyelesaikan urusannya dengan lebih lancar. Maya mulai melihatmu sebagai orang yang bisa diandalkan.'},
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
      {label:'Perbaiki lagi tanpa biaya',hint:'2j · lebih melelahkan',effects:[{type:'hours',value:2},{type:'fatigue',value:5},{type:'skill',skill:'mechanics',value:12},{type:'relationship',target:'pak_arman',value:3},{type:'promotion',value:1},{type:'recent',text:'Kamu memperbaiki ulang pekerjaanmu tanpa melempar tanggung jawab.'}],result:'Kesalahan itu memakan waktu, tapi cara kamu menanganinya justru menambah kepercayaan Pak Arman.'},
      {label:'Minta Pak Arman mengambil alih',effects:[{type:'relationship',target:'pak_arman',value:-2}],result:'Masalah selesai, tetapi Pak Arman tahu kamu belum siap menangani semuanya sendiri.'}
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

  if(item.kind==='move_out_reflection' && state.housing?.id==='rented_room'){
    return event('move_out_reflection','KEHIDUPAN','Malam Pertama di Tempat Sendiri','Tidak ada suara keluarga di ruangan sebelah. Rasanya lebih bebas, tapi juga lebih sepi daripada yang kamu bayangkan.',[
      {label:'Telepon keluarga',effects:[{type:'relationship',target:'family',value:4},{type:'flag',key:'moveReflectionSeen',value:true},{type:'recent',text:'Kamu tetap menjaga hubungan keluarga setelah pindah.'}],result:'Tinggal terpisah tidak berarti hubungan harus menjauh.'},
      {label:'Nikmati ruang sendiri',effects:[{type:'skill',skill:'learning',value:5},{type:'flag',key:'moveReflectionSeen',value:true}],result:'Kamu mulai menikmati bahwa waktu dan ruangmu sekarang benar-benar milikmu.'}
    ]);
  }

  if(item.kind==='housing_revisit' && state.housing?.id!=='rented_room'){
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


  if(state.housing?.id==='rented_room' && state.player.money<350000 && !state.flags.rentPressureSeen){
    return event('rent_pressure','KEUANGAN','Biaya Hidup Mulai Terasa','Tinggal sendiri memberi ruang lebih besar, tapi saldo mulai menipis. Sewa bulan berikutnya sekarang terasa seperti keputusan nyata.',[
      {label:'Bertahan sendiri',hint:'Pertahankan biaya Rp1,1jt/bulan',effects:[{type:'flag',key:'rentPressureSeen',value:true},{type:'recent',text:'Kamu memilih mempertahankan tempat tinggal sendiri meski cashflow ketat.'}],result:'Kamu mempertahankan kemandirian dan menerima tekanan keuangannya.'},
      {label:'Pulang ke keluarga sementara',hint:'Biaya hidup kembali Rp600rb/bulan',effects:[{type:'flag',key:'rentPressureSeen',value:true},{type:'flag',key:'movedOut',value:false},{type:'housing',value:{id:'family_home',label:'Bersama keluarga',monthlyCost:600000,movedAt:null}},{type:'status_remove',status:'tinggal_sendiri'},{type:'status_add',status:'tinggal_bersama_keluarga'},{type:'relationship',target:'family',value:3},{type:'schedule',after:360,kind:'housing_revisit'},{type:'history',text:'Umur 18 · Kembali tinggal bersama keluarga untuk menstabilkan keuangan.'}],result:'Kamu pulang. Ini bukan reset—hanya perubahan strategi hidup karena kondisi keuangan.'}
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

  if(state.player.job && state.career.workCount>=10 && state.housing?.id!=='rented_room' && !state.flags.housingOfferSeen){
    return housingDecisionEvent(state,false);
  }

  if(state.player.job && state.career.workCount>=8 && (state.career.sideIncomeTotal||0)>=500000 && state.life?.trajectory==='open' && !state.flags.trajectoryChoiceSeen){
    return event('trajectory_choice','KEPUTUSAN BESAR','Dua Arah yang Sama-sama Masuk Akal','Pekerjaan utama mulai stabil, tapi pemasukan sampingan juga sudah terbukti nyata. Kamu tidak bisa memberi energi maksimal ke keduanya tanpa trade-off.',[
      {label:'Perkuat karier utama',hint:'Progres promosi lebih cepat saat bekerja',effects:[{type:'trajectory',value:'career'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'fokus_karier'},{type:'history',text:'Umur 18 · Memilih memperkuat karier utama sebagai arah hidup.'}],result:'Kamu memilih stabilitas dan kedalaman di pekerjaan utama. Progres karier akan lebih cepat saat bekerja.'},
      {label:'Bangun jalur mandiri juga',hint:'Kerja sampingan +15% dan lebih sering · kerja utama sedikit lebih melelahkan',effects:[{type:'trajectory',value:'independent'},{type:'flag',key:'trajectoryChoiceSeen',value:true},{type:'status_add',status:'jalur_mandiri'},{type:'history',text:'Umur 18 · Memilih membangun jalur mandiri di samping pekerjaan utama.'}],result:'Kamu menerima hidup yang lebih padat demi membangun sumber penghasilan dan identitas di luar pekerjaan utama.'}
    ]);
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
    const isMechanic=state.player.job==='mechanic_junior'||state.player.job==='mechanic_senior';
    const isStore=state.player.job==='store_clerk'||state.player.job==='store_supervisor';
    const isTech=state.player.job==='it_assistant';
    if(!isMechanic && getSkillTier(state.skills.mechanics).id!=='novice') choices.push({label:'Lihat jalur bengkel',hint:'Skill Mekanikmu sudah cukup untuk kembali masuk.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_mechanic',name:'Beralih ke Jalur Bengkel',summary:'Pakai skill Mekanik yang sudah kamu bangun'}}],result:'Jalur bengkel masuk ke peluang aktifmu.'});
    if(!isStore && getSkillTier(state.skills.social).id!=='novice') choices.push({label:'Lihat jalur toko',hint:'Skill Sosialmu sudah cukup untuk pindah.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_store',name:'Beralih ke Jalur Pelayanan',summary:'Pakai kemampuan Sosial sebagai karier utama'}}],result:'Jalur pelayanan masuk ke peluang aktifmu.'});
    if(!isTech && getSkillTier(state.skills.technology).id!=='novice') choices.push({label:'Lihat jalur teknologi',hint:'Teknologi sudah cukup kuat untuk dicoba sebagai pekerjaan utama.',effects:[{type:'career_search_handled'},{type:'opportunity',opportunity:{id:'career_it',name:'Beralih ke Jalur Teknologi',summary:'Jadikan Teknologi pekerjaan utama'}}],result:'Jalur Teknologi masuk ke peluang aktifmu.'});
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
    return event('promo_side_intro','PELUANG SAMPINGAN','Maya Menyebut Shift Promosi Lepas','Ada event promosi akhir pekan yang mencari orang untuk menghadapi pengunjung. Ini bukan pekerjaan tetap dan bisa diambil meski karier utamamu ada di bidang lain.',[
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

  if(getCondition(state.player.fatigue).id==='exhausted' && !state.flags.exhaustedWarningSeen){
    return event('exhausted','KONDISI','Sudah Terlalu Dipaksakan','Kamu mulai sulit fokus. Kalau terus dipaksa, keputusan kecil bisa berubah menjadi masalah besar.',[
      {label:'Istirahat sekarang',effects:[{type:'hours',value:8},{type:'fatigue',value:-45},{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu berhenti memaksakan diri dan memulihkan kondisi.'},
      {label:'Tetap lanjut',effects:[{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu memilih tetap jalan. Kondisimu masih buruk dan risiko tetap ada.'}
    ]);
  }

  if(state.career.jobSearchCount>=1 && !state.flags.workshopOfferSeen){
    return event('job_leads','PELUANG AWAL','Dua Lowongan yang Masuk Akal','Setelah bertanya ke beberapa tempat, kamu menemukan dua lowongan yang bisa langsung dicoba. Jalurnya berbeda, dan kamu tidak harus memutuskan sekarang.',[
      {label:'Catat lowongan bengkel',hint:'Mekanik Junior · Rp120rb/hari',effects:[{type:'flag',key:'workshopOfferSeen',value:true},{type:'opportunity',opportunity:{id:'workshop_job',name:'Mekanik Junior',summary:'8j/hari · Rp120rb · belajar Mekanik'}},{type:'recent',text:'Lowongan Bengkel Sinar Jaya masuk daftar peluangmu.'}],result:'Kamu menyimpan kontak Bengkel Sinar Jaya.'},
      {label:'Catat keduanya',hint:'Tambahkan juga pekerjaan toko.',effects:[{type:'flag',key:'workshopOfferSeen',value:true},{type:'flag',key:'storeOfferSeen',value:true},{type:'opportunity',opportunity:{id:'workshop_job',name:'Mekanik Junior',summary:'8j/hari · Rp120rb · belajar Mekanik'}},{type:'opportunity',opportunity:{id:'store_job',name:'Pramuniaga',summary:'8j/hari · Rp100rb · banyak interaksi sosial'}},{type:'recent',text:'Dua lowongan awal sekarang tersedia.'}],result:'Sekarang kamu punya dua jalur kerja yang benar-benar berbeda.'}
    ]);
  }

  if(!state.player.job && state.career.jobSearchCount>=2 && state.flags.workshopOfferSeen && !state.flags.storeOfferSeen){
    return event('store_lead','PELUANG KERJA','Lowongan Lain Muncul','Pencarian kedua membawamu ke Toko Serba Ada. Gajinya sedikit lebih rendah dari bengkel, tapi pekerjaan ini lebih banyak melatih cara menghadapi orang.',[
      {label:'Catat lowongan toko',effects:[{type:'flag',key:'storeOfferSeen',value:true},{type:'opportunity',opportunity:{id:'store_job',name:'Pramuniaga',summary:'8j/hari · Rp100rb · banyak interaksi sosial'}},{type:'recent',text:'Lowongan Toko Serba Ada sekarang tersedia.'}],result:'Sekarang kamu punya alternatif pekerjaan yang lebih sosial.'},
      {label:'Tidak tertarik',effects:[{type:'flag',key:'storeOfferSeen',value:true}],result:'Kamu memilih tidak mengejar pekerjaan toko.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && workCount(state,'mechanic_junior')>=1 && !state.flags.firstWorkshopDay){
    return event('first_workshop','HARI PERTAMA','Hari Pertama di Bengkel','Pak Arman memasangkanmu dengan Dika. Bengkel lebih sibuk dari yang terlihat dari luar.',[
      {label:'Dengarkan baik-baik',effects:[{type:'skill',skill:'mechanics',value:10},{type:'skill',skill:'learning',value:6},{type:'relationship',target:'pak_arman',value:4},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Pak Arman melihat kamu serius belajar.'}],result:'Kamu fokus memahami ritme bengkel.'},
      {label:'Coba menonjol sejak awal',effects:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'dika',value:-2},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Dika mulai menganggapmu sebagai pesaing.'}],result:'Kamu belajar cepat, tapi persaingan dengan Dika mulai terasa.'}
    ]);
  }

  if(state.player.job==='store_clerk' && workCount(state,'store_clerk')>=1 && !state.flags.firstStoreDay){
    return event('first_store','HARI PERTAMA','Hari Pertama di Toko','Maya, supervisormu, langsung menaruhmu di depan pelanggan. Pekerjaan ini lebih banyak soal membaca orang daripada mengangkat barang.',[
      {label:'Amati cara Maya melayani',effects:[{type:'skill',skill:'social',value:12},{type:'skill',skill:'learning',value:5},{type:'relationship',target:'maya',value:4},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true},{type:'recent',text:'Maya melihat kamu cepat menangkap cara menghadapi pelanggan.'}],result:'Kamu belajar dari cara Maya berbicara dan menyelesaikan masalah.'},
      {label:'Langsung coba sendiri',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:1},{type:'store_progress',value:1},{type:'flag',key:'firstStoreDay',value:true}],result:'Beberapa percakapan canggung, tapi kamu cepat belajar.'}
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
    return event('difficult_repair','PEKERJAAN','Perbaikan Sulit','Pak Arman memberimu pekerjaan yang sedikit di atas kemampuanmu sekarang. Ini kesempatan belajar, tapi kesalahan akan terlihat.',[
      {label:'Coba tangani sendiri',hint:canHandle?'Risiko masih masuk akal.':'Risikonya tinggi dengan kondisi/skill sekarang.',effects:canHandle?[{type:'skill',skill:'mechanics',value:25},{type:'relationship',target:'pak_arman',value:5},{type:'promotion',value:4},{type:'flag',key:'difficultRepairSeen',value:true},{type:'recent',text:'Kamu menangani perbaikan sulit sendiri.'}]:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'pak_arman',value:-1},{type:'schedule',after:24,kind:'mechanic_complaint'},{type:'flag',key:'difficultRepairSeen',value:true},{type:'recent',text:'Kamu mengambil perbaikan sulit meski belum benar-benar siap.'}],result:canHandle?'Kamu menyelesaikannya sendiri. Pak Arman mulai melihatmu berbeda.':'Kamu menyelesaikannya, tapi belum yakin hasilnya benar-benar beres.'},
      {label:'Minta arahan Pak Arman',effects:[{type:'skill',skill:'mechanics',value:12},{type:'relationship',target:'pak_arman',value:4},{type:'promotion',value:2},{type:'flag',key:'difficultRepairSeen',value:true}],result:'Kamu mengurangi risiko dan belajar langsung dari pengalaman Pak Arman.'},
      {label:'Minta bantuan Dika',effects:[{type:'skill',skill:'mechanics',value:14},{type:'relationship',target:'dika',value:state.flags.helpedDika?4:0},{type:'flag',key:'difficultRepairSeen',value:true}],result:state.flags.helpedDika?'Dika membalas bantuanmu tanpa banyak komentar.':'Dika membantu, tapi hubungan kalian belum cukup dekat untuk terasa seperti kerja sama.'}
    ]);
  }

  if(state.player.job==='store_clerk' && workCount(state,'store_clerk')>=3 && !state.flags.storeCustomerSeen){
    return event('store_customer','PEKERJAAN','Pelanggan yang Sulit','Seorang pelanggan marah karena harga di rak berbeda dengan harga di kasir. Maya sedang sibuk di belakang.',[
      {label:'Tangani sendiri',hint:'Kemampuan Sosial membantu.',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:3},{type:'store_progress',value:2},{type:'flag',key:'storeCustomerSeen',value:true},{type:'schedule',after:48,kind:'store_customer_returns'},{type:'recent',text:'Kamu menyelesaikan masalah pelanggan tanpa memanggil Maya.'}],result:'Percakapannya tidak nyaman, tapi kamu berhasil menenangkan situasi.'},
      {label:'Panggil Maya',effects:[{type:'skill',skill:'learning',value:6},{type:'relationship',target:'maya',value:1},{type:'store_progress',value:1},{type:'flag',key:'storeCustomerSeen',value:true}],result:'Maya mengambil alih dan kamu memperhatikan bagaimana dia menyelesaikannya.'}
    ]);
  }

  if(state.player.job==='store_clerk' && workCount(state,'store_clerk')>=6 && !state.flags.storeRushSeen){
    return event('store_rush','PEKERJAAN','Toko Mendadak Penuh','Dua rekan kerja tidak masuk dan antrean mulai panjang. Maya harus memilih siapa yang memegang lantai toko.',[
      {label:'Ambil kendali di depan',hint:'Lebih melelahkan · progres karier tinggi',effects:[{type:'hours',value:2},{type:'fatigue',value:8},{type:'skill',skill:'social',value:20},{type:'relationship',target:'maya',value:5},{type:'store_progress',value:4},{type:'flag',key:'storeRushSeen',value:true}],result:'Kamu menjaga situasi tetap terkendali. Maya melihatmu bukan lagi sekadar pegawai baru.'},
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
    return event('mechanic_social_cross','KOMBINASI SKILL','Pelanggan Tidak Percaya','Seorang pelanggan tidak yakin dengan penjelasan biaya perbaikan. Pak Arman sedang menangani mobil lain.',[
      {label:'Jelaskan masalahnya sendiri',hint:'Sosial Dasar membuka pilihan ini.',effects:[{type:'skill',skill:'social',value:12},{type:'relationship',target:'pak_arman',value:4},{type:'promotion',value:3},{type:'flag',key:'crossMechanicSocialSeen',value:true},{type:'recent',text:'Kamu menangani pelanggan sulit tanpa bantuan Pak Arman.'}],result:'Kemampuan sosialmu membuat skill mekanikmu lebih berguna. Pelanggan akhirnya memahami keputusan perbaikan.'},
      {label:'Tunggu Pak Arman',effects:[{type:'flag',key:'crossMechanicSocialSeen',value:true}],result:'Kamu menunggu Pak Arman. Masalah selesai, tapi kamu tidak mengambil peran lebih jauh.'}
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
    return event('mechanic_promotion_frozen','KONDISI TEMPAT KERJA','Promosi Belum Bisa Dibuka',`Pak Arman sebenarnya mulai percaya padamu, tapi ${company?.name||'bengkel'} sedang dalam kondisi ${company?.label?.toLowerCase()||'rentan'}. Pemasukan dan ruang untuk menaikkan posisi sedang sempit.`,[
      {label:'Tetap bangun reputasi',hint:'Promosi bisa muncul saat kondisi bengkel pulih.',effects:[{type:'flag',key:'mechanicPromotionFrozenSeen',value:true},{type:'relationship',target:'pak_arman',value:2}],result:'Skillmu tidak hilang. Hambatannya sekarang datang dari kondisi tempat kerja, bukan kemampuanmu.'},
      {label:'Mulai lihat peluang lain',effects:[{type:'flag',key:'mechanicPromotionFrozenSeen',value:true},{type:'recent',text:'Kamu mulai memperhatikan lowongan di tempat yang kondisi usahanya lebih sehat.'}],result:'Kamu mulai lebih terbuka pada kemungkinan bahwa tempat kerja yang sehat juga bagian dari strategi karier.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && state.career.promotionProgress>=12 && getSkillTier(state.skills.mechanics).id!=='novice' && companyCanPromote(state,'sinar_jaya') && !state.flags.promotionTalkSeen){
    return event('promotion_talk','PELUANG KARIER','Pak Arman Ingin Bicara','Pak Arman merasa kamu mulai bisa diberi tanggung jawab lebih besar.',[
      {label:'Pertimbangkan promosi',effects:[{type:'flag',key:'promotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'promotion',name:'Promosi Mekanik Senior',summary:'Gaji Rp170rb/hari · tanggung jawab lebih besar'}}],result:'Promosi sekarang tersedia sebagai pilihan.'},
      {label:'Belum sekarang',effects:[{type:'flag',key:'promotionTalkSeen',value:true}],result:'Kamu memilih tidak terburu-buru.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.storeProgress>=10 && getSkillTier(state.skills.social).id!=='novice' && state.relationships.maya>=10 && !companyCanPromote(state,'serba_ada') && !state.flags.storePromotionFrozenSeen){
    const company=workplaceSnapshot(state,'serba_ada');
    return event('store_promotion_frozen','KONDISI TEMPAT KERJA','Tanggung Jawab Naik, Jabatan Belum',`Maya mulai mengandalkanmu, tapi ${company?.name||'toko'} sedang dalam kondisi ${company?.label?.toLowerCase()||'rentan'}. Cabang belum punya ruang untuk membuka posisi supervisor baru.`,[
      {label:'Tetap tunjukkan kemampuan',effects:[{type:'flag',key:'storePromotionFrozenSeen',value:true},{type:'relationship',target:'maya',value:2}],result:'Kamu tetap membangun posisi. Saat bisnis pulih, progres itu masih ada.'},
      {label:'Cari tempat yang sedang tumbuh',effects:[{type:'flag',key:'storePromotionFrozenSeen',value:true},{type:'recent',text:'Kamu mulai membandingkan cabang dan perusahaan yang sedang tumbuh.'}],result:'Kamu mulai melihat kondisi perusahaan sebagai bagian dari keputusan karier.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.storeProgress>=10 && getSkillTier(state.skills.social).id!=='novice' && state.relationships.maya>=10 && companyCanPromote(state,'serba_ada') && !state.flags.storePromotionTalkSeen){
    return event('store_promotion_talk','PELUANG KARIER','Maya Menawarkan Tanggung Jawab Baru','Maya ingin kamu mulai memegang shift ketika dia tidak ada. Gajinya lebih tinggi, tapi masalah orang lain juga akan ikut menjadi masalahmu.',[
      {label:'Pertimbangkan posisi supervisor',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'store_promotion',name:'Supervisor Toko',summary:'Gaji Rp145rb/hari · tanggung jawab tim'}}],result:'Posisi Supervisor Toko sekarang tersedia.'},
      {label:'Tetap sebagai pramuniaga',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true}],result:'Kamu belum ingin membawa pekerjaan lebih jauh.'}
    ]);
  }

  return null;
}

function applyEventChoice(state,choice){
  resolveEffects(state,choice.effects||[]);
  state.pendingEvent=null;
  state.pacing=state.pacing||{lastResolvedEventAt:-999,lastSurfacedEventAt:-999,eventCount:0,minGapHours:8};
  state.pacing.lastResolvedEventAt=state.time.totalHours;
  state.pacing.eventCount=(state.pacing.eventCount||0)+1;
}

function urgentStateNeedsAttention(state){
  const rentPressure=state.housing?.id==='rented_room' && state.player.money<350000 && !state.flags.rentPressureSeen;
  const moneyCrisis=state.player.money<0 && !state.flags.moneyPressureSeen;
  const exhaustion=getCondition(state.player.fatigue).id==='exhausted' && !state.flags.exhaustedWarningSeen;
  const restructure=state.scheduled.some(item=>item.kind==='job_restructure' && item.at<=state.time.totalHours);
  return rentPressure||moneyCrisis||exhaustion||restructure;
}

function refreshEvent(state){
  if(state.pendingEvent) return;
  state.pacing=state.pacing||{lastResolvedEventAt:-999,lastSurfacedEventAt:-999,eventCount:0,minGapHours:8};
  const gap=Math.max(4,state.pacing.minGapHours||8);
  const elapsed=state.time.totalHours-(state.pacing.lastResolvedEventAt??-999);
  if(!urgentStateNeedsAttention(state) && elapsed<gap) return;
  const next=getNextEvent(state);
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
