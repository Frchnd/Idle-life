function ensureFamilyState(state){
  const base={
    intent:'undecided',discussionAt:-9999,deferredUntil:-9999,prepared:false,preparedAt:null,
    stage:'none',planStartedAt:null,arrivalAt:null,arrivalPending:false,arrivalEventSeen:false,
    children:[],parentingStyle:'shared',lastMilestoneAt:-9999,lastProcessedAt:state.time?.totalHours||0,
    totalSpent:0,lastPrepareAt:-9999
  };
  if(!state.family||typeof state.family!=='object') state.family={};
  const f=state.family;
  for(const [key,value] of Object.entries(base)) if(f[key]===undefined) f[key]=Array.isArray(value)?[...value]:value;
  if(!FAMILY_INTENTS[f.intent]&&f.intent!=='undecided') f.intent='undecided';
  if(!['none','waiting','parenting'].includes(f.stage)) f.stage='none';
  if(!Array.isArray(f.children)) f.children=[];
  if(!['shared','network'].includes(f.parentingStyle)) f.parentingStyle='shared';
  if(!Number.isFinite(f.lastProcessedAt)) f.lastProcessedAt=state.time?.totalHours||0;
  return f;
}

function familyPartnerName(state){
  const p=typeof ensurePartnershipState==='function'?ensurePartnershipState(state):state.partnership;
  return PARTNERSHIP_CANDIDATES?.[p?.partner]?.name||'pasanganmu';
}

function familyIntentLabel(state){
  const f=ensureFamilyState(state);
  return f.intent==='undecided'?'Belum dibicarakan':(FAMILY_INTENTS[f.intent]?.name||'Belum dibicarakan');
}

function familyFullMonthlyCost(state){
  const f=ensureFamilyState(state);
  if(f.stage!=='parenting'||!f.children.length) return 0;
  const index=typeof ensureWorldState==='function'?(ensureWorldState(state).costIndex||100):(state.world?.costIndex||100);
  return Math.round((FAMILY_CHILD_PROFILE.baseMonthlyCost*f.children.length*index/100)/10000)*10000;
}

function familyCostBreakdown(state){
  const full=familyFullMonthlyCost(state);
  if(!full) return {full:0,player:0,partner:0};
  const shared=typeof ensureSharedLifeState==='function'?ensureSharedLifeState(state):state.sharedLife;
  const share=shared?.cohabiting&&typeof sharedLifePlayerShare==='function'?sharedLifePlayerShare(state):1;
  const player=Math.round((full*share)/10000)*10000;
  return {full,player,partner:Math.max(0,full-player)};
}

function familyReadiness(state){
  const f=ensureFamilyState(state),s=typeof ensureSharedLifeState==='function'?ensureSharedLifeState(state):state.sharedLife,p=typeof ensurePartnershipState==='function'?ensurePartnershipState(state):state.partnership;
  const now=state.time?.totalHours||0,age=typeof getCalendar==='function'?getCalendar(now).age:18;
  const blockers=[],signals=[];
  if(s?.stage!=='married') blockers.push('Belum menikah');
  if(!s?.cohabiting) blockers.push('Belum tinggal bersama');
  if(age<23) blockers.push('Fase hidup masih sangat awal');
  if((p?.strain||0)>1||Number(s?.conflict||0)>1) blockers.push('Hubungan/rumah sedang tegang');
  const h=typeof ensureHealthState==='function'?ensureHealthState(state):state.health;
  if((h?.stress||0)>=75) blockers.push('Tekanan hidup terlalu tinggi');
  const monthly=state.economy?.livingCost||0;
  const reserves=(state.player?.money||0)+(state.finance?.emergencyFund||0);
  if(monthly>0&&reserves<monthly*.75) blockers.push('Cadangan keuangan masih tipis');
  const home=typeof housingMeta==='function'?housingMeta(state):null;
  if(home?.privacy==='Terbatas') blockers.push('Ruang tinggal belum cukup privat');
  if(f.prepared) signals.push('Ruang & kebutuhan awal sudah disiapkan');
  if((state.finance?.emergencyFund||0)>=Math.max(500000,monthly*.75)) signals.push('Ada dana darurat');
  if((p?.trust||0)>=35) signals.push('Kepercayaan pasangan kuat');
  const ready=blockers.length===0&&f.prepared&&f.intent==='parenthood';
  return {ready,blockers,signals,age,reserves,monthly};
}

function setFamilyIntent(state,intent){
  const f=ensureFamilyState(state);
  if(!FAMILY_INTENTS[intent]) return false;
  f.intent=intent;f.discussionAt=state.time.totalHours;f.lastMilestoneAt=state.time.totalHours;
  if(intent==='unsure') f.deferredUntil=state.time.totalHours+180*24;
  if(intent==='couple_only') f.deferredUntil=Number.MAX_SAFE_INTEGER;
  if(intent!=='parenthood'){f.prepared=false;f.preparedAt=null;}
  addRecent(state,intent==='parenthood'?'Kalian sepakat ingin membuka kemungkinan menjadi orang tua ketika hidup cukup siap.':intent==='unsure'?'Kalian sepakat belum perlu punya jawaban soal anak sekarang.':'Kalian memilih hidup berdua sebagai bentuk keluarga yang lengkap untuk kalian.');
  return true;
}

function deferFamilyDiscussion(state,days=180){
  const f=ensureFamilyState(state);f.intent='unsure';f.deferredUntil=state.time.totalHours+days*24;f.discussionAt=state.time.totalHours;return true;
}

function prepareForFamily(state){
  const f=ensureFamilyState(state),s=ensureSharedLifeState(state);
  if(f.intent!=='parenthood') return {error:'Kalian belum memilih jalur untuk menjadi orang tua.'};
  if(s.stage!=='married'||!s.cohabiting) return {error:'Kalian belum berada di fase hidup bersama yang cukup stabil.'};
  if(f.prepared) return {error:'Persiapan rumah dasar sudah selesai.'};
  const cost=1200000;
  if(state.player.money<cost) return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk menyiapkan ruang dan kebutuhan awal.`};
  state.player.money-=cost;state.time.totalHours+=8;f.prepared=true;f.preparedAt=state.time.totalHours;f.totalSpent+=cost;f.lastPrepareAt=state.time.totalHours;
  if(typeof addRecent==='function') addRecent(state,'Kalian menyiapkan ruang, kebutuhan dasar, dan sedikit cadangan waktu untuk kemungkinan keluarga yang lebih besar.');
  if(typeof addHistory==='function') addHistory(state,'Umur 18 · Mulai menyiapkan rumah untuk fase keluarga berikutnya.');
  return `Persiapan keluarga selesai · -Rp${cost.toLocaleString('id-ID')} · 8 jam.`;
}

function startParenthoodPlan(state){
  const f=ensureFamilyState(state),ready=familyReadiness(state);
  if(!ready.ready) return false;
  f.stage='waiting';f.planStartedAt=state.time.totalHours;f.arrivalAt=state.time.totalHours+180*24;f.lastMilestoneAt=state.time.totalHours;
  if(typeof addRecent==='function') addRecent(state,'Kalian memulai proses menuju menjadi orang tua. Jalannya tidak harus sama untuk setiap keluarga.');
  return true;
}

function setParentingStyle(state,style){
  const f=ensureFamilyState(state);f.parentingStyle=style==='network'?'network':'shared';f.arrivalPending=false;f.arrivalEventSeen=true;
  if(style==='network'&&state.relationships?.family!==undefined) state.relationships.family+=3;
  if(typeof ensureHealthState==='function'){
    const h=ensureHealthState(state);h.stress=Math.max(0,h.stress-(style==='network'?7:3));h.rhythm=Math.min(100,h.rhythm+4);
  }
  return true;
}

function processFamily(state,{migration=false}={}){
  const f=ensureFamilyState(state),now=state.time.totalHours||0;
  if(f.lastProcessedAt>now) f.lastProcessedAt=now;
  if(migration){f.lastProcessedAt=now;return false;}
  let changed=false;
  if(f.stage==='waiting'&&Number.isFinite(f.arrivalAt)&&now>=f.arrivalAt){
    if(!f.children.length){
      f.children.push({id:FAMILY_CHILD_PROFILE.id,name:FAMILY_CHILD_PROFILE.name,joinedAt:f.arrivalAt});
      f.stage='parenting';f.arrivalPending=true;f.lastMilestoneAt=now;
      if(!state.player.statuses.includes('orang_tua')) state.player.statuses.push('orang_tua');
      if(typeof addHistory==='function') addHistory(state,`Umur 18 · ${FAMILY_CHILD_PROFILE.name} hadir dan kalian memasuki fase sebagai orang tua.`);
      if(typeof addRecent==='function') addRecent(state,`${FAMILY_CHILD_PROFILE.name} sekarang menjadi bagian dari rumah kalian.`);
      changed=true;
    }
  }
  f.lastProcessedAt=now;
  return changed;
}

function familyPressureModifier(state){
  const f=ensureFamilyState(state);
  if(f.stage!=='parenting') return 0;
  let value=f.parentingStyle==='network'?4:7;
  if((state.sharedLife?.conflict||0)>=2) value+=4;
  return value;
}

function familySnapshot(state){
  const f=ensureFamilyState(state),ready=familyReadiness(state),cost=familyCostBreakdown(state);
  const child=f.children[0]||null;
  let stageLabel='Belum direncanakan';
  if(f.intent==='couple_only') stageLabel='Memilih hidup berdua';
  else if(f.intent==='unsure') stageLabel='Belum menentukan';
  else if(f.stage==='waiting') stageLabel='Menunggu fase berikutnya';
  else if(f.stage==='parenting') stageLabel='Menjadi orang tua';
  else if(f.intent==='parenthood') stageLabel=f.prepared?'Rumah sudah disiapkan':'Ingin menjadi orang tua';
  return {...f,stageLabel,intentLabel:familyIntentLabel(state),readiness:ready,cost,child,partnerName:familyPartnerName(state)};
}

function getNextFamilyEvent(state){
  const f=ensureFamilyState(state),s=ensureSharedLifeState(state),p=ensurePartnershipState(state),now=state.time.totalHours,age=getCalendar(now).age;
  if(state.pendingEvent||!p.partner||s.stage!=='married') return null;
  const def=PARTNERSHIP_CANDIDATES[p.partner];if(!def)return null;
  if(f.intent==='undecided'&&age>=23&&s.marriedAt!==null&&now-(s.marriedAt||now)>=20*24&&p.strain<=1&&s.conflict<=1&&now>=f.deferredUntil){
    f.discussionAt=now;
    return {id:'family_direction_talk',type:'KELUARGA',title:'Keluarga Seperti Apa yang Kalian Inginkan?',art:def.image,artAlt:def.name,text:`Menikah tidak otomatis berarti harus punya anak. Setelah cukup lama menjalani rumah bersama, kamu dan ${def.name} akhirnya membicarakan bentuk keluarga yang benar-benar kalian inginkan—tanpa jawaban yang dianggap paling benar.`,choices:[
      {label:'Suatu hari ingin menjadi orang tua',hint:'Buka jalur persiapan keluarga · belum ada anak otomatis',effects:[{type:'family_intent',value:'parenthood'}],result:'Kalian sepakat membuka kemungkinan itu, tapi hanya kalau rumah, uang, waktu, dan hubungan terasa cukup siap.'},
      {label:'Belum yakin',hint:'Topik ditunda sekitar 6 bulan · tanpa penalti',effects:[{type:'family_intent',value:'unsure'}],result:'Kalian sepakat belum perlu memaksa jawaban untuk sesuatu yang akan mengubah hidup begitu besar.'},
      {label:'Kami ingin hidup berdua',hint:'Jalur hidup valid · game berhenti menawarkan anak',effects:[{type:'family_intent',value:'couple_only'}],result:'Kalian memilih hidup berdua. Itu bukan jalur yang “kurang”; itu bentuk keluarga yang memang kalian pilih.'}
    ]};
  }
  if(f.intent==='unsure'&&now>=f.deferredUntil&&now-(f.discussionAt||-9999)>=120*24){
    f.discussionAt=now;
    return {id:'family_direction_revisit',type:'KELUARGA',title:'Topik Itu Muncul Lagi',art:def.image,artAlt:def.name,text:`Beberapa bulan sudah lewat sejak kalian memilih belum menjawab soal anak. Hidup berubah sedikit, tapi tidak ada kewajiban untuk mengubah jawaban hanya karena waktu berjalan.`,choices:[
      {label:'Sekarang ingin membuka kemungkinan',hint:'Buka persiapan keluarga',effects:[{type:'family_intent',value:'parenthood'}],result:'Kalian mulai melihat kemungkinan menjadi orang tua dengan lebih serius.'},
      {label:'Masih belum yakin',hint:'Tunda lagi · tanpa penalti',effects:[{type:'family_defer',days:180}],result:'Kalian kembali memberi ruang untuk hidup berjalan tanpa memaksa keputusan.'},
      {label:'Kami memilih hidup berdua',hint:'Tutup jalur anak untuk hubungan ini',effects:[{type:'family_intent',value:'couple_only'}],result:'Kalian akhirnya punya jawaban yang terasa milik kalian sendiri.'}
    ]};
  }
  const readiness=familyReadiness(state);
  if(f.intent==='parenthood'&&f.stage==='none'&&f.prepared&&readiness.ready&&now>=f.deferredUntil&&now-(f.lastMilestoneAt||-9999)>=14*24){
    f.lastMilestoneAt=now;
    return {id:'family_start_parenthood',type:'FASE HIDUP',title:'Apakah Sekarang Waktunya?',art:def.image,artAlt:def.name,text:`Rumah sudah disiapkan, hubungan cukup tenang, dan kalian punya sedikit cadangan untuk hal yang tidak bisa diprediksi. Menjadi orang tua tetap akan mengubah ritme hidup—kesiapan tidak pernah berarti semuanya sempurna.`,choices:[
      {label:'Mulai proses menjadi orang tua',hint:'Fase baru dimulai · anak tidak hadir seketika',effects:[{type:'family_start'}],result:'Kalian memulai proses menuju menjadi orang tua. Game sengaja tidak memaksakan satu bentuk biologis atau jalur keluarga tertentu.'},
      {label:'Tunggu beberapa bulan lagi',hint:'Tunda 90 hari · tanpa penalti',effects:[{type:'family_defer_start',days:90}],result:'Kalian memilih menikmati stabilitas yang baru dibangun sedikit lebih lama.'}
    ]};
  }
  if(f.arrivalPending&&!f.arrivalEventSeen&&f.stage==='parenting'&&f.children.length){
    f.arrivalEventSeen=true;
    return {id:'family_first_child_arrival',type:'KELUARGA',title:`Rumah Sekarang Punya Ritme Baru`,art:'./assets/scenes/home.webp',artAlt:'Rumah keluarga',text:`${f.children[0].name} sekarang menjadi bagian dari rumah kalian. Uang, tidur, dan waktu kosong akan terasa berbeda. Pertanyaan pertama bukan soal menjadi orang tua “sempurna”, tapi bagaimana kalian akan berbagi beban di hari-hari biasa.`,choices:[
      {label:'Bagi ritme berdua',hint:'Tekankan kerja sama di dalam rumah',effects:[{type:'family_parenting_style',value:'shared'}],result:'Kalian sepakat belajar membagi malam buruk, pekerjaan rumah, dan waktu kerja tanpa menghitung semuanya sebagai utang satu sama lain.'},
      {label:'Libatkan jaringan keluarga',hint:'Sedikit lebih ringan untuk tekanan · hubungan keluarga naik',effects:[{type:'family_parenting_style',value:'network'}],result:'Kalian memilih menerima bantuan orang terdekat ketika memang perlu. Kemandirian tidak harus berarti melakukan semuanya sendiri.'}
    ]};
  }
  return null;
}
