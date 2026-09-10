const BUSINESS_META={
  mechanics:{name:'Servis Mandiri',label:'Jasa mekanik panggilan',baseRevenue:230000,baseCost:155000,skill:'mechanics'},
  retail:{name:'Jasa Promosi Lokal',label:'Jasa event & pelayanan',baseRevenue:190000,baseCost:130000,skill:'social'},
  technology:{name:'Bantuan Digital',label:'Jasa teknologi kecil',baseRevenue:220000,baseCost:145000,skill:'technology'}
};

function ensureBusinessState(state){
  const defaults={active:false,sector:null,name:null,level:0,reputation:0,clients:0,lastManagedAt:0,lastWeeklyProfit:0,totalProfit:0,lossStreak:0,startedAt:null};
  state.business=state.business||{};
  for(const [key,value] of Object.entries(defaults)){
    if(state.business[key]===undefined) state.business[key]=value;
  }
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

function businessHealthLabel(state){
  const b=ensureBusinessState(state);
  if(!b.active) return 'Belum punya usaha';
  if(b.lastWeeklyProfit<0) return 'Terdesak';
  if(b.reputation<12) return 'Baru mulai';
  if(b.reputation<30) return 'Mulai dikenal';
  if(b.reputation<55) return 'Stabil';
  return 'Punya nama';
}

function startBusiness(state,sector){
  const meta=BUSINESS_META[sector];
  if(!meta) return {error:'Jenis usaha tidak tersedia.'};
  const cost=850000;
  if(state.player.money<cost) return {error:`Kamu membutuhkan Rp${cost.toLocaleString('id-ID')} sebagai modal awal.`};
  state.player.money-=cost;
  state.business={active:true,sector,name:meta.name,level:1,reputation:8,clients:1,lastManagedAt:state.time.totalHours,lastWeeklyProfit:0,totalProfit:0,lossStreak:0,startedAt:state.time.totalHours};
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
  b.reputation=Math.min(100,b.reputation+5);
  b.clients=Math.min(12,b.clients+(b.reputation>=25?1:0));
  state.skills[meta.skill]=(state.skills[meta.skill]||0)+10;
  discoverSkill(state,meta.skill);
  return `Kamu mengurus ${b.name}: follow-up pelanggan, jadwal, dan kualitas kerja. Reputasi usaha meningkat.`;
}

function simulateBusinessWeek(state){
  const b=ensureBusinessState(state);
  const meta=businessMeta(state);
  if(!b.active||!meta) return 0;
  const demand=businessDemand(state,b.sector);
  const managedRecently=state.time.totalHours-b.lastManagedAt<=14*24;
  const skill=state.skills[meta.skill]||0;
  const skillFactor=Math.min(.45,skill/1800);
  const demandFactor=.78+demand*.005;
  const repFactor=1+Math.min(.55,b.reputation/100);
  const clientFactor=.68+Math.min(.55,b.clients*.055);
  const gross=Math.round(meta.baseRevenue*demandFactor*repFactor*clientFactor*(1+skillFactor));
  const costs=Math.round(meta.baseCost*(1+b.level*.08)+(b.clients*6000));
  const profit=gross-costs;
  b.lastWeeklyProfit=profit;
  b.totalProfit+=profit;
  state.player.money+=profit;
  if(profit>0){
    b.lossStreak=0;
    b.reputation=Math.min(100,b.reputation+(managedRecently?2:1));
    if(managedRecently && demand>=64) b.clients=Math.min(12,b.clients+1);
  }else{
    b.lossStreak=(b.lossStreak||0)+1;
    b.reputation=Math.max(0,b.reputation-2);
  }
  if(!managedRecently) b.reputation=Math.max(0,b.reputation-1);
  if(!state.flags.firstBusinessCycleSeen){
    state.flags.firstBusinessCycleSeen=true;
    addRecent(state,`${b.name} menyelesaikan minggu usaha pertamanya · ${profit>=0?'+':'-'}Rp${Math.abs(profit).toLocaleString('id-ID')}.`);
  }
  return profit;
}
