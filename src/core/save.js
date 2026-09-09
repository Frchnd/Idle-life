import {createInitialState,SAVE_VERSION,clone} from './state.js';

export const SAVE_KEY='hidup-vertical-slice-f-v2';

export function loadState(){
  const fresh=createInitialState();
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return fresh;
    const saved=JSON.parse(raw);
    if(!saved || typeof saved!=='object') return fresh;
    if(saved.version!==SAVE_VERSION) return migrate(saved,fresh);
    return mergeState(fresh,saved);
  }catch{
    return fresh;
  }
}

function mergeState(base,saved){
  const out=clone(base);
  Object.assign(out,saved);
  out.player={...base.player,...(saved.player||{})};
  out.time={...base.time,...(saved.time||{})};
  out.skills={...base.skills,...(saved.skills||{})};
  out.relationships={...base.relationships,...(saved.relationships||{})};
  out.npc={...base.npc,...(saved.npc||{})};
  out.npc.pak_arman={...base.npc.pak_arman,...(saved.npc?.pak_arman||{})};
  out.npc.dika={...base.npc.dika,...(saved.npc?.dika||{})};
  out.npc.maya={...base.npc.maya,...(saved.npc?.maya||{})};
  out.career={...base.career,...(saved.career||{})};
  out.flags={...base.flags,...(saved.flags||{})};
  out.routine={...base.routine,...(saved.routine||{})};
  if(!Array.isArray(out.discoveredSkills)) out.discoveredSkills=[...base.discoveredSkills];
  if(!Array.isArray(out.opportunities)) out.opportunities=[];
  if(!Array.isArray(out.scheduled)) out.scheduled=[];
  if(!Array.isArray(out.recent)) out.recent=[];
  if(!Array.isArray(out.history)) out.history=[...base.history];
  return out;
}

function migrate(oldState,fresh){
  // Save Build E lama sengaja tidak dimigrasikan penuh karena struktur karier berubah.
  // Yang aman dipertahankan: preferensi rutinitas dan timestamp; gameplay dimulai dari slice baru.
  if(oldState?.routine===true || oldState?.routine?.enabled) fresh.routine.enabled=true;
  return fresh;
}

export function saveState(state){
  state.lastSeen=Date.now();
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

export function clearState(){ localStorage.removeItem(SAVE_KEY); }
