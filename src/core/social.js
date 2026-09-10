function ensureSocialState(state){
  const keys=Object.keys(SOCIAL_NPCS||{});
  const base={encounters:{},lastEncounterAt:{},lastLocationByNpc:{},hangouts:0};
  state.social={...base,...(state.social||{})};
  state.social.encounters={...(state.social.encounters||{})};
  state.social.lastEncounterAt={...(state.social.lastEncounterAt||{})};
  state.social.lastLocationByNpc={...(state.social.lastLocationByNpc||{})};
  for(const key of keys){
    if(state.social.encounters[key]===undefined) state.social.encounters[key]=0;
    if(state.social.lastEncounterAt[key]===undefined) state.social.lastEncounterAt[key]=-999;
  }
  return state.social;
}

function socialDayIndex(state){
  const cal=getCalendar(state.time.totalHours);
  return (Math.max(1,cal.dayOfLife)-1)%7;
}

function socialDayName(state){ return SOCIAL_DAY_NAMES[socialDayIndex(state)]||'Hari'; }

function scheduleActive(schedule,day,hour){
  if(!schedule || !Array.isArray(schedule.days) || !schedule.days.includes(day)) return false;
  const start=Number(schedule.start)||0,end=Number(schedule.end)||24;
  return hour>=start && hour<end;
}

function socialPeopleAtLocation(state,locationId,totalHours=null){
  ensureSocialState(state);
  const original=state.time.totalHours;
  const target=totalHours===null?original:totalHours;
  const cal=getCalendar(target),day=(Math.max(1,cal.dayOfLife)-1)%7;
  return Object.values(SOCIAL_NPCS||{}).filter(person=>
    (person.schedules||[]).some(schedule=>schedule.location===locationId && scheduleActive(schedule,day,cal.hour))
  );
}

function socialBondText(state,key){
  ensureSocialState(state);
  const meetings=state.social.encounters[key]||0;
  const relation=state.relationships?.[key]||0;
  if(meetings>=5 && relation>=50) return 'Punya rutinitas bersama';
  if(meetings>=3 && relation>=20) return 'Mulai sering bertemu';
  if(meetings>=1) return 'Pernah bertemu di kota';
  return '';
}

function socialPresenceLabel(state,locationId){
  const people=socialPeopleAtLocation(state,locationId);
  if(!people.length) return {people:[],text:'Tidak ada kenalan yang terlihat sekarang.'};
  const names=people.map(p=>state.npc?.[p.id]?.known?p.name:p.role);
  return {people,text:`Sekarang: ${names.join(' · ')}`};
}

function socialEncounterEvent(state,key,locationId){
  ensureSocialState(state);
  const person=SOCIAL_NPCS[key];
  if(!person) return null;
  const count=state.social.encounters[key]||0;
  const relation=state.relationships?.[key]||0;
  const art=person.image;

  if(key==='andi'){
    if(count>=3 && relation>=18){
      return {id:'social_andi_study',type:'PERTEMUAN',title:'Andi Ajak Belajar Bareng',art,artAlt:'Andi',text:'Andi lagi menyusun materi komunitas. Dia bilang belajar bareng sering lebih efektif daripada menatap layar sendirian.',choices:[
        {label:'Ikut sesi belajar',hint:'3j · Belajar & Teknologi berkembang',effects:[{type:'hours',value:3},{type:'fatigue',value:5},{type:'skill',skill:'learning',value:14},{type:'skill',skill:'technology',value:10},{type:'relationship',target:'andi',value:5},{type:'history',text:'Umur 18 · Mulai punya rutinitas belajar bersama Andi.'}],result:'Beberapa jam lewat cepat. Kalian mulai punya ritme belajar yang terasa natural.'},
        {label:'Tukar materi saja',hint:'Tetap dekat tanpa menghabiskan banyak waktu',effects:[{type:'relationship',target:'andi',value:2},{type:'skill',skill:'learning',value:4}],result:'Kalian saling kirim catatan dan janji ngobrol lagi lain kali.'}
      ]};
    }
    return {id:'social_andi_meet',type:'PERTEMUAN',title:'Andi Lagi di Kampus',art,artAlt:'Andi',text:'Andi sedang beresin kabel dan laptop untuk kegiatan komunitas. Dia menyapamu sebelum kembali sibuk.',choices:[
      {label:'Bantu sebentar',hint:'1j · Teknologi berkembang',effects:[{type:'hours',value:1},{type:'fatigue',value:2},{type:'skill',skill:'technology',value:7},{type:'relationship',target:'andi',value:4}],result:'Kalian menyelesaikan setup lebih cepat. Andi mulai tahu kamu bisa diajak kerja bareng.'},
      {label:'Ngobrol soal rencana',hint:'1j · Belajar berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'learning',value:6},{type:'relationship',target:'andi',value:3}],result:'Obrolan singkat berubah jadi pertukaran ide tentang pekerjaan, skill, dan hidup setelah sekolah.'},
      {label:'Sapa lalu lanjut',effects:[{type:'relationship',target:'andi',value:1}],result:'Nggak semua pertemuan harus panjang. Kalian tetap saling mengingat.'}
    ]};
  }

  if(key==='bu_lestari'){
    if(count>=3 && relation>=20){
      return {id:'social_lestari_network',type:'PERTEMUAN',title:'Bu Lestari Mulai Mengenalkanmu',art,artAlt:'Bu Lestari',text:'Bu Lestari memanggilmu saat dua pedagang lain sedang ngobrol. “Ini Raka, anaknya kalau dimintai tolong nggak banyak alasan.”',choices:[
        {label:'Ikut bantu bongkar pesanan',hint:'2j · Logistik & hubungan berkembang',effects:[{type:'hours',value:2},{type:'fatigue',value:4},{type:'skill',skill:'logistics',value:12},{type:'skill',skill:'social',value:5},{type:'relationship',target:'bu_lestari',value:5},{type:'opportunity',opportunity:{id:'market_helper',name:'Bantu Pedagang Pasar',summary:'Bu Lestari mengenalkanmu ke pedagang lain yang butuh bantuan.',expireAt:state.time.totalHours+72,source:'Pasar Tradisional'}}],result:'Nama kamu mulai berpindah dari satu kios ke kios lain sebagai orang yang bisa diandalkan.'},
        {label:'Duduk dan dengar cerita pasar',hint:'1j · Sosial berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'social',value:8},{type:'relationship',target:'bu_lestari',value:3}],result:'Kamu mulai paham bahwa jaringan di pasar dibangun dari kehadiran yang konsisten, bukan kartu nama.'}
      ]};
    }
    return {id:'social_lestari_meet',type:'PERTEMUAN',title:'Bu Lestari Lagi Senggang',art,artAlt:'Bu Lestari',text:'Di sela ramainya pasar, Bu Lestari sempat duduk sambil menghitung catatan pesanan. Dia menggeser bangku kecil ke arahmu.',choices:[
      {label:'Bantu rapikan stok',hint:'1j · Logistik berkembang',effects:[{type:'hours',value:1},{type:'fatigue',value:3},{type:'skill',skill:'logistics',value:7},{type:'relationship',target:'bu_lestari',value:4}],result:'Bantuan kecil itu lebih berarti daripada kelihatannya. Bu Lestari mulai hafal kebiasaanmu.'},
      {label:'Ngobrol soal dagangan',hint:'1j · Sosial berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'social',value:6},{type:'relationship',target:'bu_lestari',value:3}],result:'Kamu mendengar cerita soal pelanggan, pemasok, dan bagaimana orang bertahan dari minggu yang sepi.'},
      {label:'Pamit dulu',effects:[{type:'relationship',target:'bu_lestari',value:1}],result:'Kamu tetap menyapa meski nggak punya banyak waktu.'}
    ]};
  }

  if(key==='sari'){
    if(count>=3 && relation>=20){
      return {id:'social_sari_after_shift',type:'PERTEMUAN',title:'Sari Ajak Duduk Setelah Shift',art,artAlt:'Sari',text:'Shift Sari hampir selesai. Dia menunjuk meja pojok yang mulai sepi dan bilang kalian bisa duduk sebentar setelah semuanya beres.',choices:[
        {label:'Ngopi setelah shift',hint:'2j · Rp35rb · hubungan makin dekat',effects:[{type:'hours',value:2},{type:'money',value:-35000},{type:'fatigue',value:-5},{type:'skill',skill:'social',value:10},{type:'skill',skill:'hospitality',value:6},{type:'relationship',target:'sari',value:5},{type:'history',text:'Umur 18 · Mulai punya kebiasaan ngobrol dengan Sari setelah shift.'}],result:'Obrolan tanpa urusan kerja membuat kalian saling mengenal sebagai orang, bukan cuma wajah di kafe.'},
        {label:'Janji lain kali',effects:[{type:'relationship',target:'sari',value:2}],result:'Sari mengangguk. Kedekatan nggak harus diburu dalam satu malam.'}
      ]};
    }
    return {id:'social_sari_meet',type:'PERTEMUAN',title:'Sari Sedang di Kafe',art,artAlt:'Sari',text:'Sari mengenal wajahmu dan menyapa di sela pesanan. Kafe lagi cukup tenang untuk ngobrol sebentar.',choices:[
      {label:'Tanya soal kerja di kafe',hint:'1j · Hospitality berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'hospitality',value:7},{type:'relationship',target:'sari',value:4}],result:'Sari cerita soal ritme pelayanan, pelanggan tetap, dan kesalahan kecil yang sering bikin shift berantakan.'},
      {label:'Ngobrol santai',hint:'1j · Sosial berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'social',value:6},{type:'relationship',target:'sari',value:3}],result:'Obrolannya sederhana, tapi Sari mulai melihatmu sebagai pelanggan yang benar-benar dia kenal.'},
      {label:'Cuma pesan minum',effects:[{type:'relationship',target:'sari',value:1}],result:'Kamu menikmati suasana tanpa memaksakan obrolan.'}
    ]};
  }

  if(key==='dimas'){
    return {id:'social_dimas_gym',type:'PERTEMUAN',title:'Dimas Selesai Latihan',art,artAlt:'Dimas',text:'Dimas ternyata rutin mampir ke gym setelah kerja. Di luar gudang dia jauh lebih santai dan nggak terus bicara soal target pengiriman.',choices:[
      {label:'Latihan bareng',hint:'1j · kondisi & hubungan membaik',effects:[{type:'hours',value:1},{type:'fatigue',value:-6},{type:'skill',skill:'logistics',value:5},{type:'relationship',target:'dimas',value:4}],result:'Kalian ngobrol di sela latihan. Hubungan kerja mulai punya sisi yang lebih personal.'},
      {label:'Ngobrol sebentar',hint:'1j · Sosial berkembang',effects:[{type:'hours',value:1},{type:'skill',skill:'social',value:5},{type:'relationship',target:'dimas',value:3}],result:'Dimas cerita sedikit soal tekanan koordinasi yang nggak kelihatan dari lantai gudang.'},
      {label:'Fokus latihan sendiri',effects:[{type:'relationship',target:'dimas',value:1}],result:'Kalian saling menyapa lalu lanjut dengan rutinitas masing-masing.'}
    ]};
  }
  return null;
}

function maybeStartSocialEncounter(state,locationId,presentPeople=[]){
  ensureSocialState(state);
  if(state.pendingEvent || !presentPeople.length) return null;
  const eligible=presentPeople.filter(person=>(state.time.totalHours-(state.social.lastEncounterAt[person.id]??-999))>=30);
  if(!eligible.length) return null;
  eligible.sort((a,b)=>(state.social.lastEncounterAt[a.id]??-999)-(state.social.lastEncounterAt[b.id]??-999));
  const person=eligible[0];
  if(!state.npc?.[person.id]) return null;
  state.npc[person.id].known=true;
  state.social.encounters[person.id]=(state.social.encounters[person.id]||0)+1;
  state.social.lastEncounterAt[person.id]=state.time.totalHours;
  state.social.lastLocationByNpc[person.id]=locationId;
  state.social.hangouts=(state.social.hangouts||0)+1;
  const first=state.social.encounters[person.id]===1;
  if(first){
    addHistory(state,`Umur 18 · Mulai mengenal ${person.name} lewat rutinitas di kota.`);
    addRecent(state,`${person.name} ternyata punya rutinitas sendiri di ${CITY_LOCATIONS[locationId]?.name||'kota'}.`);
  }
  const ev=relationshipRepairEvent(state,person.id)||socialEncounterEvent(state,person.id,locationId);
  if(ev) state.pendingEvent=ev;
  return person;
}
