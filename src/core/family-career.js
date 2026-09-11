function ensureFamilyCareerState(state){
  const f=ensureFamilyState(state);
  const base={
    careMode:'shared',careSetAt:-9999,lastCareChangeAt:-9999,careDiscussionSeen:false,careSetupPaid:{shared:true,network:false,daycare:false},
    lastTensionAt:-9999,nextTensionTurn:'partner',playerBusyUntil:-9999,partnerBusyUntil:-9999,partnerReducedUntil:-9999,
    playerCareerBoost:0,playerCareerWins:0,partnerCareerWins:0,playerConcessions:0,partnerConcessions:0,paidBackupUses:0,
    lastCareerChoiceAt:-9999,totalCareSpent:0
  };
  if(!f.careerCare||typeof f.careerCare!=='object') f.careerCare={};
  const c=f.careerCare;
  for(const [key,value] of Object.entries(base)) if(c[key]===undefined) c[key]=(value&&typeof value==='object'&&!Array.isArray(value))?{...value}:value;
  c.careSetupPaid={...base.careSetupPaid,...(c.careSetupPaid||{})};
  if(!FAMILY_CARE_OPTIONS[c.careMode]) c.careMode='shared';
  if(!['player','partner'].includes(c.nextTensionTurn)) c.nextTensionTurn='partner';
  ['playerCareerBoost','playerCareerWins','partnerCareerWins','playerConcessions','partnerConcessions','paidBackupUses','totalCareSpent'].forEach(k=>c[k]=Math.max(0,Number(c[k])||0));
  return c;
}

function familyCareOption(state,id){return FAMILY_CARE_OPTIONS[id]||FAMILY_CARE_OPTIONS.shared;}
function familyCareCurrent(state){return familyCareOption(state,ensureFamilyCareerState(state).careMode);}
function familyCareAgeMonths(state){return typeof childAge==='function'?(childAge(state).months||0):0;}
function familyCareAvailable(state,id){
  const opt=FAMILY_CARE_OPTIONS[id],child=typeof activeChild==='function'?activeChild(state):null;if(!opt||!child)return false;
  if(familyCareAgeMonths(state)<opt.minMonths) return false;
  if(id==='network') return !!state.flags?.familySupport||(state.relationships?.family||0)>=65||ensureFamilyState(state).parentingStyle==='network';
  return true;
}
function familyCareIndexed(state,amount){const index=state.world?.costIndex||100;return Math.round((amount*index/100)/10000)*10000;}
function familyCareMonthlyCost(state){const child=typeof activeChild==='function'?activeChild(state):null;if(!child)return 0;return familyCareIndexed(state,familyCareCurrent(state).baseMonthlyCost||0);}
function familyCareSetupCost(state,id){const c=ensureFamilyCareerState(state),opt=familyCareOption(state,id);return c.careSetupPaid[id]?0:familyCareIndexed(state,opt.setupCost||0);}
function familyCareCooldownLeft(state){const c=ensureFamilyCareerState(state);return Math.max(0,45*24-((state.time?.totalHours||0)-(c.lastCareChangeAt||-9999)));}

function changeFamilyCareMode(state,id,{force=false}={}){
  const c=ensureFamilyCareerState(state),opt=FAMILY_CARE_OPTIONS[id];
  if(!opt) return {error:'Pilihan penjagaan itu tidak dikenal.'};
  if(!familyCareAvailable(state,id)) return {error:id==='daycare'?'Penitipan harian baru cocok setelah Nara sedikit lebih besar.':'Jaringan keluarga belum cukup kuat untuk dijadikan ritme rutin.'};
  if(c.careMode===id){if(force){c.careDiscussionSeen=true;c.careSetAt=state.time.totalHours;return `${opt.name} tetap menjadi pola penjagaan kalian.`;}return {error:'Itu sudah menjadi pola penjagaan kalian.'};}
  const left=familyCareCooldownLeft(state);if(!force&&left>0)return {error:`Pola penjagaan baru bisa diubah lagi sekitar ${Math.ceil(left/24)} hari lagi.`};
  const cost=familyCareSetupCost(state,id);if(state.player.money<cost)return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk menyiapkan pola ini.`};
  state.player.money-=cost;state.time.totalHours+=2;c.totalCareSpent+=cost;c.careMode=id;c.careSetAt=state.time.totalHours;c.lastCareChangeAt=state.time.totalHours;c.careSetupPaid[id]=true;c.careDiscussionSeen=true;
  const p=ensureParentingState(state);p.careRhythm=clampParenting(p.careRhythm+(id==='shared'?0:id==='network'?5:4));
  if(typeof syncLivingCost==='function') syncLivingCost(state);
  if(typeof addRecent==='function') addRecent(state,`Pola penjagaan berubah menjadi “${opt.name}”.`);
  return `${opt.name} mulai dipakai · ${cost?'-Rp'+cost.toLocaleString('id-ID')+' · ':''}2 jam untuk menata ulang rutinitas.`;
}

function familyCareerPartnerProfile(state){const id=ensurePartnershipState(state).partner;return FAMILY_PARTNER_CAREER[id]||null;}
function familyCareerPlayerBusy(state){return (state.time?.totalHours||0)<(ensureFamilyCareerState(state).playerBusyUntil||-9999);}
function familyCareerPartnerBusy(state){return (state.time?.totalHours||0)<(ensureFamilyCareerState(state).partnerBusyUntil||-9999);}
function familyCareerPartnerReduced(state){return (state.time?.totalHours||0)<(ensureFamilyCareerState(state).partnerReducedUntil||-9999);}
function familyCareerPressureModifier(state){
  if(!activeChild(state))return 0;const c=ensureFamilyCareerState(state),care=familyCareCurrent(state);let value=care.pressure||0;
  if(familyCareerPlayerBusy(state))value+=3;if(familyCareerPartnerBusy(state))value+=2;if(familyCareerPlayerBusy(state)&&familyCareerPartnerBusy(state))value+=2;
  if(familyCareerPartnerReduced(state))value-=1;return value;
}
function familyCareerWorkFatigueModifier(state){if(!activeChild(state))return 0;return familyCareCurrent(state).workFatigue||0;}
function familyCareerCareDailyModifier(state){if(!activeChild(state))return 0;return familyCareCurrent(state).careDaily||0;}

function familyCareerApplyPlayerPush(state,{backup=false}={}){
  const c=ensureFamilyCareerState(state),job=state.player.job,def=JOBS[job];if(!job||!def)return false;
  c.playerCareerWins+=1;c.playerCareerBoost=Math.max(c.playerCareerBoost,3);c.playerBusyUntil=state.time.totalHours+21*24;c.lastCareerChoiceAt=state.time.totalHours;
  const skill=def.skill;if(skill) state.skills[skill]=(state.skills[skill]||0)+18;
  if(job==='mechanic_junior')state.career.promotionProgress+=3;
  else if(job==='store_clerk')state.career.storeProgress+=3;
  else if(job==='it_assistant')state.career.techProgress+=3;
  else if(job==='cafe_crew')state.career.jobWorkCounts.cafe_crew=(state.career.jobWorkCounts.cafe_crew||0)+2;
  else if(job==='warehouse_staff')state.career.jobWorkCounts.warehouse_staff=(state.career.jobWorkCounts.warehouse_staff||0)+2;
  const p=ensureParentingState(state);p.careRhythm=clampParenting(p.careRhythm-(backup?2:9));
  if(!backup)ensurePartnershipState(state).strain=Math.min(3,(ensurePartnershipState(state).strain||0)+1);
  return true;
}
function familyCareerPlayerConcedes(state){const c=ensureFamilyCareerState(state);c.playerConcessions+=1;c.lastCareerChoiceAt=state.time.totalHours;const p=ensureParentingState(state);p.careRhythm=clampParenting(p.careRhythm+11);ensurePartnershipState(state).trust+=2;return true;}
function familyCareerPartnerPush(state,{backup=false}={}){
  const c=ensureFamilyCareerState(state),p=ensurePartnershipState(state);c.partnerCareerWins+=1;c.partnerBusyUntil=state.time.totalHours+30*24;c.lastCareerChoiceAt=state.time.totalHours;p.trust+=backup?2:3;
  const ps=ensureParentingState(state);ps.careRhythm=clampParenting(ps.careRhythm+(backup?5:9));if(!backup)state.player.fatigue=Math.min(100,state.player.fatigue+4);
  return true;
}
function familyCareerPartnerConcedes(state){const c=ensureFamilyCareerState(state),p=ensurePartnershipState(state);c.partnerConcessions+=1;c.partnerReducedUntil=state.time.totalHours+45*24;c.lastCareerChoiceAt=state.time.totalHours;if(c.partnerConcessions>=2){p.strain=Math.min(3,(p.strain||0)+1);ensureSharedLifeState(state).conflict=Math.min(3,(ensureSharedLifeState(state).conflict||0)+1);}return true;}
function familyCareerPaidBackup(state,who){
  const c=ensureFamilyCareerState(state),cost=familyCareIndexed(state,300000);if(state.player.money<cost)return false;state.player.money-=cost;c.totalCareSpent+=cost;c.paidBackupUses+=1;
  if(who==='player') familyCareerApplyPlayerPush(state,{backup:true}); else familyCareerPartnerPush(state,{backup:true});
  const p=ensureParentingState(state);p.careRhythm=clampParenting(p.careRhythm+5);if(typeof ensureHealthState==='function')ensureHealthState(state).stress=Math.max(0,ensureHealthState(state).stress-3);return true;
}
function familyCareerConsumeWorkBoost(state){const c=ensureFamilyCareerState(state);if(c.playerCareerBoost<=0)return null;c.playerCareerBoost-=1;return {xp:6,progress:1,note:'Momentum karier dari kesempatan keluarga/kerja masih terasa.'};}

function processFamilyCareer(state,{migration=false}={}){
  const c=ensureFamilyCareerState(state),now=state.time?.totalHours||0;
  if(migration){c.lastTensionAt=now;c.lastCareerChoiceAt=now;c.careDiscussionSeen=!!activeChild(state);c.careSetAt=now;return c;}
  if(c.playerBusyUntil<=now)c.playerBusyUntil=-9999;if(c.partnerBusyUntil<=now)c.partnerBusyUntil=-9999;if(c.partnerReducedUntil<=now)c.partnerReducedUntil=-9999;return c;
}

function familyCareerSnapshot(state){
  if(!activeChild(state))return null;const c=ensureFamilyCareerState(state),care=familyCareCurrent(state),profile=familyCareerPartnerProfile(state),monthly=familyCareMonthlyCost(state),p=ensurePartnershipState(state);
  const partnerWork=familyCareerPartnerBusy(state)?'Sedang padat':familyCareerPartnerReduced(state)?'Mengurangi ritme':'Stabil';
  const playerWork=familyCareerPlayerBusy(state)?'Sedang padat':'Stabil';
  const options=Object.values(FAMILY_CARE_OPTIONS).map(o=>({...o,available:familyCareAvailable(state,o.id),setupCost:familyCareSetupCost(state,o.id),monthlyCost:familyCareIndexed(state,o.baseMonthlyCost)}));
  return {care,monthly,options,cooldownLeft:familyCareCooldownLeft(state),playerWork,partnerWork,partnerName:profile?.name||PARTNERSHIP_CANDIDATES[p.partner]?.name||'Pasangan',partnerRole:profile?(familyCareerPartnerBusy(state)?profile.busy:familyCareerPartnerReduced(state)?profile.reduced:profile.steady):'Rutinitas stabil',playerCareerBoost:c.playerCareerBoost,playerCareerWins:c.playerCareerWins,partnerCareerWins:c.partnerCareerWins,playerConcessions:c.playerConcessions,partnerConcessions:c.partnerConcessions};
}

function getNextFamilyCareerEvent(state){
  const child=activeChild(state),c=ensureFamilyCareerState(state),p=ensurePartnershipState(state),sl=ensureSharedLifeState(state),profile=familyCareerPartnerProfile(state),now=state.time.totalHours;
  if(!child||!p.partner||sl.stage!=='married'||state.pendingEvent)return null;
  const age=childAge(state,child).months;
  if(age>=6&&!c.careDiscussionSeen){
    c.careDiscussionSeen=true;c.lastTensionAt=now;
    const choices=[{label:'Tetap bergantian berdua',hint:'Tanpa biaya tambahan · jadwal lebih rapuh',effects:[{type:'family_care_mode',value:'shared',force:true}],result:'Kalian tetap membagi jam penjagaan sendiri. Murah, tapi setiap peluang kerja baru harus dinegosiasikan lagi.'}];
    if(familyCareAvailable(state,'network')&&state.player.money>=familyCareSetupCost(state,'network'))choices.push({label:'Libatkan jaringan keluarga',hint:`Sekitar Rp${Math.round(familyCareIndexed(state,160000)/1000)}rb/bulan`,effects:[{type:'family_care_mode',value:'network',force:true}],result:'Kalian menerima bantuan rutin dari keluarga dan ikut menanggung biaya kecil agar dukungan itu tetap sehat.'});
    if(state.player.money>=familyCareSetupCost(state,'daycare'))choices.push({label:'Pakai penitipan harian lokal',hint:`Rp${Math.round(familyCareIndexed(state,300000)/1000)}rb awal · sekitar Rp${Math.round(familyCareIndexed(state,650000)/1000)}rb/bulan`,effects:[{type:'family_care_mode',value:'daycare',force:true}],result:'Kalian membeli kepastian jadwal kerja dengan biaya bulanan yang jauh lebih besar.'});
    return {id:'family_care_arrangement',type:'KELUARGA',title:'Siapa yang Menjaga Hari Kerja?',art:housingMeta(state).image,artAlt:'Rumah keluarga',text:`${child.name} mulai punya ritme siang yang lebih jelas. Sekarang masalahnya bukan sekadar siapa yang sayang, tapi siapa yang tersedia ketika dua jadwal kerja berjalan bersamaan.`,choices};
  }
  if(age<6||!c.careDiscussionSeen||now-(c.lastTensionAt||-9999)<90*24)return null;
  c.lastTensionAt=now;
  const backupCost=familyCareIndexed(state,300000),backupChoice=state.player.money>=backupCost?{label:'Bayar dukungan tambahan minggu ini',hint:`-Rp${backupCost.toLocaleString('id-ID')} · dua karier tetap jalan`,effects:[{type:'family_career_backup',who:c.nextTensionTurn}],result:'Kalian membeli ruang bernapas untuk satu minggu. Mahal, tapi tidak ada satu orang yang harus langsung mengalah.'}:null;
  if(c.nextTensionTurn==='partner'&&profile){
    c.nextTensionTurn='player';
    const choices=[
      {label:'Gue pegang rumah minggu ini',hint:'8j · dukung karier pasangan',effects:[{type:'hours',value:8},{type:'family_partner_career_push'},{type:'health_stress',value:2}],result:`Kamu mengambil lebih banyak jam rumah agar ${profile.name} bisa mengejar kesempatan itu. Minggunya berat, tapi keputusan ini benar-benar membuka ruang untuk kariernya.`},
      {label:'Minta dia lewatkan dulu',hint:'Rumah lebih stabil · pasangan yang mengalah',effects:[{type:'family_partner_concede'}],result:`${profile.name} melewatkan kesempatan itu agar rumah tidak makin padat. Tidak ada ledakan besar, tapi kalau pola ini terus berulang, rasa tidak seimbang bisa tumbuh.`}
    ];if(backupChoice)choices.push(backupChoice);
    return {id:'family_partner_career_tension',type:'KELUARGA & KARIER',title:profile.opportunityTitle,art:PARTNERSHIP_CANDIDATES[p.partner].image,artAlt:profile.name,text:profile.opportunityText,choices};
  }
  c.nextTensionTurn='partner';
  if(!state.player.job&&!state.business?.active)return null;
  const workName=state.player.job?(JOBS[state.player.job]?.name||'pekerjaanmu'):(state.business?.name||'usahamu');
  const choices=[
    {label:'Ambil kesempatan karier',hint:'Momentum 3 shift · rumah lebih padat sementara',effects:[{type:'family_player_career_push'}],result:`Kamu mengambil kesempatan tambahan di ${workName}. Beberapa shift ke depan akan punya momentum karier lebih kuat, tapi rumah kehilangan sedikit ruang bernapas.`},
    {label:'Lewatkan untuk jaga ritme rumah',hint:'Tidak ada bonus karier · keluarga lebih stabil',effects:[{type:'family_player_concede'}],result:'Kamu memilih satu minggu yang lebih biasa. Tidak dramatis, tapi keputusan itu membuat rumah punya ruang saat memang sedang membutuhkannya.'}
  ];if(backupChoice)choices.push({...backupChoice,effects:[{type:'family_career_backup',who:'player'}]});
  return {id:'family_player_career_tension',type:'KELUARGA & KARIER',title:'Kesempatan Karier Datang di Minggu yang Salah',art:state.player.job?(typeof workplaceArt==='function'?workplaceArt(JOBS[state.player.job]?.workplaceId):housingMeta(state).image):'./assets/scenes/business.webp',artAlt:'Kesempatan karier',text:`Ada kesempatan tambahan di ${workName}: cukup besar untuk mempercepat langkah, tapi waktunya persis ketika jadwal rumah sedang rapat. Tidak ada cara membuat dua prioritas mengambil jam yang sama.`,choices};
}
