import {createInitialState,SAVE_VERSION,clone} from './state.js';

// Pertahankan key lama supaya save Build F–H tetap ikut naik ke Build I.
export const SAVE_KEY='hidup-vertical-slice-f-v2';

export function loadState(){
  const fresh=createInitialState();
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return fresh;
    const saved=JSON.parse(raw);
    if(!saved || typeof saved!=='object') return fresh;
    return mergeState(fresh,saved);
  }catch{
    return fresh;
  }
}

function mergeState(base,saved){
  const out=clone(base);
  Object.assign(out,saved);
  out.version=SAVE_VERSION;
  out.player={...base.player,...(saved.player||{})};
  out.time={...base.time,...(saved.time||{})};
  out.economy={...base.economy,...(saved.economy||{})};
  out.housing={...base.housing,...(saved.housing||{})};
  out.life={...base.life,...(saved.life||{})};
  out.skills={...base.skills,...(saved.skills||{})};
  out.relationships={...base.relationships,...(saved.relationships||{})};
  out.assets={...base.assets,...(saved.assets||{})};
  out.npc={...base.npc,...(saved.npc||{})};
  for(const key of Object.keys(base.npc)) out.npc[key]={...base.npc[key],...(saved.npc?.[key]||{})};
  out.career={...base.career,...(saved.career||{})};
  out.career.jobWorkCounts={...base.career.jobWorkCounts,...(saved.career?.jobWorkCounts||{})};
  out.flags={...base.flags,...(saved.flags||{})};
  out.routine={...base.routine,...(saved.routine||{})};
  if(!Array.isArray(out.discoveredSkills)) out.discoveredSkills=[...base.discoveredSkills];
  if(!Array.isArray(out.opportunities)) out.opportunities=[];
  if(!Array.isArray(out.scheduled)) out.scheduled=[];
  if(!Array.isArray(out.recent)) out.recent=[];
  if(!Array.isArray(out.history)) out.history=[...base.history];

  if(saved.version===2){
    out.economy.lastLivingCostAt=out.time.totalHours;
    if(saved.player?.job && (saved.career?.workCount||0)>0){
      const current=out.career.jobWorkCounts[saved.player.job]||0;
      out.career.jobWorkCounts[saved.player.job]=Math.max(current,saved.career.workCount);
    }
  }

  // Build H dan versi sebelumnya belum punya sistem tempat tinggal eksplisit.
  if(!saved.housing){
    const livingAlone=out.player.statuses.includes('tinggal_sendiri');
    out.housing=livingAlone
      ? {id:'rented_room',label:'Kamar sewa sendiri',monthlyCost:1100000,movedAt:out.time.totalHours}
      : {id:'family_home',label:'Bersama keluarga',monthlyCost:600000,movedAt:null};
  }
  out.economy.livingCost=out.housing.id==='rented_room'?1100000:600000;
  return out;
}

export function saveState(state){
  state.version=SAVE_VERSION;
  state.lastSeen=Date.now();
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

export function clearState(){ localStorage.removeItem(SAVE_KEY); }
