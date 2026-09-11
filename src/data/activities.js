function xpMod(state){
  const id=getCondition(state.player.fatigue).id;
  const fatigueMult=id==='exhausted'?.7:id==='tired'?.9:1;
  const healthMult=typeof healthXpMultiplier==='function'?healthXpMultiplier(state):1;
  return fatigueMult*healthMult;
}

function isLivingAlone(state){ return state.housing?.id!=='family_home'; }
function careerFocus(state){ return state.life?.trajectory==='career'; }
function independentFocus(state){ return state.life?.trajectory==='independent'; }
function activityEnabledByPack(state,id){ return !getContent('activities',id) || contentEnabled(state,'activities',id); }
function visibleActivities(state,list){ return list.filter(item=>activityEnabledByPack(state,item.id)); }

function availableActivities(state){
  const list=[];
  const health=typeof healthSnapshot==='function'?healthSnapshot(state):null;
  if(health?.canRecover) list.push({id:'health_recover',name:health.illness.id==='well'?'Jaga Ritme':'Pulihkan Diri',hint:health.illness.id==='well'?'4j · turunkan tekanan':'10j · fokus pulih',duration:health.illness.id==='well'?4:10});
  if(!state.player.job){
    if(state.business?.active) list.push({id:'business_manage',name:state.business.ownerFullTime?'Jalankan Usaha':'Urus Usaha',hint:state.business.helperActive?'4j · klien, kualitas & koordinasi Ari':'4j · jaga kapasitas & pelanggan',duration:4});
    list.push({id:'job_search',name:state.business?.ownerFullTime?'Lihat Lowongan Kerja':'Cari Kerja',hint:'6j · cari peluang kerja',duration:6});
    list.push({id:'study',name:'Belajar',hint:`4j · Rp20rb${housingStudyProfile(state).learning>10?' · tempat mendukung':''}`,duration:4});
    list.push({id:'family',name:'Bantu Keluarga',hint:'4j · jaga hubungan',duration:4});
    list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
    return visibleActivities(state,list);
  }
  const job=JOBS[state.player.job];
  const salary=state.player.salary||job.salary;
  const commute=typeof effectiveWorkCommuteHours==='function'?effectiveWorkCommuteHours(state,job.workplaceId):housingCommuteHours(state,job.workplaceId);
  list.push({id:'work',name:'Kerja',hint:`${job.duration+commute}j${commute?` · ${commute}j perjalanan`:''} · +Rp${Math.round(salary/1000)}rb`,duration:job.duration+commute});
  list.push({id:'study',name:'Belajar',hint:`4j · Rp20rb${housingStudyProfile(state).learning>10?' · tempat mendukung':''}`,duration:4});
  list.push({id:'rest',name:'Istirahat',hint:`8j · pulih ${(housingRestRecovery(state)+(typeof lifestyleRestBonus==='function'?lifestyleRestBonus(state):0))>=52?'lebih baik':'normal'}`,duration:8});
  list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
  if(state.career.workCount>=4) list.push({id:'career_search',name:'Cari Peluang Lain',hint:'4j · lihat arah karier lain',duration:4});
  if(state.business?.active) list.push({id:'business_manage',name:'Urus Usaha',hint:state.business.helperActive?'4j · klien, kualitas & koordinasi Ari':'4j · jaga kapasitas & pelanggan',duration:4});
  return visibleActivities(state,list);
}

function executeActivity(state,id){
  const dataResult=runDataActivity(state,id);
  if(dataResult!==null) return dataResult;
  if(id==='health_recover'){
    return recoverHealthActivity(state);
  }
  if(id==='study'){
    if(state.player.money<20000) return {error:'Uangmu belum cukup untuk biaya belajar.'};
    const home=housingStudyProfile(state);
    const assetStudy=typeof personalAssetStudyBonus==='function'?personalAssetStudyBonus(state):{learning:0,fatigue:0};
    state.player.money-=20000;
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+Math.max(3,home.fatigue+(typeof lifestyleStudyFatigueModifier==='function'?lifestyleStudyFatigueModifier(state):0)+(assetStudy.fatigue||0)+(typeof healthActionFatigueModifier==='function'?healthActionFatigueModifier(state,'study'):0)));
    const phaseStudy=typeof lifeStudyMultiplier==='function'?lifeStudyMultiplier(state):1;
    state.skills.learning+=Math.round((home.learning+(assetStudy.learning||0))*phaseStudy);
    state.skills.technology+=Math.round(home.technology*xpMod(state)*phaseStudy);
    if(typeof wearPersonalAsset==='function') wearPersonalAsset(state,'study_desk',1);
    if(typeof wearPersonalAsset==='function' && state.assets?.laptop) wearPersonalAsset(state,'laptop',0.5);
    if(home.social) state.skills.social=(state.skills.social||0)+home.social;
    if(!state.discoveredSkills.includes('technology')) state.discoveredSkills.push('technology');
    return home.learning>=12
      ? `${housingLabel(state)} memberi ritme belajar yang lebih fokus. Belajar dan Teknologi meningkat.`
      : home.social?`${housingLabel(state)} membuat belajar terasa lebih sosial. Belajar, Teknologi, dan sedikit Sosial meningkat.`:'Kamu belajar beberapa jam. Kemampuan Belajar dan Teknologi meningkat.';
  }
  if(id==='business_manage'){
    return manageBusiness(state);
  }
  if(id==='rest'){
    state.time.totalHours+=8;
    const recovery=Math.max(20,housingRestRecovery(state)+(typeof lifestyleRestBonus==='function'?lifestyleRestBonus(state):0)+(typeof personalAssetRestBonus==='function'?personalAssetRestBonus(state):0)+(typeof lifeRestBonus==='function'?lifeRestBonus(state):0));
    state.player.fatigue=Math.max(0,state.player.fatigue-recovery);
    if(typeof wearPersonalAsset==='function') wearPersonalAsset(state,'comfort_bed',0.5);
    return `${housingLabel(state)} memberi waktu istirahat yang ${recovery>=52?'lebih tenang':'cukup'}. Kondisimu pulih.`;
  }
  if(id==='work'){
    const job=JOBS[state.player.job];
    if(!job) return {error:'Pekerjaan aktif tidak ditemukan.'};
    const company=currentWorkplaceSnapshot(state);
    const pressureFatigue=company?(company.pressure>=74?4:company.pressure>=62?2:company.pressure<38?-1:0):0;
    const growthBonus=company&&company.health>=68?1:0;
    const salary=state.player.salary||job.salary;
    const commute=typeof effectiveWorkCommuteHours==='function'?effectiveWorkCommuteHours(state,job.workplaceId):housingCommuteHours(state,job.workplaceId);
    const mechanicAsset=job.skill==='mechanics'&&typeof personalAssetMechanicBonus==='function'?personalAssetMechanicBonus(state):{fatigue:0,xp:0};
    const rawCommute=typeof housingCommuteHours==='function'?housingCommuteHours(state,job.workplaceId):commute;
    state.time.totalHours+=job.duration+commute;
    state.player.money+=salary;
    const flexibleRelief=state.player.statuses.includes('jam_lebih_fleksibel')?-2:0;
    const dualRoleCost=state.player.statuses.includes('peran_ganda')?2:0;
    const transportWearPenalty=typeof personalAssetTravelFatiguePenalty==='function'&&typeof currentTransport==='function'?personalAssetTravelFatiguePenalty(state,currentTransport(state).id):0;
    state.player.fatigue=Math.min(100,state.player.fatigue+job.fatigue+(independentFocus(state)?2:0)+pressureFatigue+flexibleRelief+dualRoleCost+commute+(typeof lifestyleWorkFatigueModifier==='function'?lifestyleWorkFatigueModifier(state):0)+(typeof currentTransport==='function'&&personalFinanceUnlocked(state)?currentTransport(state).travelFatigue:0)+transportWearPenalty+(mechanicAsset.fatigue||0)+(typeof healthActionFatigueModifier==='function'?healthActionFatigueModifier(state,'work'):0)+(typeof lifeWorkFatigueModifier==='function'?lifeWorkFatigueModifier(state):0));
    state.skills[job.skill]=(state.skills[job.skill]||0)+Math.round(job.skillXp*xpMod(state))+(mechanicAsset.xp||0);
    if(job.skill==='mechanics'&&typeof wearPersonalAsset==='function') wearPersonalAsset(state,'mechanic_toolkit',1);
    if(rawCommute>0&&typeof wearActiveTransport==='function') wearActiveTransport(state,2);
    if(!state.discoveredSkills.includes(job.skill)) state.discoveredSkills.push(job.skill);
    state.career.workCount++;
    state.career.jobWorkCounts[state.player.job]=(state.career.jobWorkCounts[state.player.job]||0)+1;
    const focusBonus=(careerFocus(state)?1:0)+(typeof lifeCareerProgressBonus==='function'?lifeCareerProgressBonus(state):0);
    if(state.player.job==='mechanic_junior') state.career.promotionProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='store_clerk') state.career.storeProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='it_assistant') state.career.techProgress+=1+focusBonus+growthBonus;
    const skillName={mechanics:'Mekanik',social:'Sosial',technology:'Teknologi',hospitality:'Hospitality',logistics:'Logistik'}[job.skill]||'kemampuan utama';
    const parts=[];
    if(careerFocus(state)) parts.push('Fokus karier membuat progres pekerjaanmu lebih cepat.');
    if(independentFocus(state)) parts.push('Menjaga jalur mandiri membuat harimu sedikit lebih berat.');
    if(commute>0) parts.push(`Perjalanan dari ${housingMeta(state).neighborhood} menambah ${commute} jam pada harimu.`);
    else if(typeof personalFinanceUnlocked==='function'&&personalFinanceUnlocked(state)&&housingCommuteHours(state,job.workplaceId)>0) parts.push(`${currentTransport(state).name} memangkas waktu perjalanan kerja.`);
    if(company?.health>=68) parts.push(`${company.name} sedang tumbuh, jadi tanggung jawab dan peluang belajar datang lebih cepat.`);
    else if(company?.pressure>=74) parts.push(`${company.name} sedang sangat tertekan; shift ini terasa lebih berat dari biasanya.`);
    else if(company?.health<42) parts.push(`${company.name} sedang rentan, jadi prospek karier terasa lebih lambat.`);
    return `Kerja selesai · +Rp${salary.toLocaleString('id-ID')} · kemampuan ${skillName} meningkat.${parts.length?' '+parts.join(' '):''}`;
  }
  return {error:'Aktivitas tidak dikenal.'};
}
