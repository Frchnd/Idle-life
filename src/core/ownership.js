function ensureOwnershipState(state){
  const base={assets:{},totalInvested:0,totalMaintenance:0,lastPurchaseAt:-9999};
  state.ownership={...base,...(state.ownership||{})};
  state.ownership.assets={...(state.ownership.assets||{})};
  for(const id of Object.keys(MAJOR_ASSETS)){
    const old=state.ownership.assets[id]||{};
    state.ownership.assets[id]={owned:false,condition:100,purchasedAt:null,lastMaintainedAt:-9999,wearTotal:0,...old};
    const item=state.ownership.assets[id];
    item.condition=Math.max(0,Math.min(100,Number.isFinite(Number(item.condition))?Number(item.condition):100));
  }
  return state.ownership;
}
function ownershipItem(state,id){ensureOwnershipState(state);return state.ownership.assets[id]||null;}
function ownershipOwned(state,id){return !!ownershipItem(state,id)?.owned;}
function ownershipCondition(state,id){const x=ownershipItem(state,id);return x?.owned?x.condition:0;}
function ownershipEfficiency(state,id){
  const c=ownershipCondition(state,id);
  if(c<=0)return 0;if(c<30)return .4;if(c<60)return .75;return 1;
}
function ownershipConditionLabel(state,id){
  if(!ownershipOwned(state,id))return 'Belum dimiliki';
  const c=ownershipCondition(state,id);if(c<=0)return 'Tidak layak';if(c<30)return 'Perlu perbaikan';if(c<60)return 'Mulai aus';return 'Baik';
}
function ownershipTone(state,id){const c=ownershipCondition(state,id);return c<=0?'danger':c<30?'warning':c<60?'info':'positive';}
function ownershipIndexedCost(state,base){const idx=Math.max(80,Number(state.world?.costIndex)||100);return Math.round((base*idx/100)/50000)*50000;}
function ownershipPurchaseCost(state,id){const def=MAJOR_ASSETS[id];return def?ownershipIndexedCost(state,def.purchaseCost):Infinity;}
function ownershipMaintenanceCost(state,id){const def=MAJOR_ASSETS[id];return def?ownershipIndexedCost(state,def.maintenanceCost):Infinity;}
function ownershipUnlocked(state,id){const def=MAJOR_ASSETS[id];if(!def)return false;if(ownershipOwned(state,id))return true;try{return !!def.unlock(state);}catch{return false;}}
function buyMajorAsset(state,id){
  ensureOwnershipState(state);const def=MAJOR_ASSETS[id];
  if(!def)return {error:'Aset itu tidak tersedia.'};
  if(state.ownership.assets[id].owned)return {error:'Aset itu sudah kamu miliki.'};
  if(!ownershipUnlocked(state,id))return {error:'Aset besar itu belum masuk akal untuk tahap hidupmu sekarang.'};
  const item=state.ownership.assets[id];
  const cost=ownershipPurchaseCost(state,id);if(state.player.money<cost)return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk mengambil ${def.name}.`};
  state.player.money-=cost;state.time.totalHours+=def.acquireHours||4;state.player.fatigue=Math.min(100,state.player.fatigue+Math.max(2,Math.round((def.acquireHours||4)/2)));
  item.owned=true;item.condition=100;item.purchasedAt=state.time.totalHours;item.lastMaintainedAt=state.time.totalHours;
  state.ownership.totalInvested=(state.ownership.totalInvested||0)+cost;state.ownership.lastPurchaseAt=state.time.totalHours;
  if(id==='business_rig'&&state.business?.active){state.business.reputation=Math.min(100,(state.business.reputation||0)+3);state.business.marketReputation=Math.min(100,(state.business.marketReputation||0)+2);}
  if(id==='owned_workspace'&&state.business?.active){state.business.reputation=Math.min(100,(state.business.reputation||0)+5);state.business.marketReputation=Math.min(100,(state.business.marketReputation||0)+6);if(!state.player.statuses.includes('punya_unit_usaha'))state.player.statuses.push('punya_unit_usaha');}
  if(typeof addHistory==='function')addHistory(state,`Umur ${typeof getCalendar==='function'?getCalendar(state.time.totalHours).age:18} · Memiliki ${def.name}.`);
  if(typeof addRecent==='function')addRecent(state,`${def.name} sekarang menjadi aset besar yang kamu miliki.`);
  if(typeof refreshBusinessCapacity==='function')refreshBusinessCapacity(state);
  return `${def.name} resmi dimiliki · ${def.acquireHours||4}j · -Rp${cost.toLocaleString('id-ID')}.`;
}
function maintainMajorAsset(state,id){
  ensureOwnershipState(state);const def=MAJOR_ASSETS[id],item=state.ownership.assets[id];
  if(!def||!item?.owned)return {error:'Aset itu belum kamu miliki.'};if(item.condition>=98)return {error:'Kondisinya masih sangat baik.'};
  const cost=ownershipMaintenanceCost(state,id);if(state.player.money<cost)return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk memperbaiki ${def.name}.`};
  state.player.money-=cost;state.time.totalHours+=def.maintenanceHours||2;state.player.fatigue=Math.min(100,state.player.fatigue+Math.max(1,Math.round((def.maintenanceHours||2)/2)));
  item.condition=100;item.lastMaintainedAt=state.time.totalHours;state.ownership.totalMaintenance=(state.ownership.totalMaintenance||0)+cost;
  if(typeof addRecent==='function')addRecent(state,`${def.name} dirawat dan kembali siap dipakai.`);if(typeof refreshBusinessCapacity==='function')refreshBusinessCapacity(state);
  return `${def.name} selesai dirawat · ${def.maintenanceHours||2}j · -Rp${cost.toLocaleString('id-ID')}.`;
}
function wearMajorAsset(state,id,amount=1){
  const item=ownershipItem(state,id);if(!item?.owned||item.condition<=0)return 0;const before=item.condition;
  item.condition=Math.max(0,Math.round((item.condition-Math.max(0,Number(amount)||0))*10)/10);item.wearTotal=(item.wearTotal||0)+(before-item.condition);
  if(before>0&&item.condition<=0&&typeof addRecent==='function')addRecent(state,`${MAJOR_ASSETS[id].name} tidak layak dipakai sampai diperbaiki.`);
  else if(before>=30&&item.condition<30&&typeof addRecent==='function')addRecent(state,`${MAJOR_ASSETS[id].name} mulai membutuhkan perhatian serius.`);
  return before-item.condition;
}
function majorAssetBusinessCapacityBonus(state){
  if(!state.business?.active)return 0;return Math.round(1*ownershipEfficiency(state,'business_rig')+2*ownershipEfficiency(state,'owned_workspace'));
}
function majorAssetBusinessGrossMultiplier(state){
  if(!state.business?.active)return 1;return 1+.05*ownershipEfficiency(state,'business_rig')+.03*ownershipEfficiency(state,'owned_workspace');
}
function majorAssetBusinessCostAdjustment(state){
  if(!state.business?.active)return 0;const eff=ownershipEfficiency(state,'owned_workspace');return eff>0?-Math.round(45000*eff):0;
}
function wearMajorBusinessAssetsWeekly(state){
  if(!state.business?.active)return;wearMajorAsset(state,'business_rig',2.5);wearMajorAsset(state,'owned_workspace',1);
}
function majorAssetsSnapshot(state){
  ensureOwnershipState(state);return Object.values(MAJOR_ASSETS).filter(def=>ownershipUnlocked(state,def.id)||ownershipOwned(state,def.id)).map(def=>{
    const item=state.ownership.assets[def.id],owned=!!item?.owned;
    return {...def,owned,condition:owned?item.condition:0,conditionLabel:ownershipConditionLabel(state,def.id),tone:owned?ownershipTone(state,def.id):'neutral',purchaseCost:ownershipPurchaseCost(state,def.id),maintenanceCost:ownershipMaintenanceCost(state,def.id),unlocked:ownershipUnlocked(state,def.id)};
  });
}
