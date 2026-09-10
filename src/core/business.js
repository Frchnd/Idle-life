const BUSINESS_META={
  mechanics:{name:'Servis Mandiri',label:'Jasa mekanik panggilan',baseTicket:150000,fixedCost:115000,skill:'mechanics'},
  retail:{name:'Jasa Promosi Lokal',label:'Jasa event & pelayanan',baseTicket:125000,fixedCost:95000,skill:'social'},
  technology:{name:'Bantuan Digital',label:'Jasa teknologi kecil',baseTicket:145000,fixedCost:105000,skill:'technology'}
};

function ensureBusinessState(state){
  const defaults={
    active:false,sector:null,name:null,level:0,reputation:0,clients:0,lastManagedAt:0,lastWeeklyProfit:0,totalProfit:0,lossStreak:0,startedAt:null,
    equipmentLevel:0,retainedClients:0,capacity:2,inquiries:0,servedClients:0,missedDemand:0,growthStreak:0,reinvestments:0,lastReinvestOfferAt:-999,lastConflictAt:-999,lastRetainerAt:-999,scale:'solo',helperActive:false,helperName:'Ari',helperTrust:40,helperSkill:35,helperWage:220000,helperWeeks:0,delegated:false,ownerFullTime:false,lastScaleDecisionAt:-999,lastDelegationDecisionAt:-999,lastOwnerChoiceAt:-999,lastHelperIssueAt:-999,helperIssuePending:false
  };
  state.business=state.business||{};
  for(const [key,value] of Object.entries(defaults)){
    if(state.business[key]===undefined) state.business[key]=value;
  }
  refreshBusinessCapacity(state);
  return state.business;
}

function businessMeta(state){
  const b=ensureBusinessState(state);
  return b.sector?BUSINESS_META[b.sector]:null;
}

function strongestBusinessSector(state){
  const ranked=[
    ['mechanics',state.skills.mechanics||0],
    ['technology',state.skills.technology||0],
    ['retail',state.skills.social||0]
  ].sort((a,b)=>b[1]-a[1]);
  return ranked[0][1]>=100?ranked[0][0]:null;
}

function businessDemand(state,sector){
  const key=sector==='retail'?'retail':sector;
  return state.world?.sectors?.[key]??50;
}

function refreshBusinessCapacity(state){
  const b=state.business||{};
  if(!b.active){ b.capacity=2; return 2; }
  const managedRecently=(state.time?.totalHours||0)-(b.lastManagedAt||0)<=7*24;
  const helperBonus=b.helperActive?2:0;
  const delegationBonus=b.helperActive&&b.delegated&&b.helperTrust>=50?1:0;
  const ownerBonus=b.ownerFullTime?2:0;
  b.capacity=Math.min(12,2+(b.equipmentLevel||0)+(managedRecently?1:0)+Math.floor((b.level||1)/3)+helperBonus+delegationBonus+ownerBonus);
  return b.capacity;
}

function businessScaleLabel(state){
  const b=ensureBusinessState(state);
  if(!b.active) return 'Belum berjalan';
  if(b.ownerFullTime) return 'Fokus penuh';
  if(b.helperActive) return 'Tim kecil';
  return 'Solo';
}

function businessHelperLabel(state){
  const b=ensureBusinessState(state);
  if(!b.helperActive) return 'Belum ada helper';
  if(b.helperTrust>=70) return 'Sangat bisa dipercaya';
  if(b.helperTrust>=55) return 'Mulai mandiri';
  if(b.helperTrust>=40) return 'Masih belajar ritme';
  return 'Perlu diawasi';
}

function businessHealthLabel(state){
  const b=ensureBusinessState(state);
  if(!b.active) return 'Belum punya usaha';
  if(b.lastWeeklyProfit<0) return 'Terdesak';
  if(b.missedDemand>=2) return 'Kewalahan';
  if(b.reputation<12) return 'Baru mulai';
  if(b.reputation<30) return 'Mulai dikenal';
  if(b.reputation<55) return 'Stabil';
  return 'Punya nama';
}

function businessEquipmentLabel(state){
  const level=ensureBusinessState(state).equipmentLevel||0;
  if(level<=0) return 'Dasar';
  if(level===1) return 'Lebih lengkap';
  if(level===2) return 'Profesional';
  return 'Kapasitas tinggi';
}

function startBusiness(state,sector){
  const meta=BUSINESS_META[sector];
  if(!meta) return {error:'Jenis usaha tidak tersedia.'};
  const cost=850000;
  if(state.player.money<cost) return {error:`Kamu membutuhkan Rp${cost.toLocaleString('id-ID')} sebagai modal awal.`};
  state.player.money-=cost;
  state.business={active:true,sector,name:meta.name,level:1,reputation:8,clients:1,lastManagedAt:state.time.totalHours,lastWeeklyProfit:0,totalProfit:0,lossStreak:0,startedAt:state.time.totalHours,equipmentLevel:0,retainedClients:0,capacity:3,inquiries:0,servedClients:0,missedDemand:0,growthStreak:0,reinvestments:0,lastReinvestOfferAt:-999,lastConflictAt:-999,lastRetainerAt:-999,scale:'solo',helperActive:false,helperName:'Ari',helperTrust:40,helperSkill:35,helperWage:220000,helperWeeks:0,delegated:false,ownerFullTime:false,lastScaleDecisionAt:-999,lastDelegationDecisionAt:-999,lastOwnerChoiceAt:-999,lastHelperIssueAt:-999,helperIssuePending:false};
  state.flags.businessStarted=true;
  if(!state.player.statuses.includes('punya_usaha_kecil')) state.player.statuses.push('punya_usaha_kecil');
  addHistory(state,`Umur 18 · Memulai ${meta.label.toLowerCase()} sebagai usaha kecil.`);
  addRecent(state,`${meta.name} resmi mulai berjalan dengan skala kecil.`);
  return {ok:true,text:`${meta.name} mulai berjalan. Modal awal besar, tapi sekarang kamu punya aset penghasilan yang tidak bergantung penuh pada tempat kerja.`};
}

function manageBusiness(state){
  const b=ensureBusinessState(state);
  const meta=businessMeta(state);
  if(!b.active||!meta) return {error:'Kamu belum punya usaha kecil.'};
  state.time.totalHours+=4;
  state.player.fatigue=Math.min(100,state.player.fatigue+8);
  b.lastManagedAt=state.time.totalHours;
  b.reputation=Math.min(100,b.reputation+(b.helperActive?4:5));
  if(b.helperActive){
    b.helperTrust=Math.min(100,(b.helperTrust||40)+3);
    b.helperSkill=Math.min(100,(b.helperSkill||35)+2);
    state.relationships.ari=Math.min(100,(state.relationships.ari||0)+2);
  }
  if(b.missedDemand>0) b.missedDemand=Math.max(0,b.missedDemand-1);
  state.skills[meta.skill]=(state.skills[meta.skill]||0)+10;
  discoverSkill(state,meta.skill);
  refreshBusinessCapacity(state);
  return b.helperActive
    ? `Kamu mengurus ${b.name} bersama Ari: membagi jadwal, mengecek kualitas, dan follow-up pelanggan. Kepercayaan kerja kalian ikut tumbuh.`
    : `Kamu mengurus ${b.name}: follow-up pelanggan, jadwal, dan kualitas kerja. Minggu ini kamu punya ruang untuk menangani lebih banyak permintaan.`;
}

function reinvestBusiness(state){
  const b=ensureBusinessState(state);
  if(!b.active) return {error:'Kamu belum punya usaha.'};
  const cost=600000+(b.equipmentLevel||0)*250000;
  if(state.player.money<cost) return {error:`Kamu membutuhkan Rp${cost.toLocaleString('id-ID')} untuk upgrade berikutnya.`};
  if((b.equipmentLevel||0)>=3) return {error:'Peralatan usahamu sudah cukup lengkap untuk skala ini.'};
  state.player.money-=cost;
  b.equipmentLevel=(b.equipmentLevel||0)+1;
  b.reinvestments=(b.reinvestments||0)+1;
  b.reputation=Math.min(100,b.reputation+3);
  b.lastReinvestOfferAt=state.time.totalHours;
  refreshBusinessCapacity(state);
  addRecent(state,`${b.name} menambah peralatan. Kapasitas mingguan naik.`);
  return {ok:true,cost,text:`Kamu menginvestasikan Rp${cost.toLocaleString('id-ID')} ke peralatan. Kapasitas usaha sekarang ${b.capacity} pekerjaan per minggu.`};
}

function addBusinessRetainer(state){
  const b=ensureBusinessState(state);
  if(!b.active) return false;
  b.retainedClients=Math.min(3,(b.retainedClients||0)+1);
  b.reputation=Math.min(100,b.reputation+4);
  b.lastRetainerAt=state.time.totalHours;
  addRecent(state,`Satu pelanggan memilih memakai ${b.name} secara rutin.`);
  return true;
}

function loseBusinessClient(state,amount=1){
  const b=ensureBusinessState(state);
  if(!b.active) return;
  const lose=Math.max(1,Math.round(amount));
  b.retainedClients=Math.max(0,(b.retainedClients||0)-lose);
  b.reputation=Math.max(0,(b.reputation||0)-3*lose);
}

function hireBusinessHelper(state){
  const b=ensureBusinessState(state);
  if(!b.active) return {error:'Kamu belum punya usaha.'};
  if(b.helperActive) return {error:'Ari sudah bekerja bersamamu.'};
  const onboarding=350000;
  if(state.player.money<onboarding) return {error:`Kamu membutuhkan Rp${onboarding.toLocaleString('id-ID')} untuk alat tambahan dan uang muka helper.`};
  state.player.money-=onboarding;
  b.helperActive=true;
  b.scale='assisted';
  b.helperName='Ari';
  b.helperTrust=Math.max(40,b.helperTrust||40);
  b.helperSkill=Math.max(35,b.helperSkill||35);
  b.helperWeeks=0;
  b.delegated=false;
  b.lastScaleDecisionAt=state.time.totalHours;
  state.npc.ari=state.npc.ari||{known:false,life:'belum_terlibat',progress:0};
  state.npc.ari.known=true;
  state.npc.ari.life='helper_usaha';
  state.relationships.ari=Math.max(10,state.relationships.ari||0);
  refreshBusinessCapacity(state);
  addHistory(state,`Umur 18 · Mengajak Ari menjadi helper pertama di ${b.name}.`);
  addRecent(state,`Ari mulai membantu ${b.name}. Kapasitas naik, tapi usaha sekarang punya biaya upah mingguan.`);
  return {ok:true,text:`Ari bergabung sebagai helper. Kapasitas naik menjadi ${b.capacity}, tetapi kamu sekarang menanggung upah Rp${b.helperWage.toLocaleString('id-ID')} per minggu.`};
}

function setBusinessDelegation(state,value){
  const b=ensureBusinessState(state);
  if(!b.helperActive) return false;
  b.delegated=!!value;
  b.lastDelegationDecisionAt=state.time.totalHours;
  if(value){
    b.helperTrust=Math.min(100,b.helperTrust+4);
    state.relationships.ari=Math.min(100,(state.relationships.ari||0)+4);
    addRecent(state,'Kamu mulai menyerahkan pekerjaan rutin kepada Ari. Waktumu lebih longgar, tapi kualitas kini juga bergantung padanya.');
  }else{
    addRecent(state,'Kamu mempertahankan kontrol langsung atas sebagian besar pekerjaan usaha.');
  }
  refreshBusinessCapacity(state);
  return true;
}

function focusBusinessFullTime(state){
  const b=ensureBusinessState(state);
  if(!b.active) return {error:'Kamu belum punya usaha.'};
  if(b.ownerFullTime) return {error:'Kamu sudah fokus penuh pada usaha.'};
  const oldJob=state.player.job;
  const oldName=JOBS[oldJob]?.name||'pekerjaan utama';
  state.player.job=null;
  state.player.workplace=null;
  state.player.salary=0;
  state.player.statuses=state.player.statuses.filter(x=>!['peran_ganda','gaji_ditekan','jam_lebih_fleksibel','fokus_karier'].includes(x));
  if(!state.player.statuses.includes('pemilik_usaha_penuh')) state.player.statuses.push('pemilik_usaha_penuh');
  b.ownerFullTime=true;
  state.life.trajectory='independent';
  state.life.majorDecisionAt=state.time.totalHours;
  if(!state.player.statuses.includes('jalur_mandiri')) state.player.statuses.push('jalur_mandiri');
  b.scale=b.helperActive?'owner_team':'owner_solo';
  b.lastOwnerChoiceAt=state.time.totalHours;
  b.reputation=Math.min(100,b.reputation+5);
  refreshBusinessCapacity(state);
  addHistory(state,`Umur 18 · Meninggalkan ${oldName} untuk fokus penuh membangun ${b.name}.`);
  addRecent(state,`Kamu berhenti dari ${oldName} dan menjadikan ${b.name} sebagai pekerjaan utamamu.`);
  return {ok:true,text:`Kamu melepas gaji tetap dan fokus penuh pada ${b.name}. Kapasitas naik, tapi keamanan penghasilan sekarang bergantung pada usaha.`};
}

function handleHelperIssue(state,backHelper=true){
  const b=ensureBusinessState(state);
  b.helperIssuePending=false;
  b.lastHelperIssueAt=state.time.totalHours;
  if(backHelper){
    b.helperTrust=Math.min(100,b.helperTrust+6);
    b.helperSkill=Math.min(100,b.helperSkill+4);
    state.relationships.ari=Math.min(100,(state.relationships.ari||0)+6);
    b.reputation=Math.max(0,b.reputation-1);
  }else{
    b.helperTrust=Math.max(0,b.helperTrust-7);
    state.relationships.ari=(state.relationships.ari||0)-5;
    b.reputation=Math.min(100,b.reputation+1);
  }
  refreshBusinessCapacity(state);
}

function simulateBusinessWeek(state){
  const b=ensureBusinessState(state);
  const meta=businessMeta(state);
  if(!b.active||!meta) return 0;
  const demand=businessDemand(state,b.sector);
  const managedRecently=state.time.totalHours-b.lastManagedAt<=7*24;
  const helperReliability=b.helperActive?Math.max(.78,Math.min(1.08,.78+(b.helperSkill||35)/260+(b.helperTrust||40)/420)):1;
  const capacity=refreshBusinessCapacity(state);
  const skill=state.skills[meta.skill]||0;
  const skillFactor=Math.min(.28,skill/2600);
  const repFactor=Math.min(.24,(b.reputation||0)/280);
  const demandFactor=.82+demand*.0045;

  const ownerPresence=managedRecently||b.ownerFullTime;
  const delegatedCoverage=b.helperActive&&b.delegated&&b.helperTrust>=45;
  const organic=Math.max(1,Math.round(1+(demand-40)/18+(b.reputation||0)/28+(b.ownerFullTime?1:0)));
  const inquiries=Math.max(b.retainedClients||0,organic+(b.retainedClients||0));
  const served=Math.max(0,Math.min(inquiries,capacity));
  const missed=Math.max(0,inquiries-served);
  const gross=Math.round(meta.baseTicket*served*demandFactor*(1+skillFactor+repFactor)*(b.helperActive?helperReliability:1));
  const helperCost=b.helperActive?(b.helperWage||220000):0;
  const costs=Math.round(meta.fixedCost+served*26000+(b.equipmentLevel||0)*18000+(b.retainedClients||0)*8000+helperCost);
  const profit=gross-costs;

  b.inquiries=inquiries;
  b.servedClients=served;
  b.clients=served;
  b.missedDemand=missed;
  b.lastWeeklyProfit=profit;
  b.totalProfit+=profit;
  state.player.money+=profit;

  if(b.helperActive){
    b.helperWeeks=(b.helperWeeks||0)+1;
    b.helperSkill=Math.min(100,(b.helperSkill||35)+(ownerPresence?2:1));
    if(ownerPresence) b.helperTrust=Math.min(100,(b.helperTrust||40)+1);
    state.npc.ari.progress=(state.npc.ari.progress||0)+1;
  }

  if(profit>0){
    b.lossStreak=0;
    b.growthStreak=(b.growthStreak||0)+1;
    b.reputation=Math.min(100,b.reputation+(ownerPresence?2:1)+(missed===0?1:0));
  }else{
    b.lossStreak=(b.lossStreak||0)+1;
    b.growthStreak=0;
    b.reputation=Math.max(0,b.reputation-2);
  }

  if(!ownerPresence && !delegatedCoverage){
    b.reputation=Math.max(0,b.reputation-(b.retainedClients>0?2:1));
    if(b.retainedClients>0 && state.time.totalHours-b.lastManagedAt>14*24 && b.reputation<35){
      loseBusinessClient(state,1);
      addRecent(state,`Satu pelanggan tetap ${b.name} pergi karena komunikasi dan jadwal mulai berantakan.`);
    }
  }else if(!ownerPresence && delegatedCoverage){
    if(b.helperTrust>=60) b.reputation=Math.min(100,b.reputation+1);
    const issueCycle=(state.world?.week||0)%3===0;
    if(issueCycle && b.helperTrust<62 && state.time.totalHours-(b.lastHelperIssueAt||-999)>=10*24){
      b.helperIssuePending=true;
      b.reputation=Math.max(0,b.reputation-2);
      addRecent(state,`Ari menangani masalah pelanggan tanpa menunggumu. Hasilnya belum sepenuhnya rapi.`);
    }
  }

  if(missed>=2){
    addRecent(state,`${b.name} menerima ${inquiries} permintaan, tapi hanya mampu menangani ${served}. Kapasitas mulai menjadi masalah.`);
  }

  if(!state.flags.firstBusinessCycleSeen){
    state.flags.firstBusinessCycleSeen=true;
    addRecent(state,`${b.name} menyelesaikan minggu usaha pertamanya · ${profit>=0?'+':'-'}Rp${Math.abs(profit).toLocaleString('id-ID')}.`);
  }
  return profit;
}
