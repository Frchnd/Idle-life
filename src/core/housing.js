function ensureHousingState(state){
  const id=HOUSING_OPTIONS[state.housing?.id]?state.housing.id:'family_home';
  const meta=HOUSING_OPTIONS[id];
  state.housing={
    id,
    label:meta.label,
    neighborhood:meta.neighborhood,
    monthlyCost:Number.isFinite(state.housing?.monthlyCost)?state.housing.monthlyCost:meta.monthlyCost,
    baseMonthlyCost:meta.monthlyCost,
    movedAt:state.housing?.movedAt??null,
    moves:Number.isFinite(state.housing?.moves)?state.housing.moves:0
  };
  return state.housing;
}
function housingMeta(state){ensureHousingState(state);return HOUSING_OPTIONS[state.housing.id]||HOUSING_OPTIONS.family_home;}
function housingMarketUnlocked(state){return !!state.flags?.housingOfferSeen || (state.career?.workCount||0)>=8 || state.housing?.id!=='family_home';}
function housingDeposit(state,id){const meta=HOUSING_OPTIONS[id];if(!meta)return Infinity;if(id==='rented_room'&&state.flags?.familySupport)return 1000000;return meta.deposit||0;}
function housingMonthlyBase(state){return housingMeta(state).monthlyCost;}
function housingStudyProfile(state){const h=housingMeta(state);return {fatigue:h.studyFatigue,learning:h.studyLearning,technology:h.studyTechnology,social:h.socialBonus||0};}
function housingRestRecovery(state){return housingMeta(state).restRecovery||45;}
function housingCommuteHours(state,workplaceId){const h=housingMeta(state);return Math.max(0,Number(h.commute?.[workplaceId]||0));}
function housingCityTravel(state,locationId){const h=housingMeta(state);const extraHours=Math.max(0,Number(h.cityTravel?.[locationId]||0));return {extraHours,extraCost:idTravelCost(extraHours)};}
function idTravelCost(extraHours){return extraHours>=2?10000:extraHours===1?5000:0;}
function housingCurrentMonthlyCost(state){const base=housingMonthlyBase(state),idx=state.world?.costIndex||100;return Math.round((base*idx/100)/10000)*10000;}
function housingPressureThreshold(state){return Math.max(300000,Math.round(housingCurrentMonthlyCost(state)*.38));}
function housingSnapshot(state){
  ensureHousingState(state);
  return Object.values(HOUSING_OPTIONS).map(meta=>({
    ...meta,current:state.housing.id===meta.id,deposit:housingDeposit(state,meta.id),indexedMonthly:Math.round((meta.monthlyCost*(state.world?.costIndex||100)/100)/10000)*10000,
    currentWorkCommute:state.player?.job?(typeof financeCommuteForHousingMeta==='function'?financeCommuteForHousingMeta(state,meta,JOBS[state.player.job]?.workplaceId):housingCommuteForMeta(meta,JOBS[state.player.job]?.workplaceId)):null
  }));
}
function housingCommuteForMeta(meta,workplaceId){return Math.max(0,Number(meta?.commute?.[workplaceId]||0));}
function moveHousing(state,id){
  ensureHousingState(state);
  const target=HOUSING_OPTIONS[id];
  if(!target)return {error:'Pilihan tempat tinggal itu belum tersedia.'};
  if(state.housing.id===id)return {error:'Kamu sudah tinggal di sana.'};
  if(id!=='family_home'&&!housingMarketUnlocked(state))return {error:'Kamu belum cukup stabil untuk mempertimbangkan pindah tempat tinggal.'};
  const deposit=housingDeposit(state,id);
  if(state.player.money<deposit)return {error:`Butuh Rp${deposit.toLocaleString('id-ID')} untuk biaya masuk dan pindahan.`};
  const old=state.housing.id;
  state.player.money-=deposit;
  state.time.totalHours+=target.moveHours||6;
  state.housing={id:target.id,label:target.label,neighborhood:target.neighborhood,monthlyCost:target.monthlyCost,baseMonthlyCost:target.monthlyCost,movedAt:state.time.totalHours,moves:(state.housing.moves||0)+1};
  state.flags.housingOfferSeen=true;
  state.flags.rentPressureSeen=false;
  state.flags.movedOut=id!=='family_home';
  state.player.statuses=state.player.statuses.filter(x=>!['tinggal_bersama_keluarga','tinggal_sendiri','tinggal_bersama_penghuni','tinggal_tepi_kota'].includes(x));
  if(id==='family_home'){
    state.player.statuses.push('tinggal_bersama_keluarga');
    state.relationships.family=Math.min(100,(state.relationships.family||0)+3);
  }else{
    state.player.statuses.push('tinggal_sendiri');
    if(id==='shared_house') state.player.statuses.push('tinggal_bersama_penghuni');
    if(id==='outskirts_room') state.player.statuses.push('tinggal_tepi_kota');
    if(old==='family_home') state.relationships.family=Math.max(-100,(state.relationships.family||0)-1);
  }
  syncLivingCost(state);
  if(old==='family_home'&&id!=='family_home') state.scheduled.push({at:state.time.totalHours+12,kind:'move_out_reflection'});
  addHistory(state,`Umur 18 · Pindah ke ${target.name} di ${target.neighborhood}.`);
  addRecent(state,`${target.name} menjadi tempat tinggal barumu. Biaya, akses, dan ritme harianmu ikut berubah.`);
  return `Pindahan selesai · ${target.moveHours||6} jam berlalu · biaya masuk Rp${deposit.toLocaleString('id-ID')}.`;
}
