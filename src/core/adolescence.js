function adolescenceClamp(v,min=0,max=100){return Math.max(min,Math.min(max,Number(v)||0));}
function adolescenceStageForMonths(months){return ADOLESCENCE_STAGES.find(x=>months>=x.minMonths&&months<=x.maxMonths)||null;}

function ensureAdolescenceState(state){
  const f=ensureFamilyState(state),now=state.time?.totalHours||0;
  const base={stage:'not_started',stageEventPending:null,lastStageEvent:null,lastProcessedAt:now,autonomy:24,parentBond:62,tension:0,peerCircle:null,peerFormedAt:null,peerEventReady:false,peerEventCount:0,nextPeerEventAt:null,activityId:null,activitySupport:null,activityReady:false,activityReadyAt:null,independentCommute:false,commuteMode:'family',commuteReady:false,commuteReadyAt:null,secondaryPreference:null,secondaryPath:null,secondaryReady:false,secondaryReadyAt:null,decisionCount:0,lastDecisionAt:-9999,migrationGraceUntil:null};
  if(!f.adolescence||typeof f.adolescence!=='object')f.adolescence={};
  const a=f.adolescence;for(const [k,v] of Object.entries(base))if(a[k]===undefined)a[k]=v;
  if(!['not_started','preteen','teen','late_teen','young_adult'].includes(a.stage))a.stage='not_started';
  a.autonomy=adolescenceClamp(a.autonomy);a.parentBond=adolescenceClamp(a.parentBond);a.tension=adolescenceClamp(a.tension);
  if(a.peerCircle&&!ADOLESCENCE_PEER_CIRCLES[a.peerCircle])a.peerCircle=null;
  if(a.secondaryPath&&!SECONDARY_EDUCATION_OPTIONS[a.secondaryPath])a.secondaryPath=null;
  if(!Number.isFinite(a.lastProcessedAt))a.lastProcessedAt=now;
  return a;
}

function adolescenceActive(state){const child=activeChild(state);return !!child&&childAge(state,child).months>=120;}
function currentAdolescenceStage(state){const child=activeChild(state);return child?adolescenceStageForMonths(childAge(state,child).months):null;}
function adolescencePeerCircle(state){const a=ensureAdolescenceState(state);return a.peerCircle?ADOLESCENCE_PEER_CIRCLES[a.peerCircle]||null:null;}
function adolescenceSecondaryOption(state){const a=ensureAdolescenceState(state);return a.secondaryPath?SECONDARY_EDUCATION_OPTIONS[a.secondaryPath]||null:null;}
function adolescencePreferredInterest(state){return typeof childInterestSnapshot==='function'?(childInterestSnapshot(state)?.id||'people'):'people';}
function adolescencePreferredActivity(state){return ADOLESCENCE_ACTIVITIES[adolescencePreferredInterest(state)]||ADOLESCENCE_ACTIVITIES.people;}
function adolescencePreferredSecondary(state){
  const interest=adolescencePreferredInterest(state);
  if(interest==='making')return 'vocational_project';
  if(interest==='systems')return 'city_academic';
  if(interest==='stories')return 'community_secondary';
  return 'community_secondary';
}
function adolescencePickPeerCircle(state){
  const interest=adolescencePreferredInterest(state),map={making:'makers',stories:'creative',systems:'academic',people:'social'};
  return map[interest]||'mixed';
}
function adolescenceIndexedCost(state,amount){const idx=Math.max(80,Number(state.world?.costIndex)||100);return Math.round((Number(amount||0)*idx/100)/10000)*10000;}
function adolescenceMonthlyCost(state){
  const a=ensureAdolescenceState(state);if(!adolescenceActive(state))return 0;
  let total=0;
  if(a.activitySupport==='support'){const activity=Object.values(ADOLESCENCE_ACTIVITIES).find(x=>x.id===a.activityId);total+=activity?.monthlyCost||0;}
  if(a.activitySupport==='trial'){const activity=Object.values(ADOLESCENCE_ACTIVITIES).find(x=>x.id===a.activityId);total+=Math.round((activity?.monthlyCost||0)*.55);}
  if(a.independentCommute)total+=a.commuteMode==='full'?180000:90000;
  const circle=adolescencePeerCircle(state);if(circle&&['teen','late_teen','young_adult'].includes(a.stage))total+=circle.monthlyCost||0;
  return adolescenceIndexedCost(state,total);
}
function adolescenceFamilyPressureModifier(state){
  if(!adolescenceActive(state))return 0;const a=ensureAdolescenceState(state);let v=0;
  if(a.tension>=60)v+=4;else if(a.tension>=35)v+=2;
  if(a.parentBond<35)v+=3;else if(a.parentBond<50)v+=1;
  if(a.independentCommute)v-=1;
  const privacy=typeof housingMeta==='function'?housingMeta(state)?.privacy:null;if(privacy==='Terbatas'&&a.stage!=='preteen')v+=2;
  return v;
}
function adolescenceWorkFatigueModifier(state){const a=ensureAdolescenceState(state);if(!adolescenceActive(state))return 0;return a.independentCommute?-1:(a.stage==='preteen'?1:0);}

function adolescenceApplyInfluence(state,map={},scale=1){
  for(const [key,raw] of Object.entries(map||{})){const value=Number(raw||0)*scale;
    if(['making','stories','people','systems'].includes(key))legacyAddInterest(state,key,value);
    else if(['focus','expression','problemSolving','initiative'].includes(key))legacyAddAbility(state,key,value);
    else if(['confidence','empathy','independence'].includes(key))legacyAddSocial(state,key,value);
    else if(['stability','pressure','autonomy','presence'].includes(key))legacyAddPattern(state,key,value);
  }
}
function adolescenceRecordDecision(state,label,meta={}){const a=ensureAdolescenceState(state);a.decisionCount++;a.lastDecisionAt=state.time.totalHours;legacyRecordMilestone(state,`teen_decision_${a.decisionCount}`,label,meta);}

function adolescenceRespond(state,response){
  const a=ensureAdolescenceState(state);if(!a.stageEventPending)return false;
  if(response==='listen'){a.parentBond+=10;a.autonomy+=5;a.tension-=4;legacyAddPattern(state,'presence',1);legacyAddPattern(state,'autonomy',1);legacyAddSocial(state,'confidence',1);}
  else if(response==='boundaries'){a.parentBond+=4;a.autonomy+=8;a.tension+=1;legacyAddPattern(state,'stability',1);legacyAddPattern(state,'autonomy',2);}
  else {a.parentBond-=8;a.autonomy-=2;a.tension+=12;legacyAddPattern(state,'pressure',2);}
  a.parentBond=adolescenceClamp(a.parentBond);a.autonomy=adolescenceClamp(a.autonomy);a.tension=adolescenceClamp(a.tension);a.lastStageEvent=a.stageEventPending;a.stageEventPending=null;
  const profile=legacyChildProfile(state);if(profile)legacyAddUnique(profile.formativeTags,response==='listen'?'remaja_didengar':response==='boundaries'?'batas_jelas':'remaja_diawasi_ketat');
  adolescenceRecordDecision(state,'Cara keluarga merespons ruang baru Nara',{response});return true;
}

function adolescenceActivityResponse(state,response){
  const a=ensureAdolescenceState(state);if(!a.activityReady)return false;const activity=adolescencePreferredActivity(state);a.activityId=activity.id;a.activitySupport=response;a.activityReady=false;
  if(response==='support'){a.parentBond+=8;a.autonomy+=7;a.tension-=3;adolescenceApplyInfluence(state,activity.influence,1);legacyAddPattern(state,'autonomy',2);}
  else if(response==='trial'){a.parentBond+=4;a.autonomy+=4;adolescenceApplyInfluence(state,activity.influence,.55);legacyAddPattern(state,'autonomy',1);}
  else {a.parentBond-=6;a.tension+=9;legacyAddPattern(state,'pressure',1);}
  a.parentBond=adolescenceClamp(a.parentBond);a.autonomy=adolescenceClamp(a.autonomy);a.tension=adolescenceClamp(a.tension);adolescenceRecordDecision(state,`${activeChild(state)?.name||'Nara'} memilih ${activity.name}`,{activityId:activity.id,response});
  if(typeof syncLivingCost==='function')syncLivingCost(state);return true;
}

function adolescenceCommuteResponse(state,response){
  const a=ensureAdolescenceState(state);if(!a.commuteReady)return false;a.commuteReady=false;
  if(response==='allow'){a.independentCommute=true;a.commuteMode='full';a.autonomy+=10;a.parentBond+=4;a.tension-=2;legacyAddSocial(state,'independence',2);}
  else if(response==='limited'){a.independentCommute=true;a.commuteMode='limited';a.autonomy+=6;a.parentBond+=2;legacyAddSocial(state,'independence',1);}
  else {a.independentCommute=false;a.commuteMode='family';a.autonomy-=2;a.parentBond-=5;a.tension+=8;legacyAddPattern(state,'pressure',1);}
  a.autonomy=adolescenceClamp(a.autonomy);a.parentBond=adolescenceClamp(a.parentBond);a.tension=adolescenceClamp(a.tension);adolescenceRecordDecision(state,'Ritme perjalanan Nara mulai berubah',{response});if(typeof syncLivingCost==='function')syncLivingCost(state);return true;
}

function adolescencePracticalSecondary(state){
  const h=state.housing?.id||'family_home',entries=Object.values(SECONDARY_EDUCATION_OPTIONS);let best=entries[0],score=Infinity;
  for(const opt of entries){const commute=Number(opt.commute?.[h]||0),cost=adolescenceIndexedCost(state,opt.baseMonthlyCost);const s=commute*300000+cost;if(s<score){score=s;best=opt;}}
  return best.id;
}
function adolescenceSecondaryResponse(state,response){
  const a=ensureAdolescenceState(state);if(!a.secondaryReady)return false;const preferred=a.secondaryPreference||adolescencePreferredSecondary(state);let chosen=preferred;
  if(response==='negotiate')chosen=adolescencePracticalSecondary(state);if(response==='control')chosen='local_secondary';
  const option=SECONDARY_EDUCATION_OPTIONS[chosen];a.secondaryPath=chosen;a.secondaryReady=false;
  if(response==='support'){a.parentBond+=8;a.autonomy+=10;a.tension-=3;legacyAddPattern(state,'autonomy',2);}else if(response==='negotiate'){a.parentBond+=3;a.autonomy+=4;legacyAddPattern(state,'stability',1);}else{a.parentBond-=10;a.autonomy-=2;a.tension+=14;legacyAddPattern(state,'pressure',2);}
  a.parentBond=adolescenceClamp(a.parentBond);a.autonomy=adolescenceClamp(a.autonomy);a.tension=adolescenceClamp(a.tension);adolescenceApplyInfluence(state,option.influence||{},1);
  legacyRecordEducation(state,{id:'secondary_start',schoolId:chosen,schoolName:option.name,startedAt:state.time.totalHours,status:'active',preferredId:preferred,parentResponse:response});
  const profile=legacyChildProfile(state);if(profile){legacyAddUnique(profile.trajectoryTags,response==='support'?'voice_in_education':response==='negotiate'?'family_compromise':'family_directed_education');}
  adolescenceRecordDecision(state,`Sekolah lanjutan: ${option.name}`,{chosen,preferred,response});if(typeof addRecent==='function')addRecent(state,`${activeChild(state)?.name||'Nara'} akan melanjutkan ke ${option.name}.`);if(typeof syncLivingCost==='function')syncLivingCost(state);return true;
}

function adolescencePeerResponse(state,response){
  const a=ensureAdolescenceState(state);if(!a.peerEventReady)return false;a.peerEventReady=false;a.peerEventCount++;
  if(response==='listen'){a.parentBond+=7;a.autonomy+=4;a.tension-=5;legacyAddSocial(state,'confidence',1);legacyAddPattern(state,'presence',1);}
  else if(response==='coach'){a.parentBond+=4;a.autonomy+=3;a.tension-=2;legacyAddAbility(state,'problemSolving',1);legacyAddSocial(state,'empathy',1);}
  else {a.parentBond-=8;a.autonomy-=3;a.tension+=12;legacyAddPattern(state,'pressure',1);}
  a.parentBond=adolescenceClamp(a.parentBond);a.autonomy=adolescenceClamp(a.autonomy);a.tension=adolescenceClamp(a.tension);a.nextPeerEventAt=state.time.totalHours+(140+Math.min(80,a.peerEventCount*15))*24;adolescenceRecordDecision(state,'Konflik pertemanan pertama yang benar-benar milik Nara',{response});return true;
}

function processAdolescence(state,{migration=false}={}){
  const a=ensureAdolescenceState(state),child=activeChild(state),now=state.time?.totalHours||0;if(!child){a.lastProcessedAt=now;return false;}
  const stage=currentAdolescenceStage(state);if(!stage){a.lastProcessedAt=now;return false;}let changed=false;
  if(migration){a.stage=stage.id;a.stageEventPending=null;a.lastProcessedAt=now;a.migrationGraceUntil=now+5*24;if(!a.peerCircle)a.peerCircle=adolescencePickPeerCircle(state);if(!a.secondaryPreference)a.secondaryPreference=adolescencePreferredSecondary(state);if(['teen','late_teen','young_adult'].includes(stage.id)&&!a.activityId){const activity=adolescencePreferredActivity(state);a.activityId=activity.id;a.activitySupport='trial';a.autonomy=Math.max(a.autonomy,46);}if(['late_teen','young_adult'].includes(stage.id)){a.independentCommute=true;a.commuteMode='limited';a.autonomy=Math.max(a.autonomy,58);}return false;}
  if(a.stage!==stage.id){a.stage=stage.id;a.stageEventPending=stage.id==='young_adult'?null:stage.id;a.lastProcessedAt=now;changed=true;if(stage.id==='young_adult'){legacyRecordMilestone(state,'young_adult_threshold','Memasuki ambang hidup mandiri',{stage:stage.id});const profile=legacyChildProfile(state);if(profile)profile.foundationReady=true;}if(typeof addRecent==='function')addRecent(state,`${child.name} memasuki fase baru: ${stage.label}.`);}
  if(!a.peerCircle){a.peerCircle=adolescencePickPeerCircle(state);a.peerFormedAt=now;const circle=adolescencePeerCircle(state);adolescenceApplyInfluence(state,circle?.influence||{},.5);changed=true;}
  if(a.stage==='preteen'){
    if(a.activityReadyAt===null)a.activityReadyAt=now+45*24;if(!a.activityId&&!a.activityReady&&now>=a.activityReadyAt){a.activityReady=true;changed=true;}
    if(a.commuteReadyAt===null)a.commuteReadyAt=now+90*24;if(!a.independentCommute&&!a.commuteReady&&now>=a.commuteReadyAt){a.commuteReady=true;changed=true;}
  }
  const months=childAge(state,child).months;if(months>=144&&!a.secondaryPath&&!a.secondaryReady){if(a.secondaryReadyAt===null)a.secondaryReadyAt=now+3*24;if(now>=a.secondaryReadyAt){a.secondaryPreference=adolescencePreferredSecondary(state);a.secondaryReady=true;changed=true;}}
  if(['teen','late_teen'].includes(a.stage)&&!a.peerEventReady){if(a.nextPeerEventAt===null)a.nextPeerEventAt=now+120*24;if(now>=a.nextPeerEventAt){a.peerEventReady=true;changed=true;}}
  const days=Math.min(360,Math.floor((now-a.lastProcessedAt)/24));if(days>0){const circle=adolescencePeerCircle(state),weeks=Math.max(1,Math.floor(days/7));adolescenceApplyInfluence(state,circle?.influence||{},.025*weeks);const secondary=adolescenceSecondaryOption(state);if(secondary)adolescenceApplyInfluence(state,secondary.influence||{},.018*weeks);
    const privacy=typeof housingMeta==='function'?housingMeta(state)?.privacy:null;if(a.stage!=='preteen'&&privacy==='Terbatas'){a.tension=adolescenceClamp(a.tension+.025*days);a.parentBond=adolescenceClamp(a.parentBond-.012*days);}else if(privacy==='Tinggi'){a.tension=adolescenceClamp(a.tension-.015*days);}
    if(a.independentCommute)a.autonomy=adolescenceClamp(a.autonomy+.015*days);a.lastProcessedAt+=days*24;changed=true;}
  const profile=legacyChildProfile(state);if(profile&&a.stage==='young_adult'&&profile.milestones.length>=5)profile.foundationReady=true;
  return changed;
}

function adolescenceAutonomyLabel(state){const a=ensureAdolescenceState(state);return a.autonomy>=75?'Punya arah yang makin jelas':a.autonomy>=55?'Cukup mandiri sehari-hari':a.autonomy>=36?'Mulai minta ruang sendiri':'Masih banyak bergantung pada rumah';}
function adolescenceBondLabel(state){const a=ensureAdolescenceState(state);return a.parentBond>=72?'Terbuka dan dekat':a.parentBond>=52?'Masih cukup terbuka':a.parentBond>=34?'Mulai menjaga jarak':'Banyak hal dipendam';}
function adolescenceTensionLabel(state){const a=ensureAdolescenceState(state);return a.tension>=65?'Banyak gesekan':a.tension>=38?'Sering perlu negosiasi':'Cukup lentur';}
function adolescenceSnapshot(state){
  if(!adolescenceActive(state))return null;const a=ensureAdolescenceState(state),stage=currentAdolescenceStage(state),circle=adolescencePeerCircle(state),activity=Object.values(ADOLESCENCE_ACTIVITIES).find(x=>x.id===a.activityId)||null,secondary=adolescenceSecondaryOption(state);
  return {state:a,stage,circle,activity,secondary,preferredActivity:adolescencePreferredActivity(state),preferredSecondary:SECONDARY_EDUCATION_OPTIONS[a.secondaryPreference||adolescencePreferredSecondary(state)]||null,monthlyCost:adolescenceMonthlyCost(state),autonomyLabel:adolescenceAutonomyLabel(state),bondLabel:adolescenceBondLabel(state),tensionLabel:adolescenceTensionLabel(state)};
}
function getNextAdolescenceEvent(state){
  const a=ensureAdolescenceState(state);if(state.pendingEvent||!adolescenceActive(state))return null;const ready=!!a.stageEventPending||a.activityReady||a.commuteReady||a.secondaryReady||a.peerEventReady;if(!ready)return null;
  const event=typeof nextDataEvent==='function'?nextDataEvent(state,{tagsAll:['adolescence']}):null;if(!event)return null;
  if(event.id==='adolescence_world_expands'){const circle=adolescencePeerCircle(state);if(circle)event.text=`Nara mulai lebih sering pulang membawa cerita dari ${circle.name.toLowerCase()}. ${circle.summary} Dunia ini bukan sesuatu yang Raka pilihkan—ia tumbuh dari pengalaman Nara sendiri.`;}
  if(event.id==='adolescence_activity_choice'){const activity=adolescencePreferredActivity(state);event.text=`Nara datang dengan satu permintaan yang cukup spesifik: ia ingin mencoba ${activity.name}. ${activity.summary}`;if(event.choices?.[0])event.choices[0].label=`Dukung ${activity.name}`;}
  if(event.id==='adolescence_secondary_path'){const pref=SECONDARY_EDUCATION_OPTIONS[a.secondaryPreference||adolescencePreferredSecondary(state)];if(pref){event.text=`Nara bilang ia paling tertarik pada ${pref.name}. ${pref.summary} Ini pertama kalinya pilihan pendidikan besar datang dengan preferensi yang benar-benar berasal dari dirinya sendiri.`;if(event.choices?.[0])event.choices[0].label=`Dukung ${pref.name}`;}}
  if(event.id==='adolescence_peer_tension'){const circle=adolescencePeerCircle(state);if(circle)event.text=`Ada konflik di ${circle.name.toLowerCase()}. Nara pulang lebih diam, tapi tidak langsung meminta solusi. Cara kalian masuk ke masalah ini menentukan apakah rumah terasa seperti tempat aman atau ruang pemeriksaan.`;}
  return event;
}
