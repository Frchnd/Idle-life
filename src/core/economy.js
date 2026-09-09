import {addRecent} from './effects.js';

export const LIVING_COST_INTERVAL=30*24;

export function processLivingCosts(state){
  let charged=0;
  while(state.time.totalHours-state.economy.lastLivingCostAt>=LIVING_COST_INTERVAL){
    state.economy.lastLivingCostAt+=LIVING_COST_INTERVAL;
    state.player.money-=state.economy.livingCost;
    charged+=state.economy.livingCost;
  }
  if(charged>0) addRecent(state,`Biaya hidup dibayar · -Rp${charged.toLocaleString('id-ID')}.`);
  return charged;
}
