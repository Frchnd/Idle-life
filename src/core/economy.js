import {addRecent} from './effects.js';

export const LIVING_COST_INTERVAL=30*24;

export function syncLivingCost(state){
  const cost=state.housing?.id==='rented_room'?1100000:600000;
  state.economy.livingCost=cost;
  if(state.housing){ state.housing.monthlyCost=cost; }
  return cost;
}

export function processLivingCosts(state){
  syncLivingCost(state);
  let charged=0;
  while(state.time.totalHours-state.economy.lastLivingCostAt>=LIVING_COST_INTERVAL){
    state.economy.lastLivingCostAt+=LIVING_COST_INTERVAL;
    state.player.money-=state.economy.livingCost;
    charged+=state.economy.livingCost;
  }
  if(charged>0) addRecent(state,`Biaya hidup dibayar · -Rp${charged.toLocaleString('id-ID')}.`);
  return charged;
}
