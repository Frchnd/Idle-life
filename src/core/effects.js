import {addHours} from './time.js';

export function addRecent(state,text){
  state.recent.unshift(text);
  state.recent=state.recent.slice(0,4);
}

export function addHistory(state,text){
  if(!state.history.includes(text)) state.history.unshift(text);
  state.history=state.history.slice(0,8);
}

export function discoverSkill(state,id){
  if(!state.discoveredSkills.includes(id)) state.discoveredSkills.push(id);
}

export function addOpportunity(state,opportunity){
  if(!state.opportunities.some(item=>item.id===opportunity.id)) state.opportunities.push({...opportunity});
}

export function removeOpportunity(state,id){
  state.opportunities=state.opportunities.filter(item=>item.id!==id);
}

export function resolveEffects(state,effects=[]){
  for(const effect of effects){
    switch(effect.type){
      case 'money': state.player.money+=effect.value; break;
      case 'fatigue': state.player.fatigue=Math.max(0,Math.min(100,state.player.fatigue+effect.value)); break;
      case 'hours': addHours(state,effect.value); break;
      case 'skill':
        discoverSkill(state,effect.skill);
        state.skills[effect.skill]=(state.skills[effect.skill]||0)+effect.value;
        break;
      case 'relationship':
        state.relationships[effect.target]=(state.relationships[effect.target]||0)+effect.value;
        break;
      case 'flag': state.flags[effect.key]=effect.value; break;
      case 'promotion': state.career.promotionProgress+=effect.value; break;
      case 'job':
        state.player.job=effect.job;
        state.player.workplace=effect.workplace;
        state.player.salary=effect.salary;
        break;
      case 'npc_known': if(state.npc[effect.npc]) state.npc[effect.npc].known=true; break;
      case 'recent': addRecent(state,effect.text); break;
      case 'history': addHistory(state,effect.text); break;
      case 'opportunity': addOpportunity(state,effect.opportunity); break;
      case 'schedule': state.scheduled.push({at:state.time.totalHours+effect.after,kind:effect.kind}); break;
    }
  }
}
