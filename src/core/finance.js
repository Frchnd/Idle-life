const FINANCE_INTERVAL_HOURS=30*24;

function ensureFinanceState(state){
  const base={
    unlocked:false,
    emergencyFund:0,
    lifestyle:'frugal',
    transport:'public',
    ownedTransport:['public'],
    lastLifestyleChangeAt:-9999,
    lastTransportChangeAt:-9999,
    lastEmergencyMoveAt:-9999,
    autoCoveredTotal:0
  };
  state.finance={...base,...(state.finance||{})};
  if(!LIFESTYLE_OPTIONS[state.finance.lifestyle]) state.finance.lifestyle='frugal';
  if(!TRANSPORT_OPTIONS[state.finance.transport]) state.finance.transport='public';
  if(!Array.isArray(state.finance.ownedTransport)) state.finance.ownedTransport=['public'];
  if(!state.finance.ownedTransport.includes('public')) state.finance.ownedTransport.unshift('public');
  state.finance.ownedTransport=[...new Set(state.finance.ownedTransport.filter(id=>TRANSPORT_OPTIONS[id]))];
  state.finance.emergencyFund=Math.max(0,Math.round(Number(state.finance.emergencyFund)||0));
  state.finance.unlocked=!!state.finance.unlocked;
  return state.finance;
}

function personalFinanceUnlocked(state){
  ensureFinanceState(state);
  return state.finance.unlocked || (state.career?.workCount||0)>=4 || (state.housing?.moves||0)>0;
}

function syncPersonalFinance(state){
  const f=ensureFinanceState(state);
  if(!f.unlocked && ((state.career?.workCount||0)>=4 || (state.housing?.moves||0)>0)){
    f.unlocked=true;
    if(typeof addRecent==='function') addRecent(state,'Keuangan pribadi mulai punya ritme sendiri: dana darurat, transportasi, dan gaya hidup sekarang bisa kamu atur.');
  }
  return f;
}

function currentLifestyle(state){ensureFinanceState(state);return LIFESTYLE_OPTIONS[state.finance.lifestyle]||LIFESTYLE_OPTIONS.frugal;}
function currentTransport(state){ensureFinanceState(state);return TRANSPORT_OPTIONS[state.finance.transport]||TRANSPORT_OPTIONS.public;}
function indexedFinanceCost(state,base){
  const idx=Math.max(80,Number(state.world?.costIndex)||100);
  return Math.round((base*idx/100)/10000)*10000;
}
function lifestyleMonthlyCost(state){return personalFinanceUnlocked(state)?indexedFinanceCost(state,currentLifestyle(state).monthlyCost):0;}
function transportMonthlyCost(state){return personalFinanceUnlocked(state)?indexedFinanceCost(state,currentTransport(state).monthlyCost):0;}
function monthlyBudgetBreakdown(state){
  const housing=typeof housingCurrentMonthlyCost==='function'?housingCurrentMonthlyCost(state):Math.max(0,state.economy?.livingCost||0);
  const lifestyle=lifestyleMonthlyCost(state);
  const transport=transportMonthlyCost(state);
  return {housing,lifestyle,transport,total:housing+lifestyle+transport};
}
function emergencyFundTarget(state){return Math.max(300000,monthlyBudgetBreakdown(state).total);}
function emergencyCoverageMonths(state){const total=Math.max(1,monthlyBudgetBreakdown(state).total);return ensureFinanceState(state).emergencyFund/total;}
function emergencyFundLabel(state){
  const months=emergencyCoverageMonths(state);
  if(months>=2) return 'Kuat';
  if(months>=1) return '1 bulan aman';
  if(months>=.5) return 'Mulai terbentuk';
  if(ensureFinanceState(state).emergencyFund>0) return 'Tipis';
  return 'Kosong';
}
function emergencyFundTone(state){const m=emergencyCoverageMonths(state);return m>=1?'positive':m>=.5?'info':state.finance.emergencyFund>0?'warning':'danger';}

function transportAssetEfficiency(state,transportId){
  if(typeof personalAssetTransportEfficiency==='function') return personalAssetTransportEfficiency(state,transportId);
  return 1;
}
function transportAssetFatiguePenalty(state,transportId){
  if(typeof personalAssetTravelFatiguePenalty==='function') return personalAssetTravelFatiguePenalty(state,transportId);
  return 0;
}
function effectiveWorkCommuteHours(state,workplaceId){
  const base=typeof housingCommuteHours==='function'?housingCommuteHours(state,workplaceId):0;
  const t=personalFinanceUnlocked(state)?currentTransport(state):TRANSPORT_OPTIONS.public;
  const reduction=(t.commuteReduction||0)*transportAssetEfficiency(state,t.id);
  return Math.max(0,base-reduction);
}
function financeCommuteForHousingMeta(state,meta,workplaceId){
  const base=Math.max(0,Number(meta?.commute?.[workplaceId]||0));
  const t=personalFinanceUnlocked(state)?currentTransport(state):TRANSPORT_OPTIONS.public;
  const reduction=(t.commuteReduction||0)*transportAssetEfficiency(state,t.id);
  return Math.max(0,base-reduction);
}
function effectiveCityTravel(state,locationId){
  const raw=typeof housingCityTravel==='function'?housingCityTravel(state,locationId):{extraHours:0,extraCost:0};
  if(!personalFinanceUnlocked(state)) return {...raw,travelFatigue:0};
  const t=currentTransport(state);
  const eff=transportAssetEfficiency(state,t.id);
  const extraHours=Math.max(0,(raw.extraHours||0)-(t.cityReduction||0)*eff);
  let extraCost=0;
  if(t.id==='public') extraCost=typeof idTravelCost==='function'?idTravelCost(extraHours):raw.extraCost||0;
  else if(t.id==='motorbike' && (raw.extraHours||0)>0) extraCost=5000;
  const wearPenalty=transportAssetFatiguePenalty(state,t.id);
  return {extraHours,extraCost,travelFatigue:(raw.extraHours||0)>0?(t.travelFatigue||0)+wearPenalty:0};
}
function lifestyleRestBonus(state){return personalFinanceUnlocked(state)?currentLifestyle(state).restBonus:0;}
function lifestyleStudyFatigueModifier(state){return personalFinanceUnlocked(state)?currentLifestyle(state).studyFatigue:0;}
function lifestyleWorkFatigueModifier(state){return personalFinanceUnlocked(state)?currentLifestyle(state).workFatigue:0;}
function lifestyleCitySocialBonus(state){return personalFinanceUnlocked(state)?currentLifestyle(state).citySocialBonus:0;}

function financeChangeCooldownLeft(state,type){
  ensureFinanceState(state);
  const key=type==='lifestyle'?'lastLifestyleChangeAt':'lastTransportChangeAt';
  const changedAt=Number.isFinite(state.finance[key])?state.finance[key]:-9999;
  const elapsed=state.time.totalHours-changedAt;
  return Math.max(0,FINANCE_INTERVAL_HOURS-elapsed);
}
function changeLifestyle(state,id){
  syncPersonalFinance(state);
  if(!state.finance.unlocked) return {error:'Keuangan pribadi belum terbuka.'};
  const option=LIFESTYLE_OPTIONS[id];
  if(!option) return {error:'Pilihan gaya hidup tidak dikenal.'};
  if(state.finance.lifestyle===id) return {error:'Itu sudah menjadi gaya hidupmu saat ini.'};
  const left=financeChangeCooldownLeft(state,'lifestyle');
  if(left>0) return {error:`Gaya hidup baru bisa diubah lagi sekitar ${Math.ceil(left/24)} hari lagi.`};
  state.finance.lifestyle=id;
  state.finance.lastLifestyleChangeAt=state.time.totalHours;
  if(typeof addRecent==='function') addRecent(state,`Gaya hidup berubah menjadi ${option.name}. Biaya rutin dan kenyamanan harian ikut berubah.`);
  return `Gaya hidup sekarang ${option.name}.`;
}
function selectTransport(state,id){
  syncPersonalFinance(state);
  if(!state.finance.unlocked) return {error:'Keuangan pribadi belum terbuka.'};
  const option=TRANSPORT_OPTIONS[id];
  if(!option) return {error:'Pilihan transportasi tidak dikenal.'};
  if(state.finance.transport===id) return {error:'Transportasi itu sudah kamu gunakan.'};
  const owned=state.finance.ownedTransport.includes(id);
  if(!owned){
    if(state.player.money<option.purchaseCost) return {error:`Butuh Rp${option.purchaseCost.toLocaleString('id-ID')} untuk membeli ${option.name}.`};
    state.player.money-=option.purchaseCost;
    state.finance.ownedTransport.push(id);
    if(typeof addHistory==='function') addHistory(state,`Umur 18 · Membeli ${option.name} untuk mobilitas sehari-hari.`);
  }else{
    const left=financeChangeCooldownLeft(state,'transport');
    if(left>0) return {error:`Pilihan transportasi baru bisa diganti lagi sekitar ${Math.ceil(left/24)} hari lagi.`};
  }
  state.finance.transport=id;
  state.finance.lastTransportChangeAt=state.time.totalHours;
  if(typeof addRecent==='function') addRecent(state,`${option.name} sekarang menjadi pilihan transportasi utama.`);
  return owned?`Sekarang kamu menggunakan ${option.name}.`:`${option.name} dibeli dan langsung kamu gunakan.`;
}
function moveEmergencyFund(state,amount){
  syncPersonalFinance(state);
  if(!state.finance.unlocked) return {error:'Keuangan pribadi belum terbuka.'};
  const value=Math.round(Number(amount)||0);
  if(value===0) return {error:'Nominal dana darurat tidak valid.'};
  if(value>0){
    if(state.player.money<value) return {error:'Uang tunai belum cukup untuk disisihkan.'};
    state.player.money-=value;
    state.finance.emergencyFund+=value;
    state.finance.lastEmergencyMoveAt=state.time.totalHours;
    if(typeof addRecent==='function') addRecent(state,`Rp${value.toLocaleString('id-ID')} dipindahkan ke dana darurat.`);
    return `Dana darurat bertambah Rp${value.toLocaleString('id-ID')}.`;
  }
  const take=Math.min(state.finance.emergencyFund,Math.abs(value));
  if(take<=0) return {error:'Dana darurat masih kosong.'};
  state.finance.emergencyFund-=take;
  state.player.money+=take;
  state.finance.lastEmergencyMoveAt=state.time.totalHours;
  if(typeof addRecent==='function') addRecent(state,`Rp${take.toLocaleString('id-ID')} ditarik dari dana darurat.`);
  return `Rp${take.toLocaleString('id-ID')} kembali menjadi uang tunai.`;
}
function withdrawAllEmergencyFund(state){
  ensureFinanceState(state);
  const amount=state.finance.emergencyFund;
  if(amount<=0) return {error:'Dana darurat masih kosong.'};
  return moveEmergencyFund(state,-amount);
}
function coverMonthlyShortfallFromEmergency(state,total){
  ensureFinanceState(state);
  const cashAvailable=Math.max(0,state.player.money);
  const shortage=Math.max(0,total-cashAvailable);
  const used=Math.min(shortage,state.finance.emergencyFund);
  if(used>0){
    state.finance.emergencyFund-=used;
    state.finance.autoCoveredTotal=(state.finance.autoCoveredTotal||0)+used;
  }
  state.player.money-=Math.max(0,total-used);
  return used;
}
function personalFinanceSnapshot(state){
  syncPersonalFinance(state);
  const f=ensureFinanceState(state),breakdown=monthlyBudgetBreakdown(state),target=emergencyFundTarget(state);
  return {
    unlocked:f.unlocked,
    emergencyFund:f.emergencyFund,
    emergencyTarget:target,
    emergencyPct:Math.min(100,Math.round(f.emergencyFund/Math.max(1,target)*100)),
    emergencyLabel:emergencyFundLabel(state),
    emergencyTone:emergencyFundTone(state),
    breakdown,
    lifestyle:currentLifestyle(state),
    transport:currentTransport(state),
    lifestyleChoices:Object.values(LIFESTYLE_OPTIONS).map(x=>({...x,current:x.id===f.lifestyle,cost:indexedFinanceCost(state,x.monthlyCost),cooldownLeft:financeChangeCooldownLeft(state,'lifestyle')})),
    transportChoices:Object.values(TRANSPORT_OPTIONS).map(x=>({...x,current:x.id===f.transport,owned:f.ownedTransport.includes(x.id),cost:indexedFinanceCost(state,x.monthlyCost),cooldownLeft:financeChangeCooldownLeft(state,'transport')}))
  };
}
