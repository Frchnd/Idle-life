const LIVING_COST_INTERVAL=30*24;

function syncLivingCost(state){
  const world=ensureWorldState(state);
  const base=typeof housingMonthlyBase==='function'?housingMonthlyBase(state):(state.housing?.id==='rented_room'?1100000:600000);
  const indexed=Math.round((base*(world.costIndex||100)/100)/10000)*10000;
  state.economy.baseLivingCost=base;
  state.economy.livingCost=indexed;
  if(state.housing){ state.housing.monthlyCost=indexed; }
  return indexed;
}

function processLivingCosts(state){
  syncLivingCost(state);
  let charged=0;
  while(state.time.totalHours-state.economy.lastLivingCostAt>=LIVING_COST_INTERVAL){
    state.economy.lastLivingCostAt+=LIVING_COST_INTERVAL;
    syncLivingCost(state);
    state.player.money-=state.economy.livingCost;
    charged+=state.economy.livingCost;
  }
  if(charged>0) addRecent(state,`Biaya hidup dibayar · -Rp${charged.toLocaleString('id-ID')}.`);
  return charged;
}
