import {getSkillTier,getCondition} from '../core/state.js';
import {resolveEffects,addRecent} from '../core/effects.js';

function event(id,type,title,text,choices){ return {id,type,title,text,choices}; }
function workCount(state,job){ return state.career.jobWorkCounts?.[job]||0; }

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

  return null;
}

export function getNextEvent(state){
  if(state.pendingEvent) return state.pendingEvent;

  const scheduled=dueScheduledEvent(state);
  if(scheduled) return scheduled;

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

  if(state.player.job==='mechanic_junior' && state.career.promotionProgress>=12 && getSkillTier(state.skills.mechanics).id!=='novice' && !state.flags.promotionTalkSeen){
    return event('promotion_talk','PELUANG KARIER','Pak Arman Ingin Bicara','Pak Arman merasa kamu mulai bisa diberi tanggung jawab lebih besar.',[
      {label:'Pertimbangkan promosi',effects:[{type:'flag',key:'promotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'promotion',name:'Promosi Mekanik Senior',summary:'Gaji Rp170rb/hari · tanggung jawab lebih besar'}}],result:'Promosi sekarang tersedia sebagai pilihan.'},
      {label:'Belum sekarang',effects:[{type:'flag',key:'promotionTalkSeen',value:true}],result:'Kamu memilih tidak terburu-buru.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.storeProgress>=10 && getSkillTier(state.skills.social).id!=='novice' && state.relationships.maya>=10 && !state.flags.storePromotionTalkSeen){
    return event('store_promotion_talk','PELUANG KARIER','Maya Menawarkan Tanggung Jawab Baru','Maya ingin kamu mulai memegang shift ketika dia tidak ada. Gajinya lebih tinggi, tapi masalah orang lain juga akan ikut menjadi masalahmu.',[
      {label:'Pertimbangkan posisi supervisor',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true},{type:'opportunity',opportunity:{id:'store_promotion',name:'Supervisor Toko',summary:'Gaji Rp145rb/hari · tanggung jawab tim'}}],result:'Posisi Supervisor Toko sekarang tersedia.'},
      {label:'Tetap sebagai pramuniaga',effects:[{type:'flag',key:'storePromotionTalkSeen',value:true}],result:'Kamu belum ingin membawa pekerjaan lebih jauh.'}
    ]);
  }

  return null;
}

export function applyEventChoice(state,choice){
  resolveEffects(state,choice.effects||[]);
  state.pendingEvent=null;
}

export function refreshEvent(state){
  if(state.pendingEvent) return;
  const next=getNextEvent(state);
  if(next) state.pendingEvent=next;
}

export function expireOpportunities(state){
  const expired=state.opportunities.filter(item=>item.expireAt && item.expireAt<=state.time.totalHours);
  if(expired.length) addRecent(state,'Sebuah peluang lewat karena waktunya habis.');
  state.opportunities=state.opportunities.filter(item=>!item.expireAt || item.expireAt>state.time.totalHours);
}
