const LIFE_PHASES=[
  {id:'finding_footing',minAge:18,maxAge:20,label:'Mencari pijakan',summary:'Banyak hal masih terbuka. Waktu lebih berharga daripada kepastian.'},
  {id:'building_direction',minAge:21,maxAge:24,label:'Membangun arah',summary:'Pilihanmu mulai membentuk pola hidup yang lebih sulit diubah tanpa biaya.'},
  {id:'adult_rhythm',minAge:25,maxAge:29,label:'Menata hidup dewasa',summary:'Stabilitas, ruang pribadi, dan konsekuensi jangka panjang mulai terasa lebih nyata.'},
  {id:'established_life',minAge:30,maxAge:999,label:'Menjaga yang dibangun',summary:'Hidup bukan lagi soal membuka semua pintu, tapi memilih apa yang layak dipertahankan.'}
];

function phaseForAge(age){return LIFE_PHASES.find(p=>age>=p.minAge&&age<=p.maxAge)||LIFE_PHASES[LIFE_PHASES.length-1];}
function currentLifePhase(state){return phaseForAge(getCalendar(state.time.totalHours).age);}
function ensureLifePhaseState(state){
  state.life=state.life||{};
  const cal=getCalendar(state.time.totalHours||0),phase=phaseForAge(cal.age);
  if(!state.life.phase) state.life.phase=phase.id;
  if(!Number.isFinite(state.life.lastBirthdayAge)) state.life.lastBirthdayAge=cal.age;
  if(!Number.isFinite(state.life.phaseEnteredAt)) state.life.phaseEnteredAt=state.time.totalHours||0;
  if(state.life.phaseFocus===undefined) state.life.phaseFocus='open';
  state.life.ageWindows=state.life.ageWindows||{};
  if(state.life.ageWindows.youngTalentTaken===undefined) state.life.ageWindows.youngTalentTaken=false;
  if(state.life.ageWindows.youngTalentOffered===undefined) state.life.ageWindows.youngTalentOffered=false;
  if(state.life.ageWindows.professionalForumTaken===undefined) state.life.ageWindows.professionalForumTaken=false;
  if(state.life.ageWindows.professionalForumOffered===undefined) state.life.ageWindows.professionalForumOffered=false;
  if(state.life.phaseEventPending===undefined) state.life.phaseEventPending=null;
  return state.life;
}

function lifePhaseFocusMeta(state){
  const focus=ensureLifePhaseState(state).phaseFocus;
  if(focus==='stability') return {id:focus,label:'Stabilitas',summary:'Kerja terasa sedikit lebih teratur, tetapi eksplorasi bukan prioritas utama.'};
  if(focus==='explore') return {id:focus,label:'Eksplorasi',summary:'Belajar dan mencoba arah baru lebih efektif, tetapi hari kerja sedikit lebih melelahkan.'};
  if(focus==='balance') return {id:focus,label:'Keseimbangan',summary:'Recovery dan pengelolaan tekanan lebih kuat, tanpa mempercepat karier secara langsung.'};
  return {id:'open',label:'Masih terbuka',summary:'Belum ada fokus fase hidup yang dipilih.'};
}

function lifeStudyMultiplier(state){return ensureLifePhaseState(state).phaseFocus==='explore'?1.15:1;}
function lifeWorkFatigueModifier(state){const focus=ensureLifePhaseState(state).phaseFocus;return focus==='stability'?-1:focus==='explore'?1:0;}
function lifeCareerProgressBonus(state){return ensureLifePhaseState(state).phaseFocus==='stability'?1:0;}
function lifeRestBonus(state){return ensureLifePhaseState(state).phaseFocus==='balance'?6:0;}
function lifePressureModifier(state){return ensureLifePhaseState(state).phaseFocus==='balance'?-5:0;}

function hoursUntilAge(state,targetAge){
  const current=getCalendar(state.time.totalHours).age;
  if(targetAge<=current) return 0;
  const targetDays=(targetAge-START_AGE)*DAYS_PER_YEAR;
  const targetHours=Math.max(0,targetDays*24-START_HOUR);
  return Math.max(0,targetHours-state.time.totalHours);
}

function syncAgeWindowOpportunities(state){
  const life=ensureLifePhaseState(state),cal=getCalendar(state.time.totalHours);
  const hasBasic=['mechanics','learning','social','technology','hospitality','logistics'].some(id=>getSkillTier(state.skills?.[id]||0).id!=='novice');
  if(cal.age>=19&&cal.age<=20&&!life.ageWindows.youngTalentTaken&&!life.ageWindows.youngTalentOffered&&(state.career.workCount>=3||hasBasic)){
    life.ageWindows.youngTalentOffered=true;
    const until21=hoursUntilAge(state,21);
    addOpportunity(state,{id:'young_talent_program',name:'Program Talenta Muda Kota',summary:'12j · Rp100rb · belajar & jaringan · hanya sebelum umur 21',expireAt:state.time.totalHours+Math.min(30*24,Math.max(24,until21))});
    addRecent(state,'Usiamu masih membuka Program Talenta Muda Kota untuk waktu terbatas.');
  }
  const hasCareerDepth=(state.career.workCount||0)>=8||(state.education?.certifications?.length||0)>0;
  if(cal.age>=21&&cal.age<=24&&!life.ageWindows.professionalForumTaken&&!life.ageWindows.professionalForumOffered&&hasCareerDepth){
    life.ageWindows.professionalForumOffered=true;
    addOpportunity(state,{id:'young_professional_forum',name:'Forum Profesional Muda',summary:'6j · Rp60rb · jaringan & arah karier · fase umur 21–24',expireAt:state.time.totalHours+30*24});
    addRecent(state,'Fase hidupmu membuka forum profesional muda di kota.');
  }
}

function processLifePhases(state,{migration=false}={}){
  const life=ensureLifePhaseState(state),cal=getCalendar(state.time.totalHours),phase=phaseForAge(cal.age);
  let changed=false;
  if(migration){
    life.lastBirthdayAge=cal.age;
    life.phase=phase.id;
    life.phaseEnteredAt=state.time.totalHours;
    life.phaseEventPending=null;
    syncAgeWindowOpportunities(state);
    return false;
  }
  if(cal.age>life.lastBirthdayAge){
    for(let age=life.lastBirthdayAge+1;age<=cal.age;age++){
      addHistory(state,`Umur ${age} · Memasuki tahun hidup yang baru.`);
      addRecent(state,`${state.player.name||'Raka'} sekarang berusia ${age} tahun.`);
    }
    life.lastBirthdayAge=cal.age;
    changed=true;
  }
  if(life.phase!==phase.id){
    life.phase=phase.id;
    life.phaseEnteredAt=state.time.totalHours;
    life.phaseEventPending=phase.id;
    addHistory(state,`Umur ${cal.age} · Memasuki fase “${phase.label}”.`);
    changed=true;
  }
  syncAgeWindowOpportunities(state);
  return changed;
}

function lifePhaseChoiceEffects(focus){
  return [
    {type:'path_set',path:'life.phaseFocus',value:focus},
    {type:'path_set',path:'life.phaseEventPending',value:null}
  ];
}

function getNextLifePhaseEvent(state){
  const life=ensureLifePhaseState(state),phaseId=life.phaseEventPending;
  if(!phaseId) return null;
  const phase=LIFE_PHASES.find(x=>x.id===phaseId)||currentLifePhase(state),age=getCalendar(state.time.totalHours).age;
  if(phaseId==='building_direction') return event('life_phase_21','FASE HIDUP',`Umur ${age}: Hidup Mulai Punya Bentuk`,'Beberapa tahun pertama sudah lewat. Sekarang keputusan kecil mulai membentuk pola: bagaimana kamu bekerja, belajar, menjaga uang, dan memberi ruang untuk diri sendiri. Fokus ini bukan kontrak permanen—nanti hidup bisa berubah lagi.',[
    {label:'Bangun kestabilan',hint:'Kerja sedikit lebih teratur · progres karier lebih kuat',effects:lifePhaseChoiceEffects('stability'),result:'Kamu memilih membuat hidup lebih dapat diprediksi tanpa menutup pintu lain sepenuhnya.'},
    {label:'Tetap eksploratif',hint:'Belajar lebih efektif · kerja sedikit lebih melelahkan',effects:lifePhaseChoiceEffects('explore'),result:'Kamu masih memberi ruang besar untuk mencoba hal baru sebelum hidup terlalu mengeras.'},
    {label:'Jaga keseimbangan',hint:'Recovery & pengelolaan tekanan lebih kuat',effects:lifePhaseChoiceEffects('balance'),result:'Kamu memilih tidak membiarkan semua kemajuan dibayar dengan ritme hidup yang berantakan.'}
  ]);
  if(phaseId==='adult_rhythm') return event('life_phase_25','FASE HIDUP',`Umur ${age}: Yang Dipertahankan Mulai Penting`,'Karier, hubungan, rumah, dan tanggung jawab sekarang lebih mudah saling bertabrakan. Kamu masih bisa berubah arah, tetapi setiap perubahan mulai punya biaya waktu dan perhatian yang lebih terasa.',[
    {label:'Perkuat fondasi',hint:'Stabilitas kerja & rutinitas',effects:lifePhaseChoiceEffects('stability'),result:'Kamu memilih membuat fondasi hidup lebih kuat sebelum mengejar hal lain.'},
    {label:'Masih mau mencoba',hint:'Belajar & eksplorasi tetap kuat',effects:lifePhaseChoiceEffects('explore'),result:'Kamu menolak anggapan bahwa usia ini berarti semua pilihan harus sudah selesai.'},
    {label:'Jaga ruang hidup',hint:'Tekanan lebih terkendali · recovery lebih baik',effects:lifePhaseChoiceEffects('balance'),result:'Kamu memilih menjaga kapasitas diri supaya semua yang sudah dibangun tidak runtuh karena terlalu padat.'}
  ]);
  if(phaseId==='established_life') return event('life_phase_30','FASE HIDUP',`Umur ${age}: Hidup yang Kamu Bangun Mulai Menetap`,'Beberapa hal sekarang punya sejarah. Pekerjaan, orang, tempat, dan kebiasaan bukan lagi sekadar percobaan. Fase ini akan menjadi jembatan menuju kehidupan jangka panjang dan legacy.',[
    {label:'Jaga kestabilan',effects:lifePhaseChoiceEffects('stability'),result:'Kamu memilih melindungi fondasi yang sudah ada.'},
    {label:'Tetap berkembang',effects:lifePhaseChoiceEffects('explore'),result:'Kamu tetap memberi ruang untuk belajar dan perubahan.'},
    {label:'Jaga keberlanjutan',effects:lifePhaseChoiceEffects('balance'),result:'Kamu memprioritaskan ritme yang bisa dipertahankan untuk jangka panjang.'}
  ]);
  life.phaseEventPending=null;
  return null;
}

function lifePhaseSnapshot(state){
  const life=ensureLifePhaseState(state),cal=getCalendar(state.time.totalHours),phase=phaseForAge(cal.age),focus=lifePhaseFocusMeta(state);
  const daysIntoYear=((cal.month-1)*30)+(cal.day-1);
  const daysToBirthday=Math.max(0,DAYS_PER_YEAR-daysIntoYear);
  return {age:cal.age,phase,focus,daysToBirthday,nextAge:cal.age+1};
}
