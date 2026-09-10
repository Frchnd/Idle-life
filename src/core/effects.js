function addRecent(state,text){
  state.recent.unshift(text);
  state.recent=state.recent.slice(0,4);
}

function addHistory(state,text){
  if(!state.history.includes(text)) state.history.unshift(text);
  state.history=state.history.slice(0,8);
}

function discoverSkill(state,id){
  if(!state.discoveredSkills.includes(id)) state.discoveredSkills.push(id);
}

function addOpportunity(state,opportunity){
  if(!state.opportunities.some(item=>item.id===opportunity.id)) state.opportunities.push({...opportunity});
}

function removeOpportunity(state,id){
  state.opportunities=state.opportunities.filter(item=>item.id!==id);
}

function resolveEffects(state,effects=[]){
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
      case 'store_progress': state.career.storeProgress+=effect.value; break;
      case 'tech_progress': state.career.techProgress+=effect.value; break;
      case 'career_search_handled': state.career.changeHandledCount=state.career.changeSearchCount; break;
      case 'side_income': state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+effect.value; break;
      case 'asset': state.assets[effect.asset]=effect.value; break;
      case 'npc_state': if(state.npc[effect.npc]) state.npc[effect.npc][effect.key]=effect.value; break;
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
      case 'status_add': if(!state.player.statuses.includes(effect.status)) state.player.statuses.push(effect.status); break;
      case 'status_remove': state.player.statuses=state.player.statuses.filter(x=>x!==effect.status); break;
      case 'trajectory': state.life.trajectory=effect.value; state.life.majorDecisionAt=state.time.totalHours; break;
      case 'housing':
        state.housing={...state.housing,...effect.value};
        state.economy.livingCost=state.housing.monthlyCost||state.economy.livingCost;
        break;
      case 'salary_delta':
        state.player.salary=Math.max(0,Math.round((state.player.salary||0)+effect.value));
        break;
      case 'salary_scale':
        state.player.salary=Math.max(0,Math.round((state.player.salary||0)*effect.value));
        break;
      case 'job_clear':
        state.player.job=null; state.player.workplace=null; state.player.salary=0;
        state.player.statuses=state.player.statuses.filter(x=>!['peran_ganda','gaji_ditekan','jam_lebih_fleksibel'].includes(x));
        break;
      case 'career_restructure':
        state.career.restructureCount=(state.career.restructureCount||0)+1;
        break;
      case 'salary_negotiated':
        state.career.salaryNegotiatedJobs=Array.isArray(state.career.salaryNegotiatedJobs)?state.career.salaryNegotiatedJobs:[];
        if(state.player.job && !state.career.salaryNegotiatedJobs.includes(state.player.job)) state.career.salaryNegotiatedJobs.push(state.player.job);
        break;
      case 'business_close':
        if(state.business){ state.business.active=false; state.business.lastWeeklyProfit=0; state.business.lossStreak=0; }
        state.player.statuses=state.player.statuses.filter(x=>x!=='punya_usaha_kecil');
        break;
      case 'business_recover':
        if(state.business){ state.business.reputation=Math.min(100,(state.business.reputation||0)+6); state.business.lossStreak=0; state.business.lastManagedAt=state.time.totalHours; }
        break;
    }
  }
}
