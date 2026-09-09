export const SAVE_VERSION = 4;

export function createInitialState(){
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
    economy:{lastLivingCostAt:0,livingCost:600000},
    skills:{mechanics:0,learning:25,social:40,technology:0},
    discoveredSkills:['mechanics','learning','social'],
    relationships:{family:60,rian:35,pak_arman:0,dika:0,maya:0,nadia:0},
    npc:{
      rian:{known:true,life:'serabutan'},
      pak_arman:{known:false,life:'pemilik_bengkel'},
      dika:{known:false,rivalry:10,life:'sinar_jaya'},
      maya:{known:false,life:'supervisor'},
      nadia:{known:false,life:'teknisi_senior'}
    },
    assets:{laptop:false},
    career:{
      workCount:0,
      jobSearchCount:0,
      promotionProgress:0,
      storeProgress:0,
      techProgress:0,
      changeSearchCount:0,
      changeHandledCount:0,
      sideIncomeTotal:0,
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
      rianDebtRepaySeen:false
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

export const skillTiers=[
  {id:'novice',label:'Pemula',min:0},
  {id:'basic',label:'Dasar',min:100},
  {id:'skilled',label:'Terampil',min:300},
  {id:'experienced',label:'Berpengalaman',min:700},
  {id:'expert',label:'Ahli',min:1500}
];

export function getSkillTier(xp){
  let out=skillTiers[0];
  for(const tier of skillTiers){ if(xp>=tier.min) out=tier; }
  return out;
}

export function getCondition(fatigue){
  if(fatigue>=70) return {id:'exhausted',label:'Kelelahan'};
  if(fatigue>=30) return {id:'tired',label:'Lelah'};
  return {id:'good',label:'Baik'};
}

export function relationshipLabel(value){
  if(value>=80) return 'Sangat percaya';
  if(value>=50) return 'Dekat';
  if(value>=20) return 'Bersahabat';
  if(value>=-19) return 'Netral';
  if(value>=-59) return 'Dingin';
  return 'Bermusuhan';
}

export function financialState(state){
  const money=state.player.money;
  if(money<0) return {id:'debt',label:'Berutang'};
  if(money<250000) return {id:'tight',label:'Seret'};
  if(money>=3000000) return {id:'comfortable',label:'Nyaman'};
  return {id:'stable',label:'Stabil'};
}

export function lifeDirection(state){
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

export function clone(value){ return JSON.parse(JSON.stringify(value)); }
