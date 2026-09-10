function xpMod(state){
  const id=getCondition(state.player.fatigue).id;
  if(id==='exhausted') return .7;
  if(id==='tired') return .9;
  return 1;
}

function isLivingAlone(state){ return state.housing?.id!=='family_home'; }
function careerFocus(state){ return state.life?.trajectory==='career'; }
function independentFocus(state){ return state.life?.trajectory==='independent'; }
function activityEnabledByPack(state,id){ return !getContent('activities',id) || contentEnabled(state,'activities',id); }
function visibleActivities(state,list){ return list.filter(item=>activityEnabledByPack(state,item.id)); }

function availableActivities(state){
  const list=[];
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
  const commute=housingCommuteHours(state,job.workplaceId);
  list.push({id:'work',name:'Kerja',hint:`${job.duration+commute}j${commute?` · ${commute}j perjalanan`:''} · +Rp${Math.round(salary/1000)}rb`,duration:job.duration+commute});
  list.push({id:'study',name:'Belajar',hint:`4j · Rp20rb${housingStudyProfile(state).learning>10?' · tempat mendukung':''}`,duration:4});
  list.push({id:'rest',name:'Istirahat',hint:`8j · pulih ${housingRestRecovery(state)>=52?'lebih baik':'normal'}`,duration:8});
  list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
  if(state.career.workCount>=4) list.push({id:'career_search',name:'Cari Peluang Lain',hint:'4j · lihat arah karier lain',duration:4});
  if(state.business?.active) list.push({id:'business_manage',name:'Urus Usaha',hint:state.business.helperActive?'4j · klien, kualitas & koordinasi Ari':'4j · jaga kapasitas & pelanggan',duration:4});
  return visibleActivities(state,list);
}

function executeActivity(state,id){
  const dataResult=runDataActivity(state,id);
  if(dataResult!==null) return dataResult;
  if(id==='study'){
    if(state.player.money<20000) return {error:'Uangmu belum cukup untuk biaya belajar.'};
    const home=housingStudyProfile(state);
    state.player.money-=20000;
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+home.fatigue);
    state.skills.learning+=home.learning;
    state.skills.technology+=Math.round(home.technology*xpMod(state));
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
    const recovery=housingRestRecovery(state);
    state.player.fatigue=Math.max(0,state.player.fatigue-recovery);
    return `${housingLabel(state)} memberi waktu istirahat yang ${recovery>=52?'lebih tenang':'cukup'}. Kondisimu pulih.`;
  }
  if(id==='work'){
    const job=JOBS[state.player.job];
    if(!job) return {error:'Pekerjaan aktif tidak ditemukan.'};
    const company=currentWorkplaceSnapshot(state);
    const pressureFatigue=company?(company.pressure>=74?4:company.pressure>=62?2:company.pressure<38?-1:0):0;
    const growthBonus=company&&company.health>=68?1:0;
    const salary=state.player.salary||job.salary;
    const commute=housingCommuteHours(state,job.workplaceId);
    state.time.totalHours+=job.duration+commute;
    state.player.money+=salary;
    const flexibleRelief=state.player.statuses.includes('jam_lebih_fleksibel')?-2:0;
    const dualRoleCost=state.player.statuses.includes('peran_ganda')?2:0;
    state.player.fatigue=Math.min(100,state.player.fatigue+job.fatigue+(independentFocus(state)?2:0)+pressureFatigue+flexibleRelief+dualRoleCost+commute);
    state.skills[job.skill]=(state.skills[job.skill]||0)+Math.round(job.skillXp*xpMod(state));
    if(!state.discoveredSkills.includes(job.skill)) state.discoveredSkills.push(job.skill);
    state.career.workCount++;
    state.career.jobWorkCounts[state.player.job]=(state.career.jobWorkCounts[state.player.job]||0)+1;
    const focusBonus=careerFocus(state)?1:0;
    if(state.player.job==='mechanic_junior') state.career.promotionProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='store_clerk') state.career.storeProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='it_assistant') state.career.techProgress+=1+focusBonus+growthBonus;
    const skillName={mechanics:'Mekanik',social:'Sosial',technology:'Teknologi',hospitality:'Hospitality',logistics:'Logistik'}[job.skill]||'kemampuan utama';
    const parts=[];
    if(careerFocus(state)) parts.push('Fokus karier membuat progres pekerjaanmu lebih cepat.');
    if(independentFocus(state)) parts.push('Menjaga jalur mandiri membuat harimu sedikit lebih berat.');
    if(commute>0) parts.push(`Perjalanan dari ${housingMeta(state).neighborhood} menambah ${commute} jam pada harimu.`);
    if(company?.health>=68) parts.push(`${company.name} sedang tumbuh, jadi tanggung jawab dan peluang belajar datang lebih cepat.`);
    else if(company?.pressure>=74) parts.push(`${company.name} sedang sangat tertekan; shift ini terasa lebih berat dari biasanya.`);
    else if(company?.health<42) parts.push(`${company.name} sedang rentan, jadi prospek karier terasa lebih lambat.`);
    return `Kerja selesai · +Rp${salary.toLocaleString('id-ID')} · kemampuan ${skillName} meningkat.${parts.length?' '+parts.join(' '):''}`;
  }
  return {error:'Aktivitas tidak dikenal.'};
}
