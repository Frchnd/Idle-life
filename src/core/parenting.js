function clampParenting(value,min=0,max=100){return Math.max(min,Math.min(max,Number(value)||0));}

function ensureParentingState(state){
  const f=ensureFamilyState(state);
  const base={stage:null,stageEventPending:null,lastStageEvent:null,familyTimeCount:0,lastFamilyTimeAt:-9999,lastProcessedAt:state.time?.totalHours||0,sleepDebt:0,careRhythm:60,development:{curiosity:0,warmth:0,independence:0},dominantTrait:null,milestones:[]};
  if(!f.parenting||typeof f.parenting!=='object') f.parenting={};
  const p=f.parenting;
  for(const [k,v] of Object.entries(base)) if(p[k]===undefined) p[k]=Array.isArray(v)?[...v]:(v&&typeof v==='object'?{...v}:v);
  p.development={...base.development,...(p.development||{})};
  if(!Array.isArray(p.milestones)) p.milestones=[];
  p.sleepDebt=clampParenting(p.sleepDebt);
  p.careRhythm=clampParenting(p.careRhythm);
  if(!Number.isFinite(p.lastProcessedAt)) p.lastProcessedAt=state.time?.totalHours||0;
  if(!Number.isFinite(p.lastFamilyTimeAt)) p.lastFamilyTimeAt=-9999;
  return p;
}

function activeChild(state){
  const f=ensureFamilyState(state);
  return f.stage==='parenting'&&Array.isArray(f.children)&&f.children.length?f.children[0]:null;
}

function childAge(state,child=activeChild(state)){
  if(!child) return {days:0,months:0,years:0};
  const hours=Math.max(0,(state.time?.totalHours||0)-(Number(child.joinedAt)||0));
  const days=Math.floor(hours/24),months=Math.floor(days/30),years=Math.floor(months/12);
  return {days,months,years};
}

function parentingStageForMonths(months){
  return PARENTING_STAGES.find(x=>months>=x.minMonths&&months<=x.maxMonths)||PARENTING_STAGES[PARENTING_STAGES.length-1];
}

function currentParentingStage(state){
  const child=activeChild(state);
  return child?parentingStageForMonths(childAge(state,child).months):null;
}

function childAgeLabel(state){
  const age=childAge(state);
  if(age.months<1) return `${Math.max(1,age.days)} hari`;
  if(age.months<24) return `${age.months} bulan`;
  const years=Math.floor(age.months/12),months=age.months%12;
  return months?`${years} th ${months} bln`:`${years} tahun`;
}

function updateDominantChildTrait(state){
  const p=ensureParentingState(state),entries=Object.entries(p.development||{}).sort((a,b)=>(b[1]||0)-(a[1]||0));
  if(entries.length && (entries[0][1]||0)>=4 && (entries[0][1]||0)>((entries[1]?.[1]||0)+1)) p.dominantTrait=entries[0][0];
  return p.dominantTrait;
}

function childTraitSnapshot(state){
  const p=ensureParentingState(state),id=updateDominantChildTrait(state);
  return id&&CHILD_TRAITS[id]?CHILD_TRAITS[id]:null;
}

function parentingConnectionDue(state){
  const child=activeChild(state),stage=currentParentingStage(state),p=ensureParentingState(state);
  if(!child||!stage) return false;
  return (state.time.totalHours-(p.lastFamilyTimeAt||-9999))>=stage.connectionWindowDays*24;
}

function parentingTimeCooldownLeft(state){
  const p=ensureParentingState(state);return Math.max(0,36-((state.time.totalHours||0)-(p.lastFamilyTimeAt||-9999)));
}

function spendFamilyTime(state){
  const child=activeChild(state),p=ensureParentingState(state),stage=currentParentingStage(state);
  if(!child||!stage) return {error:'Belum ada rutinitas parenting aktif.'};
  const cooldown=parentingTimeCooldownLeft(state);
  if(cooldown>0) return {error:`Kalian baru saja punya waktu bersama. Coba lagi sekitar ${Math.ceil(cooldown)} jam lagi.`};
  state.time.totalHours+=4;
  state.player.fatigue=Math.min(100,state.player.fatigue+2);
  p.familyTimeCount=(p.familyTimeCount||0)+1;p.lastFamilyTimeAt=state.time.totalHours;
  p.careRhythm=clampParenting(p.careRhythm+12);p.sleepDebt=clampParenting(p.sleepDebt-4);
  if(state.relationships?.family!==undefined) state.relationships.family+=1;
  if(typeof ensureHealthState==='function'){
    const h=ensureHealthState(state);h.stress=Math.max(0,h.stress-6);h.rhythm=Math.min(100,h.rhythm+5);h.lastRecoveryAt=state.time.totalHours;
  }
  const month=childAge(state,child).months;
  if(stage.id==='infant'||stage.id==='toddler') p.development.curiosity=(p.development.curiosity||0)+1;
  if((state.sharedLife?.conflict||0)<=1) p.development.warmth=(p.development.warmth||0)+1;
  if(stage.id==='toddler'||stage.id==='preschool') p.development.independence=(p.development.independence||0)+.5;
  if(typeof recordSchoolFamilyTime==='function') recordSchoolFamilyTime(state);
  updateDominantChildTrait(state);
  if(typeof addRecent==='function') addRecent(state,`${child.name} mendapat beberapa jam yang benar-benar bebas dari urusan kerja.`);
  return `Waktu bersama ${child.name} · 4 jam. Ritme rumah terasa lebih dekat dan tekanan sedikit turun.`;
}

function parentingWorkFatigueModifier(state){
  const p=ensureParentingState(state);if(!activeChild(state)) return 0;
  if(p.sleepDebt>=75) return 3;if(p.sleepDebt>=48) return 2;if(p.sleepDebt>=25) return 1;return 0;
}
function parentingStudyMultiplier(state){
  const p=ensureParentingState(state);if(!activeChild(state)) return 1;
  return p.sleepDebt>=75?.86:p.sleepDebt>=48?.92:1;
}
function parentingRestRecoveryModifier(state){
  const p=ensureParentingState(state),stage=currentParentingStage(state);if(!stage) return 0;
  let mod=stage.id==='newborn'?-8:stage.id==='infant'?-5:stage.id==='toddler'?-3:-1;
  if(ensureFamilyState(state).parentingStyle==='network') mod+=3;
  if(p.sleepDebt>=70) mod-=3;
  return mod;
}
function parentingPressureModifier(state){
  const p=ensureParentingState(state);if(!activeChild(state)) return 0;
  let value=0;
  if(p.sleepDebt>=75)value+=7;else if(p.sleepDebt>=48)value+=4;else if(p.sleepDebt>=25)value+=2;
  if(p.careRhythm<28)value+=6;else if(p.careRhythm<48)value+=3;
  if(parentingConnectionDue(state)) value+=2;
  return value;
}
function parentingOfflineNeedsTime(state){
  const p=ensureParentingState(state);return !!activeChild(state)&&parentingConnectionDue(state)&&p.careRhythm<45;
}

function processParenting(state,{migration=false}={}){
  const child=activeChild(state),p=ensureParentingState(state),now=state.time.totalHours||0;
  if(!child){p.lastProcessedAt=now;return false;}
  const stage=currentParentingStage(state);
  if(migration){p.stage=stage.id;p.stageEventPending=null;p.lastStageEvent=stage.id;p.lastProcessedAt=now;return false;}
  let changed=false;
  if(!p.stage){p.stage=stage.id;p.lastStageEvent=stage.id;}
  else if(p.stage!==stage.id){
    p.stage=stage.id;p.stageEventPending=stage.id;
    if(!p.milestones.includes(stage.id)) p.milestones.push(stage.id);
    if(typeof addRecent==='function') addRecent(state,`${child.name} memasuki fase baru: ${stage.label}.`);
    changed=true;
  }
  if(p.lastProcessedAt>now) p.lastProcessedAt=now;
  const days=Math.min(360,Math.floor((now-p.lastProcessedAt)/24));
  if(days>0){
    const style=ensureFamilyState(state).parentingStyle;
    const recentHours=now-(p.lastFamilyTimeAt||-9999);
    const connected=recentHours<=stage.connectionWindowDays*24;
    let sleepGain=stage.sleepLoad*days;
    if(style==='network') sleepGain-=.22*days;
    if((state.housing?.id||'')==='outskirts_room') sleepGain-=.08*days;
    p.sleepDebt=clampParenting(p.sleepDebt+Math.max(-.2*days,sleepGain));
    const careDaily=typeof familyCareerCareDailyModifier==='function'?familyCareerCareDailyModifier(state):0;
    p.careRhythm=clampParenting(p.careRhythm+(connected?.8:-1.15)*days+(style==='network'?.15*days:0)+(careDaily*days)-((state.sharedLife?.conflict||0)>=2?.45*days:0));
    if(!connected&&days>=3) p.development.independence=(p.development.independence||0)+.15*days;
    p.lastProcessedAt+=days*24;
    updateDominantChildTrait(state);changed=true;
  }
  return changed;
}

function parentingSnapshot(state){
  const child=activeChild(state);if(!child) return null;
  const p=ensureParentingState(state),stage=currentParentingStage(state),trait=childTraitSnapshot(state),age=childAge(state,child);
  const sleepLabel=p.sleepDebt>=75?'Tidur sangat terpecah':p.sleepDebt>=48?'Kurang tidur':p.sleepDebt>=25?'Tidur agak pendek':'Cukup pulih';
  const rhythmLabel=p.careRhythm>=72?'Hangat & terjaga':p.careRhythm>=48?'Cukup terjaga':p.careRhythm>=28?'Mulai keteteran':'Butuh ruang untuk hadir';
  return {child,age,ageLabel:childAgeLabel(state),stage,trait,sleepDebt:p.sleepDebt,sleepLabel,careRhythm:p.careRhythm,rhythmLabel,familyTimeCount:p.familyTimeCount,connectionDue:parentingConnectionDue(state),cooldownLeft:parentingTimeCooldownLeft(state)};
}

function getNextParentingEvent(state){
  const snap=parentingSnapshot(state);if(!snap||state.pendingEvent) return null;
  const p=ensureParentingState(state),child=snap.child;
  if(p.stageEventPending==='infant'){
    p.stageEventPending=null;p.lastStageEvent='infant';
    return {id:'parenting_infant_stage',type:'KELUARGA',title:`${child.name} Mulai Mengenali Pola Rumah`,art:(typeof housingMeta==='function'?(housingMeta(state).image||'./assets/housing/family_home.webp'):'./assets/housing/family_home.webp'),artAlt:'Rumah keluarga',text:`${child.name} sekarang lebih sering merespons suara, wajah, dan rutinitas yang berulang. Kalian mulai sadar bahwa “hadir” tidak selalu berarti melakukan hal besar.`,choices:[
      {label:'Jaga rutinitas yang hangat',hint:'Kedekatan & ritme rumah menguat',effects:[{type:'parenting_development',trait:'warmth',value:3},{type:'parenting_care',value:8},{type:'health_stress',value:-4}],result:'Kalian menjaga beberapa kebiasaan kecil yang membuat rumah terasa bisa diprediksi dan aman.'},
      {label:'Beri banyak ruang untuk mencoba',hint:'Rasa ingin tahu tumbuh',effects:[{type:'parenting_development',trait:'curiosity',value:3},{type:'parenting_care',value:4}],result:`Kalian membiarkan ${child.name} lebih banyak mengamati dan mencoba dengan ritmenya sendiri.`}
    ]};
  }
  if(p.stageEventPending==='toddler'){
    p.stageEventPending=null;p.lastStageEvent='toddler';
    return {id:'parenting_toddler_stage',type:'FASE KELUARGA',title:`${child.name} Mulai Punya Kemauan Sendiri`,art:(typeof housingMeta==='function'?(housingMeta(state).image||'./assets/housing/family_home.webp'):'./assets/housing/family_home.webp'),artAlt:'Rumah keluarga',text:`Rumah mulai dipenuhi gerak, pilihan kecil, dan kata “mau”. Cara kalian memberi batas sekarang ikut membentuk suasana rumah, bukan sekadar membuat hari lebih mudah.`,choices:[
      {label:'Beri pilihan kecil dan biarkan mencoba',hint:'Kemandirian & rasa ingin tahu',effects:[{type:'parenting_development',trait:'independence',value:3},{type:'parenting_development',trait:'curiosity',value:2},{type:'parenting_care',value:4}],result:`${child.name} mulai belajar bahwa mencoba sendiri boleh, selama rumah tetap punya batas yang jelas.`},
      {label:'Pertahankan rutinitas sederhana',hint:'Ritme keluarga lebih stabil',effects:[{type:'parenting_development',trait:'warmth',value:2},{type:'parenting_care',value:8},{type:'parenting_sleep',value:-5}],result:'Kalian memilih sedikit aturan yang konsisten daripada memenuhi rumah dengan terlalu banyak larangan.'}
    ]};
  }
  if(p.stageEventPending==='preschool'){
    p.stageEventPending=null;p.lastStageEvent='preschool';
    return {id:'parenting_preschool_stage',type:'FASE KELUARGA',title:`Pertanyaan ${child.name} Makin Banyak`,art:(typeof housingMeta==='function'?(housingMeta(state).image||'./assets/housing/family_home.webp'):'./assets/housing/family_home.webp'),artAlt:'Rumah keluarga',text:`${child.name} mulai membawa pertanyaan dan cerita yang tidak selalu punya jawaban cepat. Waktu bersama sekarang terasa lebih seperti percakapan daripada sekadar menjaga.`,choices:[
      {label:'Ikuti rasa penasarannya',hint:'Rasa ingin tahu berkembang',effects:[{type:'parenting_development',trait:'curiosity',value:4},{type:'parenting_care',value:5}],result:'Kalian memberi ruang untuk bertanya, salah, dan mencoba lagi.'},
      {label:'Jaga waktu keluarga yang rutin',hint:'Kedekatan berkembang',effects:[{type:'parenting_development',trait:'warmth',value:4},{type:'parenting_care',value:8}],result:'Kalian menjaga satu-dua kebiasaan bersama yang tetap ada meski hari kerja berubah-ubah.'}
    ]};
  }
  if(snap.connectionDue && p.careRhythm<40 && (state.time.totalHours-(p.lastFamilyTimeAt||-9999))>=7*24){
    return {id:`parenting_connection_${Math.floor(state.time.totalHours/168)}`,type:'KELUARGA',title:'Hari-hari Mulai Lewat Terlalu Cepat',art:(typeof housingMeta==='function'?(housingMeta(state).image||'./assets/housing/family_home.webp'):'./assets/housing/family_home.webp'),artAlt:'Rumah keluarga',text:`Kerja, usaha, dan urusan rumah terus bergerak. ${child.name} baik-baik saja, tapi kalian mulai merasa terlalu banyak hari lewat tanpa benar-benar hadir bersama.`,choices:[
      {label:`Kosongkan waktu untuk ${child.name}`,hint:'4j · ritme keluarga pulih',effects:[{type:'hours',value:4},{type:'parenting_direct_time'},{type:'health_stress',value:-6}],result:'Empat jam itu tidak menyelesaikan semua hal, tapi cukup untuk membuat rumah terasa hadir lagi.'},
      {label:'Minta bantuan jaringan dulu',hint:'Tekanan turun · kedekatan pulih lebih sedikit',effects:[{type:'parenting_support'},{type:'health_stress',value:-4}],result:'Kalian menerima bahwa dukungan orang lain juga bagian dari menjaga keluarga.'}
    ]};
  }
  return null;
}
