export const SAVE_VERSION = 2;

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
    skills:{mechanics:0,learning:25,social:40,technology:0},
    discoveredSkills:['mechanics','learning','social'],
    relationships:{family:60,rian:35,pak_arman:0,dika:0,maya:0},
    npc:{
      pak_arman:{known:false},
      dika:{known:false,rivalry:10},
      maya:{known:false}
    },
    career:{workCount:0,promotionProgress:0,jobSearchCount:0},
    flags:{
      workshopOfferSeen:false,
      storeOfferSeen:false,
      firstWorkshopDay:false,
      firstStoreDay:false,
      dikaHelpSeen:false,
      helpedDika:false,
      difficultRepairSeen:false,
      privateIntroSeen:false,
      techCourseSeen:false,
      techSideJobSeen:false,
      promotionTalkSeen:false,
      promoted:false,
      routineUnlocked:false,
      milestoneShown:false,
      exhaustedWarningSeen:false
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

export function clone(value){ return JSON.parse(JSON.stringify(value)); }
