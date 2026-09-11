function ensureAssetState(state){
  const legacyLaptop=!!state.assets?.laptop;
  const base={laptop:legacyLaptop,inventory:{},totalMaintenance:0,lastMaintenanceAt:-9999,nextOpportunityAt:{mechanic_toolkit:-9999}};
  state.assets={...base,...(state.assets||{})};
  state.assets.inventory={...(state.assets.inventory||{})};
  state.assets.nextOpportunityAt={...base.nextOpportunityAt,...(state.assets.nextOpportunityAt||{})};
  for(const id of Object.keys(PERSONAL_ASSETS)){
    const old=state.assets.inventory[id]||{};
    state.assets.inventory[id]={owned:false,condition:100,purchasedAt:null,lastMaintainedAt:-9999,wearTotal:0,...old};
    state.assets.inventory[id].condition=Math.max(0,Math.min(100,Math.round(Number(state.assets.inventory[id].condition)||0)));
  }
  if(state.assets.laptop) state.assets.inventory.laptop.owned=true;
  const ownedTransport=state.finance?.ownedTransport||[];
  if(ownedTransport.includes('bicycle')) state.assets.inventory.bicycle.owned=true;
  if(ownedTransport.includes('motorbike')) state.assets.inventory.motorbike.owned=true;
  if(state.assets.inventory.laptop.owned) state.assets.laptop=true;
  return state.assets;
}

function syncPersonalAssets(state){
  ensureAssetState(state);
  const ownedTransport=state.finance?.ownedTransport||[];
  for(const id of ['bicycle','motorbike']){
    if(ownedTransport.includes(id) && !state.assets.inventory[id].owned){
      state.assets.inventory[id].owned=true;
      state.assets.inventory[id].condition=100;
      state.assets.inventory[id].purchasedAt=state.time?.totalHours||0;
    }
  }
  if(state.assets.laptop && !state.assets.inventory.laptop.owned){
    state.assets.inventory.laptop.owned=true;
    state.assets.inventory.laptop.condition=100;
    state.assets.inventory.laptop.purchasedAt=state.time?.totalHours||0;
  }
  return state.assets;
}

function syncAssetOpportunities(state){
  syncPersonalAssets(state);
  const now=state.time?.totalHours||0;
  const toolkit=state.assets.inventory.mechanic_toolkit;
  if(toolkit.owned && toolkit.condition>0 && (state.skills?.mechanics||0)>=100 && now>=(state.assets.nextOpportunityAt.mechanic_toolkit??-9999)){
    const exists=(state.opportunities||[]).some(x=>x.id==='asset_mobile_repair');
    if(!exists){
      state.opportunities=state.opportunities||[];
      state.opportunities.push({id:'asset_mobile_repair',name:'Servis Panggilan',summary:'4j · toolkit pribadi · pelanggan lokal',expireAt:now+48,source:'Toolkit Mekanik'});
      state.assets.nextOpportunityAt.mechanic_toolkit=now+120;
      if(typeof addRecent==='function') addRecent(state,'Toolkit pribadimu membuka servis panggilan kecil dari pelanggan lokal.');
    }
  }
  return state.assets;
}

function personalAssetState(state,id){syncPersonalAssets(state);return state.assets.inventory[id]||null;}
function personalAssetOwned(state,id){return !!personalAssetState(state,id)?.owned;}
function personalAssetCondition(state,id){const x=personalAssetState(state,id);return x?.owned?x.condition:0;}
function personalAssetUsable(state,id){return personalAssetOwned(state,id)&&personalAssetCondition(state,id)>0;}
function personalAssetConditionLabel(state,id){
  const c=personalAssetCondition(state,id);
  if(!personalAssetOwned(state,id)) return 'Belum dimiliki';
  if(c<=0) return 'Rusak';
  if(c<30) return 'Bermasalah';
  if(c<60) return 'Mulai aus';
  return 'Baik';
}
function personalAssetTone(state,id){
  const c=personalAssetCondition(state,id);
  if(c<=0) return 'danger';
  if(c<30) return 'warning';
  if(c<60) return 'info';
  return 'positive';
}
function personalAssetEfficiency(state,id){
  const c=personalAssetCondition(state,id);
  if(c<=0) return 0;
  if(c<30) return .45;
  if(c<60) return .75;
  return 1;
}
function personalAssetMaintenanceCost(state,id){
  const def=PERSONAL_ASSETS[id];
  if(!def) return 0;
  const idx=Math.max(80,Number(state.world?.costIndex)||100);
  return Math.round((def.maintenanceCost*idx/100)/10000)*10000;
}
function wearPersonalAsset(state,id,amount=1){
  const item=personalAssetState(state,id);
  if(!item?.owned || item.condition<=0) return 0;
  const before=item.condition;
  item.condition=Math.max(0,Math.round((item.condition-Math.max(0,Number(amount)||0))*10)/10);
  item.wearTotal=(item.wearTotal||0)+(before-item.condition);
  if(before>0 && item.condition<=0 && typeof addRecent==='function') addRecent(state,`${PERSONAL_ASSETS[id]?.name||'Salah satu barangmu'} rusak dan tidak memberi manfaat sampai dirawat.`);
  else if(before>=30 && item.condition<30 && typeof addRecent==='function') addRecent(state,`${PERSONAL_ASSETS[id]?.name||'Salah satu barangmu'} mulai bermasalah. Manfaatnya berkurang sampai dirawat.`);
  return before-item.condition;
}
function maintainPersonalAsset(state,id){
  syncPersonalAssets(state);
  const def=PERSONAL_ASSETS[id],item=state.assets.inventory[id];
  if(!def||!item?.owned) return {error:'Barang itu belum kamu miliki.'};
  if(item.condition>=98) return {error:'Kondisinya masih sangat baik.'};
  const cost=personalAssetMaintenanceCost(state,id);
  if(state.player.money<cost) return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk merawat ${def.name}.`};
  state.player.money-=cost;
  const hours=Math.max(1,Number(def.maintenanceHours)||1);
  state.time.totalHours+=hours;
  state.player.fatigue=Math.min(100,state.player.fatigue+Math.max(0,hours-1));
  item.condition=100;
  item.lastMaintainedAt=state.time.totalHours;
  state.assets.lastMaintenanceAt=state.time.totalHours;
  state.assets.totalMaintenance=(state.assets.totalMaintenance||0)+cost;
  if(typeof addRecent==='function') addRecent(state,`${def.name} dirawat dan kembali dalam kondisi baik.`);
  return `${def.name} selesai dirawat · ${Math.max(1,Number(def.maintenanceHours)||1)}j · -Rp${cost.toLocaleString('id-ID')}.`;
}
function personalAssetUnlocked(state,id){
  const def=PERSONAL_ASSETS[id];
  if(!def) return false;
  if(personalAssetOwned(state,id)) return true;
  if(!def.buyable) return false;
  if(def.unlockSkill && (state.skills?.[def.unlockSkill]||0)<(def.unlockXp||0)) return false;
  if(def.unlockAfterWorks && (state.career?.workCount||0)<def.unlockAfterWorks) return false;
  return true;
}
function buyPersonalAsset(state,id){
  syncPersonalAssets(state);
  const def=PERSONAL_ASSETS[id];
  if(!def||!def.buyable) return {error:'Barang itu dibuka lewat jalur lain.'};
  if(personalAssetOwned(state,id)) return {error:'Barang itu sudah kamu miliki.'};
  if(!personalAssetUnlocked(state,id)) return {error:'Barang itu belum relevan dengan hidupmu sekarang.'};
  if(state.player.money<def.purchaseCost) return {error:`Butuh Rp${def.purchaseCost.toLocaleString('id-ID')} untuk membeli ${def.name}.`};
  state.player.money-=def.purchaseCost;
  const item=state.assets.inventory[id];
  item.owned=true;item.condition=100;item.purchasedAt=state.time.totalHours;item.lastMaintainedAt=state.time.totalHours;
  if(typeof addHistory==='function') addHistory(state,`Umur ${typeof getCalendar==='function'?getCalendar(state.time.totalHours).age:18} · Membeli ${def.name}.`);
  if(typeof addRecent==='function') addRecent(state,`${def.name} sekarang menjadi bagian dari hidupmu.`);
  return `${def.name} dibeli · -Rp${def.purchaseCost.toLocaleString('id-ID')}.`;
}

function personalAssetTransportEfficiency(state,id){
  if(id==='public') return 1;
  if(!['bicycle','motorbike'].includes(id)) return 1;
  return personalAssetEfficiency(state,id)>=.75?1:0;
}
function personalAssetTravelFatiguePenalty(state,id){
  if(!['bicycle','motorbike'].includes(id)) return 0;
  const eff=personalAssetEfficiency(state,id);
  return eff===0?2:eff<.75?1:0;
}
function wearActiveTransport(state,amount=2){
  if(typeof personalFinanceUnlocked!=='function'||!personalFinanceUnlocked(state)) return;
  const id=state.finance?.transport;
  if(['bicycle','motorbike'].includes(id)) wearPersonalAsset(state,id,amount);
}
function personalAssetStudyBonus(state){
  if(!personalAssetUsable(state,'study_desk')) return {learning:0,fatigue:0};
  const eff=personalAssetEfficiency(state,'study_desk');
  return {learning:Math.max(1,Math.round(3*eff)),fatigue:eff>=.75?-1:0};
}
function personalAssetRestBonus(state){
  if(!personalAssetUsable(state,'comfort_bed')) return 0;
  return Math.max(2,Math.round(6*personalAssetEfficiency(state,'comfort_bed')));
}
function personalAssetMechanicBonus(state){
  if(!personalAssetUsable(state,'mechanic_toolkit')) return {payoutMultiplier:1,fatigue:0,xp:0};
  const eff=personalAssetEfficiency(state,'mechanic_toolkit');
  return {payoutMultiplier:1+(eff>=.75?.08:.03),fatigue:eff>=.75?-1:0,xp:eff>=.75?2:1};
}
function personalAssetTechBonus(state){
  if(!personalAssetUsable(state,'laptop')) return {payoutMultiplier:1,usable:false};
  const eff=personalAssetEfficiency(state,'laptop');
  return {payoutMultiplier:1+(eff>=.75?.06:.02),usable:true};
}
function personalAssetsSnapshot(state){
  syncPersonalAssets(state);
  return Object.values(PERSONAL_ASSETS).filter(def=>personalAssetUnlocked(state,def.id)||personalAssetOwned(state,def.id)).map(def=>{
    const item=state.assets.inventory[def.id],owned=!!item?.owned;
    return {...def,owned,condition:owned?item.condition:0,conditionLabel:personalAssetConditionLabel(state,def.id),tone:owned?personalAssetTone(state,def.id):'neutral',maintenanceCost:personalAssetMaintenanceCost(state,def.id),usable:owned&&item.condition>0};
  });
}
