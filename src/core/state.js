const SAVE_VERSION = 15;

function createInitialState(){
  return {
    version:SAVE_VERSION,
    player:{
      name:'Fernando',
      money:500000,
      fatigue:10,
      job:null,
      workplace:null,
      salary:0,
      statuses:['tinggal_bersama_keluarga']
    },
    time:{totalHours:0},
    economy:{lastLivingCostAt:0,livingCost:600000,baseLivingCost:600000},
    world:{lastSimulatedAt:0,week:0,economy:52,costIndex:100,jobMarket:50,sectors:{mechanics:54,retail:50,technology:56},phase:'stabil',news:[],lastOpportunityWeek:{},workplaces:{sinar_jaya:{health:58,staffing:52,pressure:52,status:'stabil',revenueIndex:56,margin:6,cashReserve:58,headcount:8,lastStaffActionWeek:-99},serba_ada:{health:56,staffing:54,pressure:48,status:'stabil',revenueIndex:52,margin:4,cashReserve:55,headcount:16,lastStaffActionWeek:-99},nusa_komputer:{health:60,staffing:50,pressure:56,status:'stabil',revenueIndex:60,margin:8,cashReserve:62,headcount:7,lastStaffActionWeek:-99}},competitors:{mechanics:{name:'Servis Prima',strength:52,reputation:50,action:'stabil',lastActionWeek:0},retail:{name:'PromoKita Lokal',strength:50,reputation:48,action:'stabil',lastActionWeek:0},technology:{name:'Klik Cepat Digital',strength:55,reputation:54,action:'stabil',lastActionWeek:0}}},
    housing:{id:'family_home',label:'Bersama keluarga',monthlyCost:600000,movedAt:null},
    life:{trajectory:'open',majorDecisionAt:null,outcomeAt:null},
    pacing:{lastResolvedEventAt:-999,lastSurfacedEventAt:-999,eventCount:0,minGapHours:8},
    playtest:{actions:0,opportunitiesTaken:0,careerChanges:0,offlineBatches:0},
    contentRuntime:{eventHistory:[],eventCooldowns:{},poolHistory:{},poolRecent:{},rngSeed:137,enabledPacks:[],packVersions:{}},
    skills:{mechanics:0,learning:25,social:40,technology:0},
    discoveredSkills:['mechanics','learning','social'],
    relationships:{family:60,rian:35,pak_arman:0,dika:0,maya:0,nadia:0,ari:0},
    npc:{
      rian:{known:true,life:'serabutan',progress:0},
      pak_arman:{known:false,life:'pemilik_bengkel',progress:0},
      dika:{known:false,rivalry:10,life:'sinar_jaya',progress:0},
      maya:{known:false,life:'supervisor',progress:0},
      nadia:{known:false,life:'teknisi_senior',progress:0},
      ari:{known:false,life:'belum_terlibat',progress:0}
    },
    assets:{laptop:false},
    business:{active:false,sector:null,name:null,level:0,reputation:0,marketReputation:0,clients:0,lastManagedAt:0,lastWeeklyProfit:0,totalProfit:0,lossStreak:0,startedAt:null,equipmentLevel:0,retainedClients:0,capacity:2,inquiries:0,servedClients:0,missedDemand:0,growthStreak:0,reinvestments:0,lastReinvestOfferAt:-999,lastConflictAt:-999,lastRetainerAt:-999,scale:'solo',helperActive:false,helperName:'Ari',helperTrust:40,helperSkill:35,helperWage:220000,helperWeeks:0,delegated:false,ownerFullTime:false,lastScaleDecisionAt:-999,lastDelegationDecisionAt:-999,lastOwnerChoiceAt:-999,lastHelperIssueAt:-999,helperIssuePending:false,competitorPressure:50,marketStrategy:'balanced',strategyUntilWeek:0,lastMarketEventWeek:-99,marketEventPending:null,clientsWon:0,clientsLost:0,marketWinStreak:0,marketLossStreak:0},
    career:{
      workCount:0,
      jobSearchCount:0,
      promotionProgress:0,
      storeProgress:0,
      techProgress:0,
      changeSearchCount:0,
      changeHandledCount:0,
      sideIncomeTotal:0,
      salaryNegotiated:false,
      salaryNegotiatedJobs:[],
      restructureCount:0,
      jobWorkCounts:{mechanic_junior:0,mechanic_senior:0,store_clerk:0,store_supervisor:0,it_assistant:0}
    },
    flags:{
      workshopOfferSeen:false,
      storeOfferSeen:false,
      firstWorkshopDay:false,
      firstStoreDay:false,
      firstTechDay:false,
      dikaHelpSeen:false,
      helpedDika:false,
      difficultRepairSeen:false,
      storeCustomerSeen:false,
      storeRushSeen:false,
      storePromotionTalkSeen:false,
      storePromoted:false,
      techCourseSeen:false,
      techSideJobSeen:false,
      techJobSeen:false,
      techDeadlineSeen:false,
      privateIntroSeen:false,
      promotionTalkSeen:false,
      promoted:false,
      crossStoreTechSeen:false,
      crossMechanicSocialSeen:false,
      moneyPressureSeen:false,
      routineUnlocked:false,
      milestoneShown:false,
      exhaustedWarningSeen:false,
      laptopOfferSeen:false,
      firstTechFreelanceSeen:false,
      firstPromoSideSeen:false,
      rianJobUpdateSeen:false,
      dikaMoveSeen:false,
      dikaLeftWorkshop:false,
      mayaProgressSeen:false,
      familyDebtRepaySeen:false,
      rianDebtRepaySeen:false,
      housingOfferSeen:false,
      housingRevisitSeen:false,
      movedOut:false,
      moveReflectionSeen:false,
      familyMilestoneSeen:false,
      familySupport:false,
      rianMilestoneSeen:false,
      rianTrusted:false,
      trajectoryChoiceSeen:false,
      rentPressureSeen:false,
      verticalSliceComplete:false,
      mechanicPromotionFrozenSeen:false,
      storePromotionFrozenSeen:false,
      workplaceShockSeen:false,
      salaryTalkSeen:false,
      businessPathSeen:false,
      businessStarted:false,
      firstBusinessCycleSeen:false,
      businessRetainerSeen:false,
      businessCapacitySeen:false,
      businessConflictSeen:false,
      businessScaleSeen:false,
      businessDelegationSeen:false,
      businessOwnerChoiceSeen:false,
      businessHelperIssueSeen:false,
      businessMarketSeen:false
    },
    opportunities:[],
    scheduled:[],
    pendingEvent:null,
    recent:[],
    history:['Umur 18 · Memulai hidup tanpa pekerjaan tetap.'],
    routine:{enabled:false,freeTime:'study'},
    lastSeen:Date.now()
  };
}

const skillTiers=[
  {id:'novice',label:'Pemula',min:0},
  {id:'basic',label:'Dasar',min:100},
  {id:'skilled',label:'Terampil',min:300},
  {id:'experienced',label:'Berpengalaman',min:700},
  {id:'expert',label:'Ahli',min:1500}
];

function getSkillTier(xp){
  let out=skillTiers[0];
  for(const tier of skillTiers){ if(xp>=tier.min) out=tier; }
  return out;
}

function getCondition(fatigue){
  if(fatigue>=70) return {id:'exhausted',label:'Kelelahan'};
  if(fatigue>=30) return {id:'tired',label:'Lelah'};
  return {id:'good',label:'Baik'};
}

function relationshipLabel(value){
  if(value>=80) return 'Sangat percaya';
  if(value>=50) return 'Dekat';
  if(value>=20) return 'Bersahabat';
  if(value>=-19) return 'Netral';
  if(value>=-59) return 'Dingin';
  return 'Bermusuhan';
}

function financialState(state){
  const money=state.player.money;
  if(money<0) return {id:'debt',label:'Berutang'};
  if(money<250000) return {id:'tight',label:'Seret'};
  if(money>=3000000) return {id:'comfortable',label:'Nyaman'};
  return {id:'stable',label:'Stabil'};
}

function housingLabel(state){
  return state.housing?.id==='rented_room'?'Kamar sewa sendiri':'Bersama keluarga';
}

function trajectoryLabel(state){
  if(state.life?.trajectory==='career') return 'Fokus karier utama';
  if(state.life?.trajectory==='independent') return 'Karier + jalur mandiri';
  return 'Masih terbuka';
}

function lifeDirection(state){
  if(state.life?.trajectory==='independent') return 'Membangun jalur mandiri';
  if(state.life?.trajectory==='career') return 'Memperkuat karier utama';
  if(state.player.job==='mechanic_senior') return 'Karier bengkel mulai mapan';
  if(state.player.job==='store_supervisor') return 'Karier pelayanan mulai mapan';
  if(state.player.job==='it_assistant') return 'Karier teknologi mulai terbentuk';
  const ranked=[
    ['mechanics',state.skills.mechanics||0,'Teknis & mekanik'],
    ['social',state.skills.social||0,'Orang & pelayanan'],
    ['technology',state.skills.technology||0,'Teknologi'],
    ['learning',state.skills.learning||0,'Belajar & eksplorasi']
  ].sort((a,b)=>b[1]-a[1]);
  if(ranked[0][1]<100) return state.player.job?'Sedang mencari arah':'Masih terbuka';
  return ranked[0][2];
}

function clone(value){ return JSON.parse(JSON.stringify(value)); }
