function legacyClamp(value,min=-20,max=40){return Math.max(min,Math.min(max,Number(value)||0));}

function legacyChildBase(state,child){
  const joined=Number(child?.joinedAt)||0;
  const seed=Math.abs(Math.floor((joined+137)*2654435761))%2147483647;
  return {
    id:child?.id||'nara',name:child?.name||'Nara',generation:2,seed,playable:false,
    interests:{making:0,stories:0,people:0,systems:0},
    abilities:{focus:0,expression:0,problemSolving:0,initiative:0},
    social:{confidence:0,empathy:0,independence:0},
    familyPatterns:{stability:0,pressure:0,autonomy:0,presence:0},
    formativeTags:[],trajectoryTags:[],educationHistory:[],milestones:[],delayed:[],
    lastConsequenceAt:-9999,lastConsequenceNote:null,foundationReady:false,seededFromChildhood:false
  };
}

function ensureLegacyState(state){
  const f=ensureFamilyState(state),child=activeChild(state);
  const base={schema:1,children:{},familyMilestones:[],successorId:child?.id||'nara',lastProcessedAt:state.time?.totalHours||0};
  if(!f.legacy||typeof f.legacy!=='object') f.legacy={};
  const legacy=f.legacy;
  for(const [k,v] of Object.entries(base)) if(legacy[k]===undefined) legacy[k]=Array.isArray(v)?[...v]:(v&&typeof v==='object'?{...v}:v);
  if(!legacy.children||typeof legacy.children!=='object') legacy.children={};
  if(!Array.isArray(legacy.familyMilestones)) legacy.familyMilestones=[];
  if(child){
    const childBase=legacyChildBase(state,child),existing=legacy.children[child.id]||{};
    legacy.children[child.id]={...childBase,...existing};
    const p=legacy.children[child.id];
    p.interests={...childBase.interests,...(existing.interests||{})};
    p.abilities={...childBase.abilities,...(existing.abilities||{})};
    p.social={...childBase.social,...(existing.social||{})};
    p.familyPatterns={...childBase.familyPatterns,...(existing.familyPatterns||{})};
    for(const key of ['formativeTags','trajectoryTags','educationHistory','milestones','delayed']) if(!Array.isArray(p[key])) p[key]=[];
    legacy.successorId=child.id;
  }
  if(!Number.isFinite(legacy.lastProcessedAt)) legacy.lastProcessedAt=state.time?.totalHours||0;
  return legacy;
}

function legacyChildProfile(state){
  const child=activeChild(state);if(!child)return null;
  return ensureLegacyState(state).children[child.id]||null;
}

function legacyAddUnique(list,value){if(value&&!list.includes(value))list.push(value);}
function legacyAddInterest(state,key,value){const p=legacyChildProfile(state);if(!p||p.interests[key]===undefined)return;p.interests[key]=legacyClamp(p.interests[key]+Number(value||0));}
function legacyAddAbility(state,key,value){const p=legacyChildProfile(state);if(!p||p.abilities[key]===undefined)return;p.abilities[key]=legacyClamp(p.abilities[key]+Number(value||0));}
function legacyAddSocial(state,key,value){const p=legacyChildProfile(state);if(!p||p.social[key]===undefined)return;p.social[key]=legacyClamp(p.social[key]+Number(value||0));}
function legacyAddPattern(state,key,value){const p=legacyChildProfile(state);if(!p||p.familyPatterns[key]===undefined)return;p.familyPatterns[key]=legacyClamp(p.familyPatterns[key]+Number(value||0));}

function legacyRecordMilestone(state,id,label,meta={}){
  const legacy=ensureLegacyState(state),profile=legacyChildProfile(state);if(!profile)return false;
  if(profile.milestones.some(x=>x.id===id))return false;
  const item={id,label,at:state.time.totalHours,...meta};profile.milestones.push(item);
  if(!legacy.familyMilestones.some(x=>x.id===id))legacy.familyMilestones.push({...item,childId:profile.id});
  return true;
}

function legacyRecordEducation(state,entry){
  const profile=legacyChildProfile(state);if(!profile||!entry?.id)return false;
  const existing=profile.educationHistory.find(x=>x.id===entry.id);
  if(existing)Object.assign(existing,entry);else profile.educationHistory.push({...entry});
  return true;
}

function seedLegacyFromChildhood(state){
  const profile=legacyChildProfile(state);if(!profile||profile.seededFromChildhood)return false;
  const parenting=typeof ensureParentingState==='function'?ensureParentingState(state):null;
  const dev=parenting?.development||{};
  const curiosity=Number(dev.curiosity||0),warmth=Number(dev.warmth||0),independence=Number(dev.independence||0);
  legacyAddInterest(state,'making',curiosity*.22);legacyAddInterest(state,'systems',curiosity*.22);legacyAddAbility(state,'problemSolving',curiosity*.12);
  legacyAddSocial(state,'empathy',warmth*.3);legacyAddSocial(state,'confidence',warmth*.08);
  legacyAddSocial(state,'independence',independence*.32);legacyAddAbility(state,'initiative',independence*.14);
  legacyAddPattern(state,'presence',Math.min(7,Number(parenting?.familyTimeCount||0)*.22));
  legacyAddPattern(state,'stability',Math.max(0,(Number(parenting?.careRhythm||50)-45)/10));
  const career=state.family?.careerCare||{},imbalance=Math.abs(Number(career.playerConcessions||0)-Number(career.partnerConcessions||0));
  legacyAddPattern(state,'pressure',(Number(state.partnership?.strain||0)+Number(state.sharedLife?.conflict||0))*1.2+imbalance*.4);
  if(curiosity>=6)legacyAddUnique(profile.formativeTags,'masa_kecil_penuh_pertanyaan');
  if(warmth>=6)legacyAddUnique(profile.formativeTags,'rumah_hangat');
  if(independence>=6)legacyAddUnique(profile.formativeTags,'sejak_kecil_suka_mencoba_sendiri');
  profile.seededFromChildhood=true;return true;
}

function scheduleLegacyConsequence(state,id,delayDays,payload={}){
  const profile=legacyChildProfile(state);if(!profile)return false;
  if(profile.delayed.some(x=>x.id===id&&!x.resolved))return false;
  profile.delayed.push({id,createdAt:state.time.totalHours,resolveAt:state.time.totalHours+Math.max(1,Number(delayDays)||1)*24,payload:{...payload},resolved:false});
  return true;
}

function applyLegacyInfluenceMap(state,map={}){
  for(const [key,value] of Object.entries(map)){
    if(['making','stories','people','systems'].includes(key))legacyAddInterest(state,key,value);
    else if(['focus','expression','problemSolving','initiative'].includes(key))legacyAddAbility(state,key,value);
    else if(['confidence','empathy','independence'].includes(key))legacyAddSocial(state,key,value);
    else if(['stability','pressure','autonomy','presence'].includes(key))legacyAddPattern(state,key,value);
    else if(key==='curiosity'&&typeof ensureParentingState==='function'){const p=ensureParentingState(state);p.development.curiosity=(p.development.curiosity||0)+Number(value||0);updateDominantChildTrait(state);}
  }
}

function resolveLegacyConsequence(state,item){
  const profile=legacyChildProfile(state);if(!profile||item.resolved)return null;
  let note='';
  if(item.id.startsWith('school_fit_')){
    const snap=typeof schoolingSnapshot==='function'?schoolingSnapshot(state):null;
    if(snap&&snap.commuteHours>=2){
      legacyAddSocial(state,'independence',2);legacyAddPattern(state,'stability',-1);legacyAddAbility(state,'focus',-1);
      legacyAddUnique(profile.formativeTags,'terbiasa_perjalanan_panjang');legacyAddUnique(profile.trajectoryTags,'resilient_commuter');
      note='Perjalanan sekolah yang panjang membuat Nara cepat belajar mandiri, tapi beberapa hari terasa lebih melelahkan.';
    }else{
      legacyAddPattern(state,'stability',2);legacyAddSocial(state,'confidence',1);legacyAddAbility(state,'focus',1);
      legacyAddUnique(profile.formativeTags,'ritme_sekolah_stabil');
      note='Ritme sekolah mulai terasa alami. Nara punya cukup energi untuk memperhatikan hal di luar sekadar perjalanan.';
    }
  }else if(item.id.startsWith('support_pattern_')){
    const mode=item.payload?.mode;
    const support=SCHOOL_SUPPORT_MODES?.[mode];
    if(support)applyLegacyInfluenceMap(state,support.influence||{});
    if(mode==='home_routine')legacyAddUnique(profile.formativeTags,'rumah_banyak_hadir');
    if(mode==='balanced_support')legacyAddUnique(profile.formativeTags,'dukungan_seimbang');
    if(mode==='after_school')legacyAddUnique(profile.formativeTags,'terbiasa_ruang_aktivitas');
    note=mode==='home_routine'?'Kehadiran rutin di rumah mulai terasa sebagai bagian penting dari cara Nara belajar.':mode==='after_school'?'Program sepulang sekolah membuat Nara lebih percaya diri bergerak di lingkungan di luar rumah.':'Dukungan yang terbagi cukup seimbang membuat sekolah tidak mengambil alih seluruh ritme keluarga.';
  }else if(item.id.startsWith('parent_approach_')){
    const approach=item.payload?.approach;
    if(approach==='explore'){
      legacyAddPattern(state,'autonomy',3);legacyAddSocial(state,'independence',2);legacyAddInterest(state,'making',1);legacyAddInterest(state,'stories',1);
      legacyAddUnique(profile.formativeTags,'diberi_ruang_mencoba');legacyAddUnique(profile.trajectoryTags,'self_directed');
      note='Ruang untuk mencoba membuat Nara mulai lebih yakin memilih hal yang memang ingin ia pahami.';
    }else if(approach==='structure'){
      legacyAddPattern(state,'stability',3);legacyAddAbility(state,'focus',2);legacyAddPattern(state,'presence',1);
      legacyAddUnique(profile.formativeTags,'rutinitas_konsisten');legacyAddUnique(profile.trajectoryTags,'steady_learner');
      note='Rutinitas yang konsisten mulai berubah dari aturan orang tua menjadi kebiasaan yang Nara pahami sendiri.';
    }else if(approach==='achievement'){
      legacyAddAbility(state,'focus',3);legacyAddPattern(state,'pressure',3);legacyAddSocial(state,'confidence',1);
      legacyAddUnique(profile.formativeTags,'ekspektasi_tinggi');legacyAddUnique(profile.trajectoryTags,'achievement_driven');
      if(typeof ensureParentingState==='function')ensureParentingState(state).careRhythm=clampParenting(ensureParentingState(state).careRhythm-5);
      note='Ekspektasi tinggi membuat Nara lebih serius mengejar hasil, tetapi suasana belajar juga terasa lebih berat.';
    }
  }
  item.resolved=true;item.resolvedAt=state.time.totalHours;profile.lastConsequenceAt=state.time.totalHours;profile.lastConsequenceNote=note||null;
  if(note&&typeof addRecent==='function')addRecent(state,note);
  return note;
}

function processLegacy(state,{migration=false}={}){
  const legacy=ensureLegacyState(state),profile=legacyChildProfile(state),now=state.time?.totalHours||0;
  if(migration){legacy.lastProcessedAt=now;if(profile){seedLegacyFromChildhood(state);profile.delayed=(profile.delayed||[]).filter(x=>x&&x.createdAt!==undefined);profile.lastConsequenceAt=now;}return false;}
  if(!profile){legacy.lastProcessedAt=now;return false;}
  let changed=seedLegacyFromChildhood(state);
  for(const item of profile.delayed){if(!item.resolved&&Number(item.resolveAt)<=now){resolveLegacyConsequence(state,item);changed=true;}}
  profile.foundationReady=profile.educationHistory.length>0&&profile.formativeTags.length>=2;
  legacy.lastProcessedAt=now;return changed;
}

function strongestLegacyEntry(obj){
  const entries=Object.entries(obj||{}).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0));
  return entries.length&&Number(entries[0][1]||0)>=2?entries[0][0]:null;
}
function childInterestSnapshot(state){const p=legacyChildProfile(state),id=p?strongestLegacyEntry(p.interests):null;return id&&CHILD_INTEREST_LABELS[id]?{id,...CHILD_INTEREST_LABELS[id]}:null;}
function childAbilitySnapshot(state){const p=legacyChildProfile(state),id=p?strongestLegacyEntry(p.abilities):null;return id&&CHILD_ABILITY_LABELS[id]?{id,...CHILD_ABILITY_LABELS[id]}:null;}
function childLearningPatternSnapshot(state){
  const p=legacyChildProfile(state);if(!p)return null;
  let id='reflective';
  if((p.familyPatterns.autonomy||0)+(p.social.independence||0)>=6)id='self_directed';
  else if((p.interests.people||0)+(p.social.confidence||0)>=5)id='social';
  else if((p.interests.making||0)+(p.abilities.problemSolving||0)>=4)id='hands_on';
  return {id,...CHILD_LEARNING_LABELS[id]};
}
function childSocialTendencyLabel(state){
  const p=legacyChildProfile(state);if(!p)return 'Masih mengamati lingkungan baru';
  const social=(p.social.confidence||0)+(p.social.empathy||0),ind=p.social.independence||0;
  if(social>=8)return 'Mudah membuka diri dan membaca kelompok';
  if(ind>=7)return 'Mandiri, tidak selalu butuh keramaian';
  if(social>=4)return 'Mulai nyaman punya lingkaran sendiri';
  return 'Masih memilih siapa yang terasa aman';
}
function childIndependenceLabel(state){
  const p=legacyChildProfile(state),base=typeof ensureParentingState==='function'?(ensureParentingState(state).development.independence||0):0;
  const value=(p?.social.independence||0)+base;
  return value>=10?'Sering ingin mengurus caranya sendiri':value>=6?'Mulai minta ruang memilih':value>=3?'Berani mencoba tanpa banyak dibantu':'Masih banyak mencari pegangan dari rumah';
}

function legacySnapshot(state){
  const profile=legacyChildProfile(state);if(!profile)return null;
  return {profile,interest:childInterestSnapshot(state),ability:childAbilitySnapshot(state),learning:childLearningPatternSnapshot(state),socialLabel:childSocialTendencyLabel(state),independenceLabel:childIndependenceLabel(state),foundationReady:!!profile.foundationReady,lastConsequenceNote:profile.lastConsequenceNote};
}
