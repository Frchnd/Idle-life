function ensureRelationshipStakes(state){
  const npcs=['andi','bu_lestari','sari','dimas'];
  const base={records:{},strain:{},fulfilled:{},missed:{},lastRepairAt:{},lastStakeAt:-999};
  for(const npc of npcs){base.strain[npc]=0;base.fulfilled[npc]=0;base.missed[npc]=0;base.lastRepairAt[npc]=-999;}
  for(const [id,def] of Object.entries(RELATIONSHIP_STAKES||{})) base.records[id]={id,npc:def.npc,status:'locked',offeredAt:null,dueAt:null,followupAt:null,outcome:null,completedAt:null};
  state.relationshipStakes={...base,...(state.relationshipStakes||{})};
  state.relationshipStakes.records={...base.records,...(state.relationshipStakes.records||{})};
  for(const id of Object.keys(base.records)) state.relationshipStakes.records[id]={...base.records[id],...(state.relationshipStakes.records?.[id]||{})};
  for(const key of ['strain','fulfilled','missed','lastRepairAt']) state.relationshipStakes[key]={...base[key],...(state.relationshipStakes?.[key]||{})};
  return state.relationshipStakes;
}

function activeRelationshipCommitment(state){
  ensureRelationshipStakes(state);
  return Object.values(state.relationshipStakes.records).find(r=>r.status==='active')||null;
}

function relationshipStakeEligible(state,id){
  ensureRelationshipStakes(state);
  const def=RELATIONSHIP_STAKES[id],record=state.relationshipStakes.records[id];
  if(!def||!record||record.status!=='locked') return false;
  if(activeRelationshipCommitment(state)) return false;
  if(state.time.totalHours-(state.relationshipStakes.lastStakeAt??-999)<96) return false;
  if((state.relationshipStakes.strain[def.npc]||0)>0) return false;
  if((state.relationships?.[def.npc]||0)<(def.minRelation||0)) return false;
  if((state.characterStories?.[def.npc]?.stage||0)<3) return false;
  return true;
}

function startRelationshipCommitment(state,id){
  ensureRelationshipStakes(state);
  const def=RELATIONSHIP_STAKES[id];
  if(!def||activeRelationshipCommitment(state)) return false;
  const record=state.relationshipStakes.records[id];
  if(!record||!['locked','offered'].includes(record.status)) return false;
  const dueAt=state.time.totalHours+(def.task.deadlineHours||48);
  Object.assign(record,{status:'active',offeredAt:state.time.totalHours,dueAt,followupAt:null,outcome:null});
  state.relationshipStakes.lastStakeAt=state.time.totalHours;
  addOpportunity(state,{id:def.task.id,name:def.task.name,summary:def.task.summary,expireAt:dueAt,source:`Janji ke ${SOCIAL_NPCS[def.npc]?.name||'teman'}`,commitment:true});
  addRecent(state,`Kamu membuat janji ke ${SOCIAL_NPCS[def.npc]?.name||'seseorang'}. Sekarang waktumu punya konsekuensi sosial.`);
  return true;
}

function declineRelationshipStake(state,id){
  ensureRelationshipStakes(state);
  const record=state.relationshipStakes.records[id];
  if(!record||!['locked','offered'].includes(record.status)) return false;
  Object.assign(record,{status:'declined',offeredAt:state.time.totalHours,outcome:'declined',completedAt:state.time.totalHours});
  state.relationshipStakes.lastStakeAt=state.time.totalHours;
  return true;
}

function changeRelationshipStrain(state,npc,delta){
  ensureRelationshipStakes(state);
  state.relationshipStakes.strain[npc]=Math.max(0,Math.min(3,(state.relationshipStakes.strain[npc]||0)+delta));
  return state.relationshipStakes.strain[npc];
}

function finishRelationshipStake(state,id){
  ensureRelationshipStakes(state);
  const record=state.relationshipStakes.records[id];
  if(!record) return false;
  record.status='complete';record.completedAt=state.time.totalHours;record.followupAt=null;
  return true;
}

function syncRelationshipStakes(state){
  ensureRelationshipStakes(state);
  for(const [id,def] of Object.entries(RELATIONSHIP_STAKES||{})){
    const record=state.relationshipStakes.records[id];
    if(record.status==='active'&&Number.isFinite(record.dueAt)&&state.time.totalHours>=record.dueAt){
      removeOpportunity(state,def.task.id);
      record.status='followup';record.outcome='missed';record.followupAt=state.time.totalHours+12;record.dueAt=null;
      state.relationshipStakes.missed[def.npc]=(state.relationshipStakes.missed[def.npc]||0)+1;
      changeRelationshipStrain(state,def.npc,1);
      state.relationships[def.npc]=(state.relationships[def.npc]||0)-7;
      addRecent(state,`Kamu melewatkan janji ke ${SOCIAL_NPCS[def.npc]?.name||'seseorang'}. Kali ini hubungan benar-benar ikut berubah.`);
    }
  }
}

function runRelationshipCommitment(state,opportunityId){
  ensureRelationshipStakes(state);
  const entry=Object.entries(RELATIONSHIP_STAKES||{}).find(([,def])=>def.task.id===opportunityId);
  if(!entry) return null;
  const [id,def]=entry,record=state.relationshipStakes.records[id];
  if(!record||record.status!=='active') {removeOpportunity(state,opportunityId);return 'Janji itu sudah tidak aktif.';}
  if(Number.isFinite(record.dueAt)&&state.time.totalHours>=record.dueAt){syncRelationshipStakes(state);return 'Waktu untuk memenuhi janji itu sudah lewat.';}
  if(def.task.minMoney&&state.player.money<def.task.minMoney) return `Kamu butuh setidaknya Rp${def.task.minMoney.toLocaleString('id-ID')} untuk memenuhi janji ini.`;
  const result=def.complete(state);
  if(result&&typeof result==='object'&&result.error) return result.error;
  removeOpportunity(state,opportunityId);
  record.status='followup';record.outcome='fulfilled';record.followupAt=state.time.totalHours+12;record.completedAt=state.time.totalHours;record.dueAt=null;
  state.relationshipStakes.fulfilled[def.npc]=(state.relationshipStakes.fulfilled[def.npc]||0)+1;
  changeRelationshipStrain(state,def.npc,-1);
  addHistory(state,`Umur 18 · Menepati janji penting kepada ${SOCIAL_NPCS[def.npc]?.name||'seseorang'}.`);
  return typeof result==='string'?result:'Janji terpenuhi.';
}

function getNextRelationshipStakeEvent(state){
  ensureRelationshipStakes(state);syncRelationshipStakes(state);
  for(const [id,def] of Object.entries(RELATIONSHIP_STAKES||{})){
    const record=state.relationshipStakes.records[id];
    if(record.status==='followup'&&state.time.totalHours>=(record.followupAt||0)) return def.followup(state,record);
  }
  for(const [id,def] of Object.entries(RELATIONSHIP_STAKES||{})){
    if(relationshipStakeEligible(state,id)){
      const record=state.relationshipStakes.records[id];record.status='offered';record.offeredAt=state.time.totalHours;
      return def.intro(state);
    }
  }
  return null;
}

function reopenOfferedRelationshipStake(state,id){
  ensureRelationshipStakes(state);
  const record=state.relationshipStakes.records[id];
  if(record&&record.status==='offered') record.status='locked';
}

function relationshipStakeChoiceResolved(state,eventId){
  const map={stake_andi_intro:'andi_workshop',stake_sari_intro:'sari_closing',stake_lestari_intro:'lestari_stock',stake_dimas_intro:'dimas_audit'};
  const id=map[eventId];if(!id)return;
  const record=ensureRelationshipStakes(state).records[id];
  if(record?.status==='offered') record.status='locked';
}

function relationshipStakeStatus(state,npc){
  ensureRelationshipStakes(state);
  const active=Object.values(state.relationshipStakes.records).find(r=>r.npc===npc&&r.status==='active');
  if(active){const left=Math.max(0,(active.dueAt||state.time.totalHours)-state.time.totalHours);return `Janji aktif · ${left<=24?'kurang dari sehari':Math.ceil(left/24)+' hari'}`;}
  const strain=state.relationshipStakes.strain[npc]||0;
  if(strain>=2) return 'Hubungan sedang renggang';
  if(strain===1) return 'Ada rasa kecewa yang belum selesai';
  if((state.relationshipStakes.fulfilled[npc]||0)>=1) return 'Sudah terbukti bisa saling mengandalkan';
  return '';
}

function activeRelationshipCommitmentSnapshot(state){
  const record=activeRelationshipCommitment(state);if(!record)return null;
  const def=Object.values(RELATIONSHIP_STAKES).find(x=>x.id===record.id);if(!def)return null;
  const person=SOCIAL_NPCS[def.npc];const left=Math.max(0,(record.dueAt||state.time.totalHours)-state.time.totalHours);
  return {id:record.id,npc:def.npc,name:person?.name||def.npc,title:def.title,image:person?.image||'',task:def.task.name,leftHours:left};
}

function relationshipRepairEvent(state,npc){
  ensureRelationshipStakes(state);
  const strain=state.relationshipStakes.strain[npc]||0;
  if(strain<=0)return null;
  const person=SOCIAL_NPCS[npc];if(!person)return null;
  if(state.time.totalHours-(state.relationshipStakes.lastRepairAt[npc]??-999)<36)return null;
  state.relationshipStakes.lastRepairAt[npc]=state.time.totalHours;
  return {id:`relationship_repair_${npc}`,type:'HUBUNGAN',title:`Ada Hal yang Belum Selesai dengan ${person.name}`,art:person.image,artAlt:person.name,text:strain>=2?'Kalian masih bisa ngobrol seperti biasa, tapi ada jarak kecil yang terasa. Janji yang terlewat nggak hilang hanya karena waktu sudah lewat.':'Obrolan berjalan normal sampai momen yang sedikit canggung mengingatkan kalian pada janji yang sempat terlewat.',choices:[
    {label:'Akui dan luangkan waktu',hint:'2j · hubungan mulai pulih',effects:[{type:'hours',value:2},{type:'relationship',target:npc,value:5},{type:'relationship_strain',npc,value:-1}],result:'Kamu nggak mencoba membela diri terlalu banyak. Waktu yang kamu berikan sekarang mulai memperbaiki sesuatu yang sempat retak.'},
    {label:'Jangan bahas dulu',effects:[],result:'Kalian membiarkannya lewat untuk sekarang. Hubungan tetap berjalan, tapi rasa kecewa itu belum benar-benar selesai.'}
  ]};
}
