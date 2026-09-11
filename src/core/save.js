// Pertahankan key lama supaya seluruh save lama tetap ikut naik ke Build AH.
const SAVE_KEY='hidup-vertical-slice-f-v2';

function hasSavedState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const parsed=JSON.parse(raw);
    return !!parsed && typeof parsed==='object';
  }catch{
    return false;
  }
}

function loadState(){
  const fresh=createInitialState();
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return fresh;
    const saved=JSON.parse(raw);
    if(!saved || typeof saved!=='object') return fresh;
    return mergeState(fresh,saved);
  }catch{
    return fresh;
  }
}

function mergeState(base,saved){
  const out=clone(base);
  Object.assign(out,saved);
  out.version=SAVE_VERSION;
  out.player={...base.player,...(saved.player||{})};
  // Build W+ mengganti nama prototipe lama dengan karakter fiksi tetap.
  if(!out.player.name || out.player.name==='Fernando') out.player.name='Raka';
  out.time={...base.time,...(saved.time||{})};
  out.economy={...base.economy,...(saved.economy||{})};
  out.world={...base.world,...(saved.world||{})};
  out.world.sectors={...base.world.sectors,...(saved.world?.sectors||{})};
  out.world.lastOpportunityWeek={...base.world.lastOpportunityWeek,...(saved.world?.lastOpportunityWeek||{})};
  out.world.competitors={...base.world.competitors,...(saved.world?.competitors||{})};
  for(const key of Object.keys(base.world.competitors||{})) out.world.competitors[key]={...base.world.competitors[key],...(saved.world?.competitors?.[key]||{})};
  out.world.workplaces={...base.world.workplaces,...(saved.world?.workplaces||{})};
  for(const key of Object.keys(base.world.workplaces)) out.world.workplaces[key]={...base.world.workplaces[key],...(saved.world?.workplaces?.[key]||{})};
  if(!Array.isArray(out.world.news)) out.world.news=[];
  out.housing={...base.housing,...(saved.housing||{})};
  out.finance={...base.finance,...(saved.finance||{})};
  out.finance.ownedTransport=Array.isArray(saved.finance?.ownedTransport)?[...saved.finance.ownedTransport]:[...base.finance.ownedTransport];
  out.city={...base.city,...(saved.city||{})};
  out.city.visits={...base.city.visits,...(saved.city?.visits||{})};
  out.social={...base.social,...(saved.social||{})};
  out.social.encounters={...base.social.encounters,...(saved.social?.encounters||{})};
  out.social.lastEncounterAt={...base.social.lastEncounterAt,...(saved.social?.lastEncounterAt||{})};
  out.social.lastLocationByNpc={...base.social.lastLocationByNpc,...(saved.social?.lastLocationByNpc||{})};
  out.characterStories={...base.characterStories,...(saved.characterStories||{})};
  for(const key of Object.keys(base.characterStories||{})) out.characterStories[key]={...base.characterStories[key],...(saved.characterStories?.[key]||{})};
  out.relationshipStakes={...base.relationshipStakes,...(saved.relationshipStakes||{})};
  out.relationshipStakes.records={...base.relationshipStakes.records,...(saved.relationshipStakes?.records||{})};
  out.relationshipStakes.strain={...base.relationshipStakes.strain,...(saved.relationshipStakes?.strain||{})};
  out.relationshipStakes.fulfilled={...base.relationshipStakes.fulfilled,...(saved.relationshipStakes?.fulfilled||{})};
  out.relationshipStakes.missed={...base.relationshipStakes.missed,...(saved.relationshipStakes?.missed||{})};
  out.relationshipStakes.lastRepairAt={...base.relationshipStakes.lastRepairAt,...(saved.relationshipStakes?.lastRepairAt||{})};
  out.relationshipStakes.lastStakeAt=Number.isFinite(saved.relationshipStakes?.lastStakeAt)?saved.relationshipStakes.lastStakeAt:base.relationshipStakes.lastStakeAt;
  out.life={...base.life,...(saved.life||{})};
  out.pacing={...base.pacing,...(saved.pacing||{})};
  out.playtest={...base.playtest,...(saved.playtest||{})};
  out.education={...base.education,...(saved.education||{})};
  out.education.certifications=Array.isArray(saved.education?.certifications)?[...saved.education.certifications]:[];
  out.education.completedAt={...base.education.completedAt,...(saved.education?.completedAt||{})};
  out.contentRuntime={...base.contentRuntime,...(saved.contentRuntime||{})};
  if(!Array.isArray(out.contentRuntime.eventHistory)) out.contentRuntime.eventHistory=[];
  out.contentRuntime.eventCooldowns={...base.contentRuntime.eventCooldowns,...(saved.contentRuntime?.eventCooldowns||{})};
  out.contentRuntime.poolHistory={...base.contentRuntime.poolHistory,...(saved.contentRuntime?.poolHistory||{})};
  out.contentRuntime.poolRecent={...base.contentRuntime.poolRecent,...(saved.contentRuntime?.poolRecent||{})};
  out.contentRuntime.rngSeed=Number.isFinite(Number(saved.contentRuntime?.rngSeed))?Number(saved.contentRuntime.rngSeed):base.contentRuntime.rngSeed;
  out.contentRuntime.enabledPacks=Array.isArray(saved.contentRuntime?.enabledPacks)?[...saved.contentRuntime.enabledPacks]:[];
  out.contentRuntime.packVersions={...base.contentRuntime.packVersions,...(saved.contentRuntime?.packVersions||{})};
  out.skills={...base.skills,...(saved.skills||{})};
  out.relationships={...base.relationships,...(saved.relationships||{})};
  out.assets={...base.assets,...(saved.assets||{})};
  out.assets.inventory={...base.assets.inventory,...(saved.assets?.inventory||{})};
  out.assets.nextOpportunityAt={...base.assets.nextOpportunityAt,...(saved.assets?.nextOpportunityAt||{})};
  out.ownership={...base.ownership,...(saved.ownership||{})};
  out.ownership.assets={...base.ownership.assets,...(saved.ownership?.assets||{})};
  out.business={...base.business,...(saved.business||{})};
  out.npc={...base.npc,...(saved.npc||{})};
  for(const key of Object.keys(base.npc)) out.npc[key]={...base.npc[key],...(saved.npc?.[key]||{})};
  out.career={...base.career,...(saved.career||{})};
  out.career.jobWorkCounts={...base.career.jobWorkCounts,...(saved.career?.jobWorkCounts||{})};
  if(!Array.isArray(out.career.salaryNegotiatedJobs)) out.career.salaryNegotiatedJobs=[];
  ensureEducationState(out);
  ensureCityState(out);
  ensureSocialState(out);
  ensureCharacterStories(out);
  ensureRelationshipStakes(out);
  out.flags={...base.flags,...(saved.flags||{})};
  out.routine={...base.routine,...(saved.routine||{})};
  if(!Array.isArray(out.discoveredSkills)) out.discoveredSkills=[...base.discoveredSkills];
  if(!Array.isArray(out.opportunities)) out.opportunities=[];
  if(!Array.isArray(out.scheduled)) out.scheduled=[];
  if(!Array.isArray(out.recent)) out.recent=[];
  if(!Array.isArray(out.history)) out.history=[...base.history];

  if(saved.version===2){
    out.economy.lastLivingCostAt=out.time.totalHours;
    if(saved.player?.job && (saved.career?.workCount||0)>0){
      const current=out.career.jobWorkCounts[saved.player.job]||0;
      out.career.jobWorkCounts[saved.player.job]=Math.max(current,saved.career.workCount);
    }
  }

  if(!saved.housing){
    const livingAlone=out.player.statuses.includes('tinggal_sendiri');
    out.housing=livingAlone
      ? {id:'rented_room',label:'Kamar sewa sendiri',monthlyCost:1100000,movedAt:out.time.totalHours}
      : {id:'family_home',label:'Bersama keluarga',monthlyCost:600000,movedAt:null};
  }
  if(typeof ensureHousingState==='function') ensureHousingState(out);
  if(typeof ensureFinanceState==='function') ensureFinanceState(out);
  if(typeof ensureAssetState==='function') ensureAssetState(out);
  if(typeof ensureOwnershipState==='function') ensureOwnershipState(out);
  if(typeof syncPersonalAssets==='function') syncPersonalAssets(out);
  if(typeof syncPersonalFinance==='function') syncPersonalFinance(out);
  out.economy.baseLivingCost=typeof housingMonthlyBase==='function'?housingMonthlyBase(out):(out.housing.id==='rented_room'?1100000:600000);
  if(typeof syncLivingCost==='function') syncLivingCost(out);
  else out.economy.livingCost=out.economy.baseLivingCost;

  // Build I dan versi sebelumnya belum punya pencatat pacing/playtest.
  if(!saved.pacing){
    out.pacing.lastResolvedEventAt=Math.max(-999,out.time.totalHours-12);
    out.pacing.lastSurfacedEventAt=Math.max(-999,out.time.totalHours-12);
    out.pacing.eventCount=Math.min(6,(out.history?.length||0));
  }
  if(!saved.playtest){
    out.playtest.actions=Math.max(0,out.career.workCount||0);
    out.playtest.opportunitiesTaken=Math.max(0,Math.floor((out.career.sideIncomeTotal||0)/200000));
  }

  // Build M menambah ekonomi perusahaan; Build N memperdalam kapasitas dan pelanggan tetap; Build O menambah helper/delegasi; Build P menambah kompetisi pasar lokal.
  for(const [id,baseCompany] of Object.entries(base.world.workplaces)){
    out.world.workplaces[id]={...baseCompany,...(out.world.workplaces[id]||{})};
  }
  if(!saved.business) out.business={...base.business};
  ensureBusinessState(out);
  if(saved.business?.marketReputation===undefined && out.business.active){
    out.business.marketReputation=Math.max(8,out.business.reputation||0);
  }
  if(saved.player?.job && (!Number.isFinite(out.player.salary) || out.player.salary<=0)){
    out.player.salary=JOBS[out.player.job]?.salary||0;
  }
  return out;
}

function saveState(state){
  state.version=SAVE_VERSION;
  state.lastSeen=Date.now();
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

function clearState(){ localStorage.removeItem(SAVE_KEY); }
