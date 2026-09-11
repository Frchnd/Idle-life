function schoolingClamp(value,min=0,max=100){return Math.max(min,Math.min(max,Number(value)||0));}

function ensureSchoolingState(state){
  const f=ensureFamilyState(state),now=state.time?.totalHours||0;
  const base={
    stage:'not_started',schoolId:null,enrolledAt:null,choiceReady:false,choiceReadyAt:null,
    supportMode:null,supportReady:false,supportReadyAt:null,lastSupportChangeAt:-9999,
    lastProcessedAt:now,attendanceRhythm:62,adaptation:50,schoolDays:0,schoolYears:0,
    parentApproach:null,parentApproachReady:false,parentApproachReadyAt:null,
    yearMilestonePending:false,lastYearMilestone:0,historyCount:0,migrationGraceUntil:null
  };
  if(!f.schooling||typeof f.schooling!=='object')f.schooling={};
  const s=f.schooling;for(const [k,v] of Object.entries(base))if(s[k]===undefined)s[k]=v;
  if(!['not_started','eligible','enrolled'].includes(s.stage))s.stage='not_started';
  if(s.schoolId&&!SCHOOLING_OPTIONS[s.schoolId])s.schoolId=null;
  if(s.supportMode&&!SCHOOL_SUPPORT_MODES[s.supportMode])s.supportMode=null;
  s.attendanceRhythm=schoolingClamp(s.attendanceRhythm);s.adaptation=schoolingClamp(s.adaptation);
  if(!Number.isFinite(s.lastProcessedAt))s.lastProcessedAt=now;
  return s;
}

function schoolingEligible(state){const child=activeChild(state);return !!child&&childAge(state,child).months>=60;}
function schoolingActive(state){const s=ensureSchoolingState(state);return schoolingEligible(state)&&s.stage==='enrolled'&&!!s.schoolId;}
function schoolingOption(state){const s=ensureSchoolingState(state);return s.schoolId?SCHOOLING_OPTIONS[s.schoolId]||null:null;}
function schoolingSupport(state){const s=ensureSchoolingState(state);return s.supportMode?SCHOOL_SUPPORT_MODES[s.supportMode]||null:null;}
function schoolingIndexedCost(state,amount){const idx=Math.max(80,Number(state.world?.costIndex)||100);return Math.round((Number(amount||0)*idx/100)/10000)*10000;}
function schoolingMonthlyCost(state){if(!schoolingActive(state))return 0;const school=schoolingOption(state),support=schoolingSupport(state);return schoolingIndexedCost(state,(school?.baseMonthlyCost||0)+(support?.baseMonthlyCost||0));}
function schoolingSupportMonthlyCost(state,id){const support=SCHOOL_SUPPORT_MODES[id];return support?schoolingIndexedCost(state,support.baseMonthlyCost||0):0;}

function schoolingCommuteHours(state){
  const school=schoolingOption(state);if(!school)return 0;
  const housingId=state.housing?.id||'family_home';const raw=Math.max(0,Number(school.commute?.[housingId]||0));
  if(typeof personalFinanceUnlocked!=='function'||!personalFinanceUnlocked(state)||typeof currentTransport!=='function')return raw;
  const t=currentTransport(state),eff=typeof transportAssetEfficiency==='function'?transportAssetEfficiency(state,t.id):1;
  return Math.max(0,raw-(Number(t.cityReduction||0)*eff));
}

function schoolingEnvironmentInfluence(state){
  const id=state.housing?.id||'family_home';
  if(id==='family_home')return {stability:1,people:1,presence:1};
  if(id==='rented_room')return {curiosity:1,systems:1,confidence:1};
  if(id==='shared_house')return {people:1,empathy:1,confidence:1};
  if(id==='outskirts_room')return {focus:1,independence:1,stability:1};
  return {};
}

function schoolingSupportCooldownLeft(state){const s=ensureSchoolingState(state);return Math.max(0,60*24-((state.time?.totalHours||0)-(s.lastSupportChangeAt||-9999)));}
function selectSchool(state,id){
  const s=ensureSchoolingState(state),school=SCHOOLING_OPTIONS[id],child=activeChild(state);if(!child||!schoolingEligible(state)||!school)return false;
  s.stage='enrolled';s.schoolId=id;s.enrolledAt=state.time.totalHours;s.choiceReady=false;s.supportReady=false;s.supportReadyAt=state.time.totalHours+7*24;s.parentApproachReadyAt=state.time.totalHours+120*24;s.lastProcessedAt=state.time.totalHours;
  s.attendanceRhythm=schoolingClamp(64-schoolingCommuteHours(state)*7);s.adaptation=52;
  if(typeof familyCareerCareDailyModifier==='function')ensureParentingState(state).careRhythm=clampParenting(ensureParentingState(state).careRhythm+5);
  if(typeof legacyChildProfile==='function'){
    const profile=legacyChildProfile(state);applyLegacyInfluenceMap(state,school.influence||{});applyLegacyInfluenceMap(state,schoolingEnvironmentInfluence(state));
    legacyAddUnique(profile.formativeTags,`school_${id}`);legacyRecordEducation(state,{id:'primary_start',schoolId:id,schoolName:school.name,startedAt:state.time.totalHours,status:'active'});
    legacyRecordMilestone(state,'school_start',`Mulai sekolah di ${school.name}`,{schoolId:id});scheduleLegacyConsequence(state,`school_fit_${Math.floor(state.time.totalHours)}`,120,{schoolId:id});
  }
  if(typeof addHistory==='function')addHistory(state,`Umur ${getCalendar(state.time.totalHours).age} · ${child.name} mulai sekolah di ${school.name}.`);
  if(typeof addRecent==='function')addRecent(state,`${child.name} mulai sekolah di ${school.name}. Ritme keluarga sekarang ikut dipengaruhi biaya dan perjalanan sekolah.`);
  if(typeof syncLivingCost==='function')syncLivingCost(state);return true;
}

function changeSchoolSupport(state,id,{force=false}={}){
  const s=ensureSchoolingState(state),support=SCHOOL_SUPPORT_MODES[id];if(!schoolingActive(state)||!support)return {error:'Dukungan sekolah belum bisa diatur.'};
  if(s.supportMode===id)return force?`${support.name} tetap menjadi pola dukungan sekolah.`:{error:'Pola dukungan itu sudah digunakan.'};
  const left=schoolingSupportCooldownLeft(state);if(!force&&left>0)return {error:`Pola dukungan sekolah baru bisa diubah lagi sekitar ${Math.ceil(left/24)} hari.`};
  s.supportMode=id;s.supportReady=false;s.lastSupportChangeAt=state.time.totalHours;
  if(typeof legacyChildProfile==='function')scheduleLegacyConsequence(state,`support_pattern_${id}_${Math.floor(state.time.totalHours)}`,120,{mode:id});
  if(typeof ensureParentingState==='function')ensureParentingState(state).careRhythm=clampParenting(ensureParentingState(state).careRhythm+(id==='home_routine'?3:id==='balanced_support'?5:7));
  if(typeof syncLivingCost==='function')syncLivingCost(state);if(typeof addRecent==='function')addRecent(state,`Dukungan sekolah berubah menjadi “${support.name}”.`);
  return `${support.name} mulai dipakai · sekitar ${schoolingSupportMonthlyCost(state,id).toLocaleString('id-ID')} rupiah per bulan.`;
}

function chooseLegacyParentingApproach(state,approach){
  const s=ensureSchoolingState(state);if(!schoolingActive(state))return false;s.parentApproach=approach;s.parentApproachReady=false;
  const profile=typeof legacyChildProfile==='function'?legacyChildProfile(state):null;
  if(approach==='explore'){ensureParentingState(state).development.curiosity=(ensureParentingState(state).development.curiosity||0)+2;legacyAddPattern(state,'autonomy',1);}
  else if(approach==='structure'){legacyAddPattern(state,'stability',1);legacyAddAbility(state,'focus',1);}
  else if(approach==='achievement'){legacyAddPattern(state,'pressure',1);legacyAddAbility(state,'focus',1);}
  if(profile)scheduleLegacyConsequence(state,`parent_approach_${approach}_${Math.floor(state.time.totalHours)}`,180,{approach});
  if(typeof addRecent==='function')addRecent(state,approach==='explore'?'Kalian memberi Nara lebih banyak ruang mengeksplorasi minatnya.':approach==='structure'?'Kalian membangun rutinitas belajar yang konsisten di rumah.':'Kalian menaikkan ekspektasi hasil belajar Nara.');
  return true;
}

function schoolYearResponse(state,response){
  const s=ensureSchoolingState(state),profile=typeof legacyChildProfile==='function'?legacyChildProfile(state):null;if(!schoolingActive(state))return false;
  s.yearMilestonePending=false;s.lastYearMilestone=Math.max(s.lastYearMilestone,s.schoolYears);
  if(response==='listen'){
    legacyAddPattern(state,'autonomy',1);legacyAddSocial(state,'confidence',1);ensureParentingState(state).careRhythm=clampParenting(ensureParentingState(state).careRhythm+5);
    if(profile)legacyAddUnique(profile.formativeTags,'suara_anak_didengar');
  }else{
    legacyAddAbility(state,'focus',1);legacyAddPattern(state,'stability',1);legacyAddPattern(state,'pressure',1);
    if(profile)legacyAddUnique(profile.formativeTags,'evaluasi_rutin');
  }
  legacyRecordMilestone(state,'first_school_year','Menyelesaikan tahun pertama sekolah',{schoolId:s.schoolId});
  legacyRecordEducation(state,{id:'primary_year_1',schoolId:s.schoolId,schoolName:schoolingOption(state)?.name||'',completedAt:state.time.totalHours,status:'completed'});
  return true;
}

function recordSchoolFamilyTime(state){
  if(!schoolingActive(state)||typeof legacyChildProfile!=='function')return;
  legacyAddPattern(state,'presence',1);legacyAddSocial(state,'empathy',.5);
  const profile=legacyChildProfile(state);if((profile.familyPatterns.presence||0)>=5)legacyAddUnique(profile.formativeTags,'orang_tua_hadir');
}

function schoolingFamilyPressureModifier(state){
  if(!schoolingActive(state))return 0;const s=ensureSchoolingState(state),support=schoolingSupport(state);let value=support?.pressure||1;
  const commute=schoolingCommuteHours(state);if(commute>=2)value+=3;else if(commute>=1)value+=1;
  if(s.attendanceRhythm<40)value+=3;else if(s.attendanceRhythm<55)value+=1;return value;
}
function schoolingWorkFatigueModifier(state){if(!schoolingActive(state))return 0;return schoolingSupport(state)?.workFatigue||0;}

function processSchooling(state,{migration=false}={}){
  const s=ensureSchoolingState(state),child=activeChild(state),now=state.time?.totalHours||0;
  if(!child){s.lastProcessedAt=now;return false;}
  const eligible=schoolingEligible(state);let changed=false;
  if(migration){
    s.lastProcessedAt=now;
    if(eligible&&s.stage==='not_started'){s.stage='eligible';s.choiceReady=false;s.choiceReadyAt=now+3*24;s.migrationGraceUntil=s.choiceReadyAt;}
    return false;
  }
  if(eligible&&s.stage==='not_started'){
    s.stage='eligible';s.choiceReadyAt=now+3*24;s.choiceReady=false;
    if(typeof addRecent==='function')addRecent(state,`${child.name} mulai mendekati ritme sekolah. Kalian punya beberapa hari untuk membicarakan pilihan yang masuk akal.`);changed=true;
  }
  if(s.stage==='eligible'&&!s.choiceReady&&Number(s.choiceReadyAt)<=now){s.choiceReady=true;changed=true;}
  if(s.stage==='enrolled'){
    if(!s.supportMode&&!s.supportReady&&Number(s.supportReadyAt)<=now){s.supportReady=true;changed=true;}
    if(!s.parentApproach&& !s.parentApproachReady && Number(s.parentApproachReadyAt)<=now){s.parentApproachReady=true;changed=true;}
    if(s.lastProcessedAt>now)s.lastProcessedAt=now;
    const days=Math.min(360,Math.floor((now-s.lastProcessedAt)/24));
    if(days>0){
      const support=schoolingSupport(state),commute=schoolingCommuteHours(state),home=schoolingEnvironmentInfluence(state),p=ensureParentingState(state);
      const familyStable=(state.sharedLife?.conflict||0)<=1&&p.careRhythm>=45;
      const rhythmDelta=((support?.pressure||1)<=0?.18:.04)*days-(commute>=2?.28:commute>=1?.12:0)*days+(familyStable?.08:-.08)*days;
      s.attendanceRhythm=schoolingClamp(s.attendanceRhythm+rhythmDelta);
      s.adaptation=schoolingClamp(s.adaptation+(familyStable?.12:.02)*days-(commute>=2?.08:0)*days);
      if(days>=7&&typeof legacyChildProfile==='function'){
        const school=schoolingOption(state),weeks=Math.max(1,Math.floor(days/7));
        if(school?.id==='neighborhood_public'){legacyAddInterest(state,'people',.12*weeks);legacyAddAbility(state,'focus',.08*weeks);}
        if(school?.id==='city_public'){legacyAddInterest(state,'systems',.12*weeks);legacyAddInterest(state,'stories',.08*weeks);legacyAddAbility(state,'expression',.06*weeks);}
        if(school?.id==='community_school'){legacyAddInterest(state,'people',.14*weeks);legacyAddAbility(state,'initiative',.1*weeks);legacyAddSocial(state,'empathy',.08*weeks);}
        if(home.focus)legacyAddAbility(state,'focus',.03*weeks);if(home.confidence)legacyAddSocial(state,'confidence',.03*weeks);if(home.independence)legacyAddSocial(state,'independence',.03*weeks);
        if(p.development.curiosity>=6){legacyAddInterest(state,'making',.06*weeks);legacyAddInterest(state,'systems',.06*weeks);}
        if(p.development.independence>=6)legacyAddSocial(state,'independence',.08*weeks);
      }
      s.schoolDays+=days;s.lastProcessedAt+=days*24;changed=true;
      const years=Math.floor(Math.max(0,now-(s.enrolledAt||now))/(360*24));
      if(years>s.schoolYears){s.schoolYears=years;if(years>=1&&s.lastYearMilestone<1)s.yearMilestonePending=true;}
    }
  }
  return changed;
}

function schoolingRhythmLabel(state){const s=ensureSchoolingState(state);return s.attendanceRhythm>=72?'Sudah menemukan ritme':s.attendanceRhythm>=55?'Cukup terjaga':s.attendanceRhythm>=38?'Masih menyesuaikan':'Hari sekolah terasa berat';}
function schoolingAdaptationLabel(state){const s=ensureSchoolingState(state);return s.adaptation>=72?'Nyaman dengan dunianya sendiri':s.adaptation>=52?'Mulai punya pijakan':s.adaptation>=35?'Masih banyak mengamati':'Butuh lebih banyak dukungan';}
function schoolingSnapshot(state){
  const s=ensureSchoolingState(state);if(!schoolingEligible(state)&&s.stage==='not_started')return null;
  const school=schoolingOption(state),support=schoolingSupport(state),legacy=typeof legacySnapshot==='function'?legacySnapshot(state):null;
  return {state:s,school,support,active:schoolingActive(state),monthlyCost:schoolingMonthlyCost(state),commuteHours:schoolingCommuteHours(state),rhythmLabel:schoolingRhythmLabel(state),adaptationLabel:schoolingAdaptationLabel(state),supportCooldownLeft:schoolingSupportCooldownLeft(state),supportOptions:Object.values(SCHOOL_SUPPORT_MODES).map(x=>({...x,monthlyCost:schoolingSupportMonthlyCost(state,x.id)})),legacy};
}

function getNextSchoolingEvent(state){
  const s=ensureSchoolingState(state);if(state.pendingEvent)return null;
  const eligible=(s.stage==='eligible'&&s.choiceReady)||(s.stage==='enrolled'&&((s.supportReady&&!s.supportMode)||s.parentApproachReady||s.yearMilestonePending));
  if(!eligible)return null;
  return typeof nextDataEvent==='function'?nextDataEvent(state,{tagsAll:['schooling']}):null;
}
