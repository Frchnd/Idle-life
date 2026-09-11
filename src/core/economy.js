const LIVING_COST_INTERVAL=30*24;

function syncLivingCost(state){
  const world=ensureWorldState(state);
  if(typeof syncPersonalFinance==='function') syncPersonalFinance(state);
  const baseHousing=typeof housingMonthlyBase==='function'?housingMonthlyBase(state):(state.housing?.id==='rented_room'?1100000:600000);
  const fullHousing=Math.round((baseHousing*(world.costIndex||100)/100)/10000)*10000;
  const fullLifestyle=typeof lifestyleMonthlyCost==='function'?lifestyleMonthlyCost(state):0;
  const shared=typeof adjustSharedLivingCosts==='function'?adjustSharedLivingCosts(state,fullHousing,fullLifestyle):{housing:fullHousing,lifestyle:fullLifestyle,partnerContribution:0};
  const housing=shared.housing,lifestyle=shared.lifestyle;
  const transport=typeof transportMonthlyCost==='function'?transportMonthlyCost(state):0;
  const family=typeof familyCostBreakdown==='function'?familyCostBreakdown(state):{player:0,partner:0,full:0};
  const total=housing+lifestyle+transport+(family.player||0);
  state.economy.baseLivingCost=baseHousing;
  state.economy.housingCost=housing;
  state.economy.lifestyleCost=lifestyle;
  state.economy.transportCost=transport;
  state.economy.familyCost=family.player||0;
  state.economy.partnerContribution=(shared.partnerContribution||0)+(family.partner||0);
  state.economy.livingCost=total;
  if(state.housing){ state.housing.monthlyCost=housing; }
  return total;
}

function processLivingCosts(state){
  syncLivingCost(state);
  let charged=0,emergencyUsed=0,cycles=0;
  while(state.time.totalHours-state.economy.lastLivingCostAt>=LIVING_COST_INTERVAL){
    state.economy.lastLivingCostAt+=LIVING_COST_INTERVAL;
    const total=syncLivingCost(state);
    const used=typeof coverMonthlyShortfallFromEmergency==='function'?coverMonthlyShortfallFromEmergency(state,total):0;
    if(typeof coverMonthlyShortfallFromEmergency!=='function') state.player.money-=total;
    charged+=total;
    emergencyUsed+=used;
    cycles++;
  }
  if(charged>0){
    const monthly=cycles===1?'Biaya bulanan':'Biaya hidup';
    const detail=state.economy.lifestyleCost||state.economy.transportCost||state.economy.familyCost
      ? `Rumah ${state.economy.housingCost.toLocaleString('id-ID')} · gaya hidup ${state.economy.lifestyleCost.toLocaleString('id-ID')} · transport ${state.economy.transportCost.toLocaleString('id-ID')}${state.economy.familyCost?` · keluarga ${state.economy.familyCost.toLocaleString('id-ID')}`:''}.`
      : '';
    addRecent(state,`${monthly} dibayar · -Rp${charged.toLocaleString('id-ID')}.${emergencyUsed?` Dana darurat menutup Rp${emergencyUsed.toLocaleString('id-ID')}.`:''}${detail?` ${detail}`:''}`);
  }
  return charged;
}
