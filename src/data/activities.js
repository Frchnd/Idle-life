function xpMod(state){
  const id=getCondition(state.player.fatigue).id;
  if(id==='exhausted') return .7;
  if(id==='tired') return .9;
  return 1;
}

function isLivingAlone(state){ return state.housing?.id==='rented_room'; }
function careerFocus(state){ return state.life?.trajectory==='career'; }
function independentFocus(state){ return state.life?.trajectory==='independent'; }

function availableActivities(state){
  const list=[];
  if(!state.player.job){
    if(state.business?.active) list.push({id:'business_manage',name:state.business.ownerFullTime?'Jalankan Usaha':'Urus Usaha',hint:state.business.helperActive?'4j · klien, kualitas & koordinasi Ari':'4j · jaga kapasitas & pelanggan',duration:4});
    list.push({id:'job_search',name:state.business?.ownerFullTime?'Lihat Lowongan Kerja':'Cari Kerja',hint:'6j · cari peluang kerja',duration:6});
    list.push({id:'study',name:'Belajar',hint:isLivingAlone(state)?'4j · Rp20rb · lebih fokus':'4j · Rp20rb',duration:4});
    list.push({id:'family',name:'Bantu Keluarga',hint:'4j · jaga hubungan',duration:4});
    list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
    return list;
  }
  const job=JOBS[state.player.job];
  const salary=state.player.salary||job.salary;
  list.push({id:'work',name:'Kerja',hint:`${job.duration}j · +Rp${Math.round(salary/1000)}rb`,duration:job.duration});
  list.push({id:'study',name:'Belajar',hint:isLivingAlone(state)?'4j · Rp20rb · lebih fokus':'4j · Rp20rb',duration:4});
  list.push({id:'rest',name:'Istirahat',hint:isLivingAlone(state)?'8j · pulih lebih tenang':'8j · pulihkan kondisi',duration:8});
  list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
  if(state.career.workCount>=4) list.push({id:'career_search',name:'Cari Peluang Lain',hint:'4j · lihat arah karier lain',duration:4});
  if(state.business?.active) list.push({id:'business_manage',name:'Urus Usaha',hint:state.business.helperActive?'4j · klien, kualitas & koordinasi Ari':'4j · jaga kapasitas & pelanggan',duration:4});
  return list;
}

function executeActivity(state,id){
  if(id==='job_search'){
    state.time.totalHours+=6;
    state.player.fatigue=Math.min(100,state.player.fatigue+8);
    state.career.jobSearchCount++;
    return 'Kamu menghabiskan waktu mencari lowongan dan bertanya ke beberapa tempat.';
  }
  if(id==='study'){
    if(state.player.money<20000) return {error:'Uangmu belum cukup untuk biaya belajar.'};
    state.player.money-=20000;
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+(isLivingAlone(state)?7:10));
    state.skills.learning+=isLivingAlone(state)?13:10;
    state.skills.technology+=Math.round((isLivingAlone(state)?13:10)*xpMod(state));
    if(!state.discoveredSkills.includes('technology')) state.discoveredSkills.push('technology');
    return isLivingAlone(state)
      ? 'Ruang sendiri membuat sesi belajarmu lebih fokus. Belajar dan Teknologi meningkat.'
      : 'Kamu belajar beberapa jam. Kemampuan Belajar dan Teknologi meningkat.';
  }
  if(id==='family'){
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+7);
    state.relationships.family+=4;
    state.skills.social+=3;
    return 'Kamu membantu keluarga dan menghabiskan waktu bersama mereka.';
  }
  if(id==='rian'){
    state.time.totalHours+=3;
    state.player.fatigue=Math.min(100,state.player.fatigue+5);
    state.relationships.rian=Math.min(80,state.relationships.rian+3);
    state.skills.social+=6;
    return 'Kamu menghabiskan waktu bersama Rian. Hubungan kalian tetap hangat.';
  }
  if(id==='career_search'){
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+5);
    state.career.changeSearchCount++;
    return 'Kamu meluangkan waktu melihat lowongan, bertanya ke kenalan, dan membandingkan arah hidup lain.';
  }
  if(id==='business_manage'){
    return manageBusiness(state);
  }
  if(id==='rest'){
    state.time.totalHours+=8;
    state.player.fatigue=Math.max(0,state.player.fatigue-(isLivingAlone(state)?52:45));
    return isLivingAlone(state)?'Kamu beristirahat di ruang sendiri dan pulih lebih baik.':'Kamu beristirahat dan memulihkan kondisi.';
  }
  if(id==='work'){
    const job=JOBS[state.player.job];
    if(!job) return {error:'Pekerjaan aktif tidak ditemukan.'};
    const company=currentWorkplaceSnapshot(state);
    const pressureFatigue=company?(company.pressure>=74?4:company.pressure>=62?2:company.pressure<38?-1:0):0;
    const growthBonus=company&&company.health>=68?1:0;
    const salary=state.player.salary||job.salary;
    state.time.totalHours+=job.duration;
    state.player.money+=salary;
    const flexibleRelief=state.player.statuses.includes('jam_lebih_fleksibel')?-2:0;
    const dualRoleCost=state.player.statuses.includes('peran_ganda')?2:0;
    state.player.fatigue=Math.min(100,state.player.fatigue+job.fatigue+(independentFocus(state)?2:0)+pressureFatigue+flexibleRelief+dualRoleCost);
    state.skills[job.skill]=(state.skills[job.skill]||0)+Math.round(job.skillXp*xpMod(state));
    if(!state.discoveredSkills.includes(job.skill)) state.discoveredSkills.push(job.skill);
    state.career.workCount++;
    state.career.jobWorkCounts[state.player.job]=(state.career.jobWorkCounts[state.player.job]||0)+1;
    const focusBonus=careerFocus(state)?1:0;
    if(state.player.job==='mechanic_junior') state.career.promotionProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='store_clerk') state.career.storeProgress+=1+focusBonus+growthBonus;
    if(state.player.job==='it_assistant') state.career.techProgress+=1+focusBonus+growthBonus;
    const skillName={mechanics:'Mekanik',social:'Sosial',technology:'Teknologi'}[job.skill]||'kemampuan utama';
    const parts=[];
    if(careerFocus(state)) parts.push('Fokus karier membuat progres pekerjaanmu lebih cepat.');
    if(independentFocus(state)) parts.push('Menjaga jalur mandiri membuat harimu sedikit lebih berat.');
    if(company?.health>=68) parts.push(`${company.name} sedang tumbuh, jadi tanggung jawab dan peluang belajar datang lebih cepat.`);
    else if(company?.pressure>=74) parts.push(`${company.name} sedang sangat tertekan; shift ini terasa lebih berat dari biasanya.`);
    else if(company?.health<42) parts.push(`${company.name} sedang rentan, jadi prospek karier terasa lebih lambat.`);
    return `Kerja selesai · +Rp${salary.toLocaleString('id-ID')} · kemampuan ${skillName} meningkat.${parts.length?' '+parts.join(' '):''}`;
  }
  return {error:'Aktivitas tidak dikenal.'};
}
