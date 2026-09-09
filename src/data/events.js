import {getSkillTier,getCondition} from '../core/state.js';
import {resolveEffects,addOpportunity,addRecent} from '../core/effects.js';

function event(id,type,title,text,choices){ return {id,type,title,text,choices}; }

export function getNextEvent(state){
  if(state.pendingEvent) return state.pendingEvent;

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

  if(state.player.job==='mechanic_junior' && state.career.workCount>=1 && !state.flags.firstWorkshopDay){
    return event('first_workshop','HARI PERTAMA','Hari Pertama di Bengkel','Pak Arman memasangkanmu dengan Dika. Bengkel lebih sibuk dari yang terlihat dari luar.',[
      {label:'Dengarkan baik-baik',effects:[{type:'skill',skill:'mechanics',value:10},{type:'skill',skill:'learning',value:6},{type:'relationship',target:'pak_arman',value:4},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Pak Arman melihat kamu serius belajar.'}],result:'Kamu fokus memahami ritme bengkel.'},
      {label:'Coba menonjol sejak awal',effects:[{type:'skill',skill:'mechanics',value:16},{type:'relationship',target:'dika',value:-2},{type:'flag',key:'firstWorkshopDay',value:true},{type:'recent',text:'Dika mulai menganggapmu sebagai pesaing.'}],result:'Kamu belajar cepat, tapi persaingan dengan Dika mulai terasa.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.workCount>=1 && !state.flags.firstStoreDay){
    return event('first_store','HARI PERTAMA','Hari Pertama di Toko','Maya, supervisormu, langsung menaruhmu di depan pelanggan. Pekerjaan ini lebih banyak soal membaca orang daripada mengangkat barang.',[
      {label:'Amati cara Maya melayani',effects:[{type:'skill',skill:'social',value:12},{type:'skill',skill:'learning',value:5},{type:'relationship',target:'maya',value:4},{type:'flag',key:'firstStoreDay',value:true},{type:'recent',text:'Maya melihat kamu cepat menangkap cara menghadapi pelanggan.'}],result:'Kamu belajar dari cara Maya berbicara dan menyelesaikan masalah.'},
      {label:'Langsung coba sendiri',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:1},{type:'flag',key:'firstStoreDay',value:true}],result:'Beberapa percakapan canggung, tapi kamu cepat belajar.'}
    ]);
  }

  if(state.player.job==='mechanic_junior' && state.career.workCount>=3 && !state.flags.dikaHelpSeen){
    return event('dika_help','HUBUNGAN','Dika Belum Selesai','Bengkel hampir tutup, tapi Dika masih punya satu kendaraan yang belum selesai.',[
      {label:'Bantu Dika',hint:'2j · lebih melelahkan',effects:[{type:'hours',value:2},{type:'fatigue',value:5},{type:'relationship',target:'dika',value:8},{type:'flag',key:'dikaHelpSeen',value:true},{type:'flag',key:'helpedDika',value:true},{type:'recent',text:'Kamu pulang terlambat untuk membantu Dika.'}],result:'Dika tidak banyak bicara, tetapi jelas menghargainya.'},
      {label:'Pulang',effects:[{type:'flag',key:'dikaHelpSeen',value:true},{type:'relationship',target:'dika',value:-1}],result:'Kamu memilih menjaga tenagamu dan pulang.'}
    ]);
  }

  if(state.player.job==='store_clerk' && state.career.workCount>=3 && !state.flags.dikaHelpSeen){
    return event('store_customer','PEKERJAAN','Pelanggan yang Sulit','Seorang pelanggan marah karena harga di rak berbeda dengan harga di kasir. Maya sedang sibuk di belakang.',[
      {label:'Tangani sendiri',hint:'Kemampuan Sosial membantu.',effects:[{type:'skill',skill:'social',value:18},{type:'relationship',target:'maya',value:3},{type:'flag',key:'dikaHelpSeen',value:true},{type:'recent',text:'Kamu menyelesaikan masalah pelanggan tanpa memanggil Maya.'}],result:'Percakapannya tidak nyaman, tapi kamu berhasil menenangkan situasi.'},
      {label:'Panggil Maya',effects:[{type:'skill',skill:'learning',value:6},{type:'relationship',target:'maya',value:1},{type:'flag',key:'dikaHelpSeen',value:true}],result:'Maya mengambil alih dan kamu memperhatikan bagaimana dia menyelesaikannya.'}
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

  if(getCondition(state.player.fatigue).id==='exhausted' && !state.flags.exhaustedWarningSeen){
    return event('exhausted','KONDISI','Sudah Terlalu Dipaksakan','Kamu mulai sulit fokus. Kalau terus dipaksa, keputusan kecil bisa berubah menjadi masalah besar.',[
      {label:'Istirahat sekarang',effects:[{type:'hours',value:8},{type:'fatigue',value:-45},{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu berhenti memaksakan diri dan memulihkan kondisi.'},
      {label:'Tetap lanjut',effects:[{type:'flag',key:'exhaustedWarningSeen',value:true}],result:'Kamu memilih tetap jalan. Kondisimu masih buruk dan risiko tetap ada.'}
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
