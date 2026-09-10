function ensureCharacterStories(state){
  const base={};
  for(const id of Object.keys(CHARACTER_STORIES||{})) base[id]={stage:0,status:'locked',deadlineAt:null,followupAt:null,outcome:null,lastChangedAt:-999};
  state.characterStories={...base,...(state.characterStories||{})};
  for(const id of Object.keys(base)) state.characterStories[id]={...base[id],...(state.characterStories?.[id]||{})};
  return state.characterStories;
}

function patchCharacterStory(state,npc,patch={}){
  ensureCharacterStories(state);
  if(!state.characterStories[npc]) state.characterStories[npc]={stage:0,status:'locked',deadlineAt:null,followupAt:null,outcome:null,lastChangedAt:-999};
  state.characterStories[npc]={...state.characterStories[npc],...patch,lastChangedAt:state.time.totalHours};
  return state.characterStories[npc];
}

function characterStoryEligible(state,id){
  ensureCharacterStories(state);
  const def=CHARACTER_STORIES[id],story=state.characterStories[id];
  if(!def||!story||story.stage>0) return false;
  if(!state.npc?.[id]?.known) return false;
  const encounters=state.social?.encounters?.[id]||0,relation=state.relationships?.[id]||0;
  return encounters>=(def.minEncounters||0)&&relation>=(def.minRelation||0);
}

function syncCharacterStories(state){
  ensureCharacterStories(state);
  for(const [id,def] of Object.entries(CHARACTER_STORIES||{})){
    const story=state.characterStories[id];
    if(story.stage===1&&story.status==='active'&&Number.isFinite(story.deadlineAt)&&state.time.totalHours>=story.deadlineAt){
      state.opportunities=state.opportunities.filter(o=>o.id!==def.opportunityId);
      patchCharacterStory(state,id,{stage:2,status:'followup',outcome:'missed',followupAt:state.time.totalHours+18,deadlineAt:null});
      addRecent(state,`Waktu untuk membantu ${SOCIAL_NPCS[id]?.name||'seseorang'} lewat. Ceritanya tetap bergerak tanpa menunggumu.`);
    }
  }
}

function getNextCharacterStoryEvent(state){
  ensureCharacterStories(state);
  syncCharacterStories(state);
  for(const [id,def] of Object.entries(CHARACTER_STORIES||{})){
    const story=state.characterStories[id];
    if(story.stage===2&&story.status==='followup'&&state.time.totalHours>=(story.followupAt??0)) return def.followup(state,story);
  }
  for(const [id,def] of Object.entries(CHARACTER_STORIES||{})){
    if(characterStoryEligible(state,id)){
      patchCharacterStory(state,id,{stage:0,status:'ready'});
      return def.intro(state);
    }
  }
  return null;
}

function completeCharacterStoryTask(state,id){
  ensureCharacterStories(state);
  const story=state.characterStories[id];
  if(!story||story.stage!==1) return null;
  patchCharacterStory(state,id,{stage:2,status:'followup',outcome:'helped',followupAt:state.time.totalHours+18,deadlineAt:null});
  return story;
}

function runCharacterStoryOpportunity(state,id){
  const map={story_andi_demo:'andi',story_lestari_route:'bu_lestari',story_sari_tasting:'sari',story_dimas_route:'dimas'};
  const npc=map[id];
  if(!npc) return null;
  ensureCharacterStories(state);
  const story=state.characterStories[npc];
  if(!story||story.stage!==1||story.status!=='active'||(Number.isFinite(story.deadlineAt)&&state.time.totalHours>=story.deadlineAt)){
    removeOpportunity(state,id);
    if(story&&story.stage===1) patchCharacterStory(state,npc,{stage:2,status:'followup',outcome:'missed',followupAt:state.time.totalHours+18,deadlineAt:null});
    return 'Kesempatan cerita itu sudah lewat.';
  }
  removeOpportunity(state,id);
  if(npc==='andi'){
    state.time.totalHours+=4; state.player.fatigue=Math.min(100,state.player.fatigue+7);
    discoverSkill(state,'technology'); state.skills.technology=(state.skills.technology||0)+14; state.skills.learning=(state.skills.learning||0)+10; state.relationships.andi=(state.relationships.andi||0)+6;
    addRecent(state,'Kamu dan Andi menyelesaikan setup demo komunitas sampai cukup stabil untuk dibawa ke acara.');
  }else if(npc==='bu_lestari'){
    state.time.totalHours+=3; state.player.fatigue=Math.min(100,state.player.fatigue+5);
    discoverSkill(state,'logistics'); state.skills.logistics=(state.skills.logistics||0)+16; state.skills.social=(state.skills.social||0)+7; state.relationships.bu_lestari=(state.relationships.bu_lestari||0)+6;
    state.player.money+=80000; state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+80000;
    addRecent(state,'Rute kiriman gabungan mulai masuk akal. Bu Lestari memberimu sedikit uang untuk waktu yang kamu habiskan.');
  }else if(npc==='sari'){
    state.time.totalHours+=3; state.player.fatigue=Math.min(100,state.player.fatigue+5);
    discoverSkill(state,'hospitality'); state.skills.hospitality=(state.skills.hospitality||0)+15; state.skills.social=(state.skills.social||0)+8; state.relationships.sari=(state.relationships.sari||0)+6;
    if(state.world?.workplaces?.kafe_senja) state.world.workplaces.kafe_senja.health=Math.min(100,(state.world.workplaces.kafe_senja.health||50)+2);
    addRecent(state,'Uji menu Sari selesai. Kalian menemukan cara penyajian yang lebih konsisten sebelum festival.');
  }else if(npc==='dimas'){
    state.time.totalHours+=3; state.player.fatigue=Math.min(100,state.player.fatigue+5);
    discoverSkill(state,'logistics'); state.skills.logistics=(state.skills.logistics||0)+16; state.skills.learning=(state.skills.learning||0)+6; state.relationships.dimas=(state.relationships.dimas||0)+6;
    if(state.world?.workplaces?.lintas_kota) state.world.workplaces.lintas_kota.pressure=Math.max(0,(state.world.workplaces.lintas_kota.pressure||50)-3);
    addRecent(state,'Checklist rute Dimas lolos uji kecil. Beberapa titik rawan sekarang terlihat lebih jelas.');
  }
  completeCharacterStoryTask(state,npc);
  return `Kamu ikut membantu cerita ${SOCIAL_NPCS[npc]?.name||'temanmu'} bergerak ke tahap berikutnya.`;
}

function characterStoryStatus(state,id){
  ensureCharacterStories(state);
  const def=CHARACTER_STORIES[id],story=state.characterStories[id];
  if(!def||!story) return '';
  if(story.stage===0&&characterStoryEligible(state,id)) return `Cerita terbuka · ${def.title}`;
  if(story.stage===1&&story.status==='active'){
    const left=Math.max(0,(story.deadlineAt||state.time.totalHours)-state.time.totalHours);
    return `Butuh bantuan · ${left<=24?'waktunya mepet':Math.ceil(left/24)+' hari'}`;
  }
  if(story.stage===2&&story.status==='followup') return 'Ada kabar baru dari ceritanya';
  if(story.stage>=3) return `Bab selesai · ${def.title}`;
  return '';
}

function characterStoryProgressCount(state){
  ensureCharacterStories(state);
  const stories=Object.values(state.characterStories||{});
  return {started:stories.filter(s=>s.stage>0).length,completed:stories.filter(s=>s.stage>=3).length,total:stories.length};
}
