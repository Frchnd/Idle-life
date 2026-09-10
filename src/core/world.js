const WORLD_STEP_HOURS=7*24;

function clamp(value,min=0,max=100){ return Math.max(min,Math.min(max,value)); }
function fract(value){ return value-Math.floor(value); }
function noise(step,salt){ return fract(Math.sin((step+1)*12.9898+salt*78.233)*43758.5453); }
function move(current,target,maxStep){
  const delta=Math.max(-maxStep,Math.min(maxStep,target-current));
  return clamp(current+delta);
}

function ensureWorldState(state){
  state.world=state.world||{};
  state.world.lastSimulatedAt=Number.isFinite(state.world.lastSimulatedAt)?state.world.lastSimulatedAt:0;
  state.world.week=Number.isFinite(state.world.week)?state.world.week:0;
  state.world.economy=Number.isFinite(state.world.economy)?state.world.economy:52;
  state.world.costIndex=Number.isFinite(state.world.costIndex)?state.world.costIndex:100;
  state.world.jobMarket=Number.isFinite(state.world.jobMarket)?state.world.jobMarket:50;
  state.world.sectors={mechanics:54,retail:50,technology:56,...(state.world.sectors||{})};
  state.world.phase=state.world.phase||phaseFromEconomy(state.world.economy).id;
  state.world.news=Array.isArray(state.world.news)?state.world.news:[];
  state.world.lastOpportunityWeek=state.world.lastOpportunityWeek||{};
  const competitorDefaults={
    mechanics:{name:'Servis Prima',strength:52,reputation:50,action:'stabil',lastActionWeek:0},
    retail:{name:'PromoKita Lokal',strength:50,reputation:48,action:'stabil',lastActionWeek:0},
    technology:{name:'Klik Cepat Digital',strength:55,reputation:54,action:'stabil',lastActionWeek:0}
  };
  state.world.competitors=state.world.competitors||{};
  for(const [sector,base] of Object.entries(competitorDefaults)) state.world.competitors[sector]={...base,...(state.world.competitors[sector]||{})};
  const workplaceDefaults={
    sinar_jaya:{health:58,staffing:52,pressure:52,status:'stabil',revenueIndex:56,margin:6,cashReserve:58,headcount:8,lastStaffActionWeek:-99},
    serba_ada:{health:56,staffing:54,pressure:48,status:'stabil',revenueIndex:52,margin:4,cashReserve:55,headcount:16,lastStaffActionWeek:-99},
    nusa_komputer:{health:60,staffing:50,pressure:56,status:'stabil',revenueIndex:60,margin:8,cashReserve:62,headcount:7,lastStaffActionWeek:-99}
  };
  state.world.workplaces=state.world.workplaces||{};
  for(const [id,base] of Object.entries(workplaceDefaults)){
    state.world.workplaces[id]={...base,...(state.world.workplaces[id]||{})};
  }

  for(const [id,base] of Object.entries({rian:0,dika:0,maya:0,nadia:0})){
    if(state.npc?.[id] && !Number.isFinite(state.npc[id].progress)) state.npc[id].progress=base;
  }
  return state.world;
}

function phaseFromEconomy(value){
  if(value<34) return {id:'lesu',label:'Lesu'};
  if(value<46) return {id:'melambat',label:'Melambat'};
  if(value<64) return {id:'stabil',label:'Stabil'};
  if(value<76) return {id:'ramai',label:'Ramai'};
  return {id:'panas',label:'Sangat ramai'};
}

function demandLabel(value){
  if(value<35) return 'Lemah';
  if(value<48) return 'Agak sepi';
  if(value<64) return 'Normal';
  if(value<78) return 'Tinggi';
  return 'Sangat tinggi';
}

function costTrendLabel(index){
  if(index<96) return 'Lebih murah';
  if(index<104) return 'Stabil';
  if(index<112) return 'Mulai mahal';
  return 'Mahal';
}

function workplaceStatus(value){
  if(value<34) return {id:'tertekan',label:'Tertekan'};
  if(value<47) return {id:'rentan',label:'Rentan'};
  if(value<64) return {id:'stabil',label:'Stabil'};
  if(value<78) return {id:'tumbuh',label:'Tumbuh'};
  return {id:'ekspansi',label:'Ekspansi'};
}

function pressureLabel(value){
  if(value<40) return 'Longgar';
  if(value<62) return 'Normal';
  if(value<76) return 'Sibuk';
  return 'Berat';
}

function companyCashflowLabel(margin){
  if(margin<-5) return 'Rugi berat';
  if(margin<1) return 'Rugi tipis';
  if(margin<7) return 'Tipis';
  if(margin<14) return 'Sehat';
  return 'Sangat sehat';
}

function employmentRiskLabel(company){
  if(!company) return 'Tidak diketahui';
  if(company.health<34 || company.cashReserve<24) return 'Tinggi';
  if(company.health<47 || company.cashReserve<38) return 'Waspada';
  if(company.health>=70 && company.margin>=8) return 'Rendah';
  return 'Normal';
}

const WORKPLACE_META={
  sinar_jaya:{name:'Bengkel Sinar Jaya',sector:'mechanics'},
  serba_ada:{name:'Toko Serba Ada',sector:'retail'},
  nusa_komputer:{name:'Nusa Komputer',sector:'technology'}
};

function workplaceIdFromState(state){
  const name=state.player?.workplace||'';
  if(name.includes('Sinar Jaya')) return 'sinar_jaya';
  if(name.includes('Serba Ada')) return 'serba_ada';
  if(name.includes('Nusa Komputer')) return 'nusa_komputer';
  return null;
}

function workplaceSnapshot(state,id){
  ensureWorldState(state);
  const w=state.world.workplaces?.[id];
  if(!w) return null;
  return {...w,id,name:WORKPLACE_META[id]?.name||id,label:workplaceStatus(w.health).label};
}

function currentWorkplaceSnapshot(state){
  const id=workplaceIdFromState(state);
  return id?workplaceSnapshot(state,id):null;
}

function companyCanPromote(state,id){
  const company=workplaceSnapshot(state,id);
  return !company || company.health>=42;
}

function sectorDemand(state,sector){
  ensureWorldState(state);
  return state.world.sectors?.[sector]??50;
}

function sectorMultiplier(state,sector){
  const demand=sectorDemand(state,sector);
  return Math.max(.86,Math.min(1.22,.8+demand*.004));
}

function pushWorldNews(state,text){
  state.world.news.unshift(text);
  state.world.news=state.world.news.slice(0,4);
}

function maybeWorldOpportunity(state,sector,demand){
  if(demand<66) return;
  if(state.world.lastOpportunityWeek[sector]===state.world.week) return;
  const skillMap={mechanics:'mechanics',retail:'social',technology:'technology'};
  const skill=skillMap[sector];
  if((state.skills?.[skill]||0)<100) return;

  if(sector==='mechanics' && !state.opportunities.some(x=>x.id==='market_repair')){
    addOpportunity(state,{id:'market_repair',name:'Lonjakan Servis Lokal',summary:'4j · bayaran mengikuti permintaan bengkel · diperebutkan',expireAt:state.time.totalHours+72,...contestedMeta(state,'mechanics')});
    pushWorldNews(state,'Permintaan servis kendaraan sedang naik di sekitar kota.');
    state.world.lastOpportunityWeek[sector]=state.world.week;
  }
  if(sector==='retail' && !state.opportunities.some(x=>x.id==='market_promo')){
    addOpportunity(state,{id:'market_promo',name:'Shift Event Ramai',summary:'4j · kerja sosial · bayaran mengikuti kondisi retail · diperebutkan',expireAt:state.time.totalHours+72,...contestedMeta(state,'retail')});
    pushWorldNews(state,'Toko dan event lokal sedang mencari pekerja tambahan.');
    state.world.lastOpportunityWeek[sector]=state.world.week;
  }
  if(sector==='technology' && !state.opportunities.some(x=>x.id==='market_tech')){
    addOpportunity(state,{id:'market_tech',name:'Permintaan Setup Digital',summary:'4j · kerja Teknologi · bayaran mengikuti pasar · diperebutkan',expireAt:state.time.totalHours+72,...contestedMeta(state,'technology')});
    pushWorldNews(state,'Usaha kecil di sekitar kota sedang ramai melakukan setup digital.');
    state.world.lastOpportunityWeek[sector]=state.world.week;
  }
}


function competitorActionLabel(action){
  return {stabil:'Menjaga posisi',harga:'Harga agresif',kualitas:'Fokus kualitas',ekspansi:'Sedang ekspansi'}[action]||'Menjaga posisi';
}

function competitorSnapshot(state,sector){
  ensureWorldState(state);
  const c=state.world.competitors?.[sector];
  if(!c) return null;
  return {...c,actionLabel:competitorActionLabel(c.action)};
}

function simulateCompetitors(state){
  const w=ensureWorldState(state);
  for(const sector of ['mechanics','retail','technology']){
    const c=w.competitors[sector];
    const demand=w.sectors[sector]??50;
    const roll=noise(w.week,sector.length+21);
    const oldAction=c.action||'stabil';
    let action='stabil';
    if(roll<.24) action='harga';
    else if(roll<.49) action='kualitas';
    else if(roll<.70) action='ekspansi';
    c.action=action;
    c.lastActionWeek=w.week;
    let npcBoost=0;
    if(sector==='mechanics' && state.npc?.dika?.life==='kepala_mekanik') npcBoost=4;
    if(sector==='retail' && state.npc?.maya?.life==='manajer_cabang') npcBoost=2;
    if(sector==='technology' && state.npc?.nadia?.life==='lead_teknisi') npcBoost=4;
    const actionBoost=action==='ekspansi'?5:action==='kualitas'?3:action==='harga'?2:0;
    const target=Math.max(30,Math.min(86,43+demand*.24+w.economy*.10+npcBoost+actionBoost+(noise(w.week,sector.length+31)-.5)*8));
    c.strength=Math.round(move(c.strength,target,6));
    c.reputation=Math.round(move(c.reputation,Math.max(30,Math.min(88,c.strength+(action==='kualitas'?5:0)-(action==='harga'?2:0))),4));

    const b=state.business;
    if(b?.active && b.sector===sector && action!=='stabil' && w.week-(b.lastMarketEventWeek??-99)>=2 && !b.marketEventPending){
      b.marketEventPending={action,competitor:c.name,week:w.week};
      b.lastMarketEventWeek=w.week;
    }
    if(oldAction!==action && b?.active && b.sector===sector){
      pushWorldNews(state,`${c.name} mengubah gerak pasar: ${competitorActionLabel(action).toLowerCase()}.`);
    }
  }
}

function progressNpc(state,id,amount){
  if(!state.npc?.[id]) return 0;
  state.npc[id].progress=(state.npc[id].progress||0)+amount;
  return state.npc[id].progress;
}

function simulateWorkplaces(state){
  const w=ensureWorldState(state);
  const configs={
    sinar_jaya:{sector:'mechanics',healthBias:1,staffBias:-1,baseHeadcount:8},
    serba_ada:{sector:'retail',healthBias:0,staffBias:2,baseHeadcount:16},
    nusa_komputer:{sector:'technology',healthBias:4,staffBias:-2,baseHeadcount:7}
  };
  for(const [id,cfg] of Object.entries(configs)){
    const company=w.workplaces[id];
    const demand=w.sectors[cfg.sector]??50;
    const oldStatus=company.status||workplaceStatus(company.health).id;
    const oldHeadcount=company.headcount||cfg.baseHeadcount;

    company.revenueIndex=Math.round(clamp(48+(demand-50)*.72+(w.economy-50)*.30+(noise(w.week,id.length)-.5)*8,24,92));
    const payrollPressure=((company.headcount||cfg.baseHeadcount)-cfg.baseHeadcount)*1.15;
    company.margin=Math.round(clamp((company.revenueIndex-48)*.34-payrollPressure-(company.pressure>72?2:0),-14,22)*10)/10;
    company.cashReserve=Math.round(clamp((company.cashReserve??55)+company.margin*.42,8,92));

    const healthTarget=clamp(48+cfg.healthBias+(demand-50)*.48+(w.economy-50)*.22+(company.cashReserve-50)*.18,20,90);
    company.health=Math.round(move(company.health,healthTarget,7));

    const staffingTarget=clamp(52+cfg.staffBias+(w.jobMarket-50)*.28-(demand-50)*.18+((company.headcount||cfg.baseHeadcount)-cfg.baseHeadcount)*3,28,80);
    company.staffing=Math.round(move(company.staffing,staffingTarget,6));
    company.pressure=Math.round(clamp(48+(demand-50)*.72-(company.staffing-50)*.50+(62-company.health)*.20,24,90));
    company.status=workplaceStatus(company.health).id;

    const canChangeStaff=(company.lastStaffActionWeek??-99)<=w.week-2;
    if(canChangeStaff && company.margin<=-5 && company.cashReserve<34 && (company.headcount||cfg.baseHeadcount)>Math.max(4,cfg.baseHeadcount-4)){
      company.headcount=Math.max(4,(company.headcount||cfg.baseHeadcount)-1);
      company.lastStaffActionWeek=w.week;
      company.cashReserve=clamp(company.cashReserve+4,8,92);
      pushWorldNews(state,`${WORKPLACE_META[id].name} mengurangi satu posisi untuk menahan biaya.`);
      if(workplaceIdFromState(state)===id){
        state.scheduled.push({at:state.time.totalHours+8,kind:'job_restructure',workplace:id});
      }
    }else if(canChangeStaff && company.margin>=9 && company.health>=70 && demand>=64 && (company.headcount||cfg.baseHeadcount)<cfg.baseHeadcount+5){
      company.headcount=(company.headcount||cfg.baseHeadcount)+1;
      company.lastStaffActionWeek=w.week;
      company.cashReserve=clamp(company.cashReserve-3,8,92);
      pushWorldNews(state,`${WORKPLACE_META[id].name} menambah satu posisi karena permintaan sedang kuat.`);
    }

    if(oldStatus!==company.status){
      const meta=WORKPLACE_META[id];
      pushWorldNews(state,`${meta.name} sekarang berada dalam kondisi ${workplaceStatus(company.health).label.toLowerCase()}.`);
    }
    if(oldHeadcount!==company.headcount){
      company.staffing=Math.round(clamp(company.staffing+(company.headcount-oldHeadcount)*4,20,84));
    }
  }
}

function competitionName(state,sector){
  if(sector==='mechanics' && state.npc?.dika?.known) return {name:'Dika',npc:'dika'};
  if(sector==='retail' && state.npc?.rian?.life!=='koordinator_logistik') return {name:'Rian',npc:'rian'};
  if(sector==='technology' && state.npc?.nadia?.known) return {name:'Nadia',npc:'nadia'};
  return {name:'orang lain',npc:null};
}

function contestedMeta(state,sector){
  const rival=competitionName(state,sector);
  return {contested:true,claimAt:state.time.totalHours+36,competitor:rival.name,competitorNpc:rival.npc};
}

function resolveContestedOpportunities(state){
  const claimed=[];
  state.opportunities=state.opportunities.filter(op=>{
    if(!op.contested || !op.claimAt || op.claimAt>state.time.totalHours) return true;
    claimed.push(op);
    return false;
  });
  for(const op of claimed){
    if(op.competitorNpc && state.npc?.[op.competitorNpc]){
      state.npc[op.competitorNpc].progress=(state.npc[op.competitorNpc].progress||0)+1.5;
    }
    const who=op.competitor||'orang lain';
    addRecent(state,`${who} mengambil peluang “${op.name}” sebelum kamu sempat mengambilnya.`);
    pushWorldNews(state,`Peluang kerja tidak selalu menunggumu; ${who} baru saja mengambil salah satunya.`);
  }
  return claimed.length;
}

function maybeExpansionCareerOpportunity(state,id){
  const company=workplaceSnapshot(state,id);
  if(!company || company.health<72 || company.pressure<55 || state.world.jobMarket<54) return;
  const map={
    sinar_jaya:{skill:'mechanics',opp:'career_mechanic',name:'Lowongan Ekspansi Bengkel',summary:'Jalur Mekanik · Sinar Jaya sedang tumbuh',sector:'mechanics'},
    serba_ada:{skill:'social',opp:'career_store',name:'Lowongan Cabang Ramai',summary:'Jalur Pelayanan · kebutuhan staf sedang naik',sector:'retail'},
    nusa_komputer:{skill:'technology',opp:'career_it',name:'Lowongan Teknologi Baru',summary:'Jalur Teknologi · Nusa Komputer sedang ekspansi',sector:'technology'}
  };
  const cfg=map[id];
  if(!cfg || (state.skills?.[cfg.skill]||0)<100) return;
  if(state.opportunities.some(x=>x.id===cfg.opp)) return;
  if(workplaceIdFromState(state)===id) return;
  addOpportunity(state,{id:cfg.opp,name:cfg.name,summary:cfg.summary,expireAt:state.time.totalHours+72,contested:true,claimAt:state.time.totalHours+48,competitor:'pelamar lain',competitorNpc:null});
  pushWorldNews(state,`${company.name} membuka posisi baru karena aktivitas usahanya meningkat.`);
}

function simulateNpcLives(state){
  const w=state.world;

  const rian=progressNpc(state,'rian',1.2+w.jobMarket/42);
  if(state.npc.rian.life==='serabutan' && rian>=5.5){
    state.npc.rian.life='kurir';
    addRecent(state,'Rian mendapat pekerjaan tetap sebagai kurir tanpa menunggumu.');
    pushWorldNews(state,'Pasar kerja membaik cukup untuk membuka lebih banyak pekerjaan operasional.');
  }else if(state.npc.rian.life==='kurir' && rian>=14 && w.jobMarket>=56){
    state.npc.rian.life='koordinator_logistik';
    addRecent(state,'Rian dipercaya membantu mengatur rute dan pekerja kurir lain.');
  }

  if(state.npc.dika?.known){
    const dika=progressNpc(state,'dika',1+w.sectors.mechanics/38);
    if(state.npc.dika.life==='sinar_jaya' && dika>=8.5 && w.sectors.mechanics>=58){
      state.npc.dika.life='bengkel_lain';
      state.flags.dikaMoveSeen=true;
      state.flags.dikaLeftWorkshop=true;
      addRecent(state,'Dika menerima tawaran dari bengkel lain saat permintaan mekanik sedang tinggi.');
    }else if(state.npc.dika.life==='bengkel_lain' && dika>=18){
      state.npc.dika.life='kepala_mekanik';
      addRecent(state,'Dika sekarang memimpin pekerjaan mekanik di bengkel barunya.');
    }
  }

  if(state.npc.maya?.known){
    const maya=progressNpc(state,'maya',1+w.sectors.retail/40);
    if(state.npc.maya.life==='supervisor' && maya>=9.5 && w.sectors.retail>=54){
      state.npc.maya.life='manajer_cabang';
      state.flags.mayaProgressSeen=true;
      addRecent(state,'Mira dipindahkan untuk membantu mengelola cabang yang lebih sibuk.');
    }
  }

  if(state.npc.nadia?.known){
    const nadia=progressNpc(state,'nadia',1+w.sectors.technology/36);
    if(state.npc.nadia.life==='teknisi_senior' && nadia>=9.5 && w.sectors.technology>=60){
      state.npc.nadia.life='lead_teknisi';
      addRecent(state,'Nadia dipercaya memimpin beberapa teknisi junior di Nusa Komputer.');
    }
  }
}

function simulateWeek(state){
  const w=ensureWorldState(state);
  w.week+=1;
  const n=w.week;
  const oldPhase=w.phase;

  const cycle=52+17*Math.sin(n/2.8)+(noise(n,1)-.5)*14;
  w.economy=Math.round(move(w.economy,clamp(cycle,24,82),8));

  const mechTarget=54+(50-w.economy)*.18+(noise(n,2)-.5)*18;
  const retailTarget=46+(w.economy-45)*.65+(noise(n,3)-.5)*15;
  const techTarget=55+Math.min(18,n*.7)+(w.economy-50)*.24+(noise(n,4)-.5)*14;
  w.sectors.mechanics=Math.round(move(w.sectors.mechanics,clamp(mechTarget,30,82),9));
  w.sectors.retail=Math.round(move(w.sectors.retail,clamp(retailTarget,25,86),10));
  w.sectors.technology=Math.round(move(w.sectors.technology,clamp(techTarget,35,90),9));

  const jobTarget=(w.economy+w.sectors.retail+w.sectors.technology)/3+(noise(n,5)-.5)*8;
  w.jobMarket=Math.round(move(w.jobMarket,clamp(jobTarget,28,82),8));

  const costTarget=100+Math.max(-4,(w.economy-48)*.13)+Math.min(11,n*.35)+(noise(n,6)-.5)*3;
  w.costIndex=Math.round(Math.max(94,Math.min(118,move(w.costIndex,costTarget,2.5)))*10)/10;
  w.phase=phaseFromEconomy(w.economy).id;

  if(oldPhase!==w.phase){
    pushWorldNews(state,`Kondisi ekonomi berubah menjadi ${phaseFromEconomy(w.economy).label.toLowerCase()}.`);
  }

  simulateWorkplaces(state);
  simulateCompetitors(state);
  maybeWorldOpportunity(state,'mechanics',w.sectors.mechanics);
  maybeWorldOpportunity(state,'retail',w.sectors.retail);
  maybeWorldOpportunity(state,'technology',w.sectors.technology);
  maybeExpansionCareerOpportunity(state,'sinar_jaya');
  maybeExpansionCareerOpportunity(state,'serba_ada');
  maybeExpansionCareerOpportunity(state,'nusa_komputer');
  simulateNpcLives(state);
  simulateBusinessWeek(state);
}

function simulateWorld(state){
  const w=ensureWorldState(state);
  let steps=0;
  while(state.time.totalHours-w.lastSimulatedAt>=WORLD_STEP_HOURS && steps<52){
    w.lastSimulatedAt+=WORLD_STEP_HOURS;
    simulateWeek(state);
    steps++;
  }
  return steps;
}

function worldSnapshot(state){
  const w=ensureWorldState(state);
  return {
    phase:phaseFromEconomy(w.economy).label,
    economy:w.economy,
    costIndex:w.costIndex,
    costTrend:costTrendLabel(w.costIndex),
    jobMarket:demandLabel(w.jobMarket),
    mechanics:demandLabel(w.sectors.mechanics),
    retail:demandLabel(w.sectors.retail),
    technology:demandLabel(w.sectors.technology),
    workplaces:{
      sinar_jaya:workplaceSnapshot(state,'sinar_jaya'),
      serba_ada:workplaceSnapshot(state,'serba_ada'),
      nusa_komputer:workplaceSnapshot(state,'nusa_komputer')
    },
    competitors:{
      mechanics:competitorSnapshot(state,'mechanics'),
      retail:competitorSnapshot(state,'retail'),
      technology:competitorSnapshot(state,'technology')
    },
    news:[...w.news]
  };
}
