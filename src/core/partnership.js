function ensurePartnershipState(state){
  const base={status:'single',candidate:null,partner:null,sinceAt:null,interestAt:null,dates:0,sharedHours:0,trust:0,strain:0,lastSharedAt:-9999,lastOpportunityAt:-9999,lastEventAt:-9999,nextMilestoneAt:null,friendOnly:{sari:false,andi:false},consideredAt:{sari:-9999,andi:-9999}};
  if(!state.partnership||typeof state.partnership!=='object') state.partnership={};
  const p=state.partnership;
  for(const [key,value] of Object.entries(base)) if(p[key]===undefined) p[key]=value&&typeof value==='object'&&!Array.isArray(value)?{...value}:value;
  p.friendOnly={...base.friendOnly,...(p.friendOnly||{})};
  p.consideredAt={...base.consideredAt,...(p.consideredAt||{})};
  p.dates=Math.max(0,Number(p.dates)||0);
  p.sharedHours=Math.max(0,Number(p.sharedHours)||0);
  p.trust=Math.max(0,Number(p.trust)||0);
  p.strain=Math.max(0,Math.min(3,Number(p.strain)||0));
  return p;
}

function partnershipCandidateId(state){
  const p=ensurePartnershipState(state);
  return p.partner||p.candidate||null;
}

function partnershipPerson(state){
  const id=partnershipCandidateId(state);
  return id?PARTNERSHIP_CANDIDATES[id]||null:null;
}

function partnershipStatusLabel(state){
  const p=ensurePartnershipState(state);
  if(p.status==='committed'){
    const sl=typeof ensureSharedLifeState==='function'?ensureSharedLifeState(state):null;
    if(sl?.stage==='married') return 'Menikah';
    if(sl?.stage==='engaged') return 'Bertunangan';
    return 'Hubungan serius';
  }
  if(p.status==='dating') return 'Berpacaran';
  if(p.status==='exploring') return 'Sedang saling mengenal lebih dekat';
  return 'Belum punya pasangan';
}

function partnershipEligible(state,id){
  const p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[id];
  if(!def||p.status!=='single'||p.partner||p.candidate) return false;
  if(p.friendOnly[id]) return false;
  if(state.time.totalHours-(p.consideredAt[id]||-9999)<180*24) return false;
  if(getCalendar(state.time.totalHours).age<def.minAge) return false;
  if(!state.npc?.[id]?.known) return false;
  if((state.relationships?.[id]||0)<def.minRelation) return false;
  if((state.social?.encounters?.[id]||0)<def.minEncounters) return false;
  if((state.characterStories?.[id]?.stage||0)<def.minStoryStage) return false;
  if((state.relationshipStakes?.fulfilled?.[id]||0)<def.minFulfilled) return false;
  if((state.relationshipStakes?.strain?.[id]||0)>0) return false;
  return true;
}

function beginPartnershipExploration(state,id){
  const p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[id];
  if(!def||p.status!=='single') return false;
  p.status='exploring';p.candidate=id;p.partner=null;p.interestAt=state.time.totalHours;p.sinceAt=state.time.totalHours;p.dates=0;p.sharedHours=0;p.trust=2;p.strain=0;p.lastSharedAt=state.time.totalHours;p.lastOpportunityAt=-9999;p.lastEventAt=state.time.totalHours;p.nextMilestoneAt=null;p.consideredAt[id]=state.time.totalHours;
  addHistory(state,`Umur 18 · Mulai melihat kedekatan dengan ${def.name} sebagai sesuatu yang mungkin lebih dari persahabatan.`);
  addRecent(state,`Kedekatanmu dengan ${def.name} memasuki arah baru—pelan, tanpa janji besar.`);
  return true;
}

function keepPartnershipFriendship(state,id){
  const p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[id];
  if(!def) return false;
  p.friendOnly[id]=true;p.consideredAt[id]=state.time.totalHours;
  if(p.candidate===id||p.partner===id){p.status='single';p.candidate=null;p.partner=null;p.sinceAt=null;p.interestAt=null;p.dates=0;p.sharedHours=0;p.trust=0;p.strain=0;p.nextMilestoneAt=null;removeOpportunity(state,'partnership_time');}
  addRecent(state,`Kamu memilih menjaga hubungan dengan ${def.name} sebagai persahabatan dekat. Game tidak akan memaksa arah romantis yang sama lagi.`);
  return true;
}

function beginDating(state){
  const p=ensurePartnershipState(state),id=p.candidate,def=PARTNERSHIP_CANDIDATES[id];
  if(!def||p.status!=='exploring') return false;
  p.status='dating';p.partner=id;p.candidate=null;p.sinceAt=state.time.totalHours;p.lastEventAt=state.time.totalHours;p.strain=Math.max(0,p.strain-1);p.nextMilestoneAt=state.time.totalHours+30*24;
  state.relationships[id]=(state.relationships[id]||0)+4;
  addHistory(state,`Umur 18 · Mulai menjalani hubungan dengan ${def.name}.`);
  addRecent(state,`${def.name} sekarang bukan cuma orang dekat. Kalian sepakat mencoba menjalani hubungan ini.`);
  return true;
}

function stepBackFromPartnership(state,{friendOnly=false}={}){
  const p=ensurePartnershipState(state),id=partnershipCandidateId(state),def=PARTNERSHIP_CANDIDATES[id];
  if(!id||!def) return false;
  if(friendOnly) p.friendOnly[id]=true;
  p.consideredAt[id]=state.time.totalHours;
  p.status='single';p.candidate=null;p.partner=null;p.sinceAt=null;p.interestAt=null;p.dates=0;p.sharedHours=0;p.trust=0;p.strain=0;p.lastSharedAt=-9999;p.lastOpportunityAt=-9999;p.lastEventAt=state.time.totalHours;p.nextMilestoneAt=null;
  removeOpportunity(state,'partnership_time');
  addRecent(state,`Kamu dan ${def.name} memilih tidak meneruskan hubungan ke arah pasangan. Kedekatan yang sudah dibangun tetap punya arti.`);
  return true;
}

function commitPartnership(state){
  const p=ensurePartnershipState(state),id=p.partner,def=PARTNERSHIP_CANDIDATES[id];
  if(!def||p.status!=='dating') return false;
  p.status='committed';p.sinceAt=state.time.totalHours;p.lastEventAt=state.time.totalHours;p.trust+=4;p.strain=Math.max(0,p.strain-1);p.nextMilestoneAt=null;
  state.relationships[id]=(state.relationships[id]||0)+5;
  if(!state.player.statuses.includes('punya_pasangan_serius')) state.player.statuses.push('punya_pasangan_serius');
  addHistory(state,`Umur 18 · Memilih menjalani hubungan serius bersama ${def.name}.`);
  addRecent(state,`Hubungan dengan ${def.name} sekarang menjadi bagian nyata dari keputusan hidupmu, bukan sekadar waktu luang.`);
  return true;
}

function partnershipSharedTimeDue(state){
  const p=ensurePartnershipState(state);
  if(!['exploring','dating','committed'].includes(p.status)) return false;
  if(state.opportunities.some(x=>x.id==='partnership_time')) return false;
  const interval=p.status==='exploring'?72:p.status==='dating'?96:120;
  return state.time.totalHours-(p.lastOpportunityAt||-9999)>=interval;
}

function syncPartnership(state){
  const p=ensurePartnershipState(state),def=partnershipPerson(state);
  if(!def) { removeOpportunity(state,'partnership_time'); return; }
  if(partnershipSharedTimeDue(state)){
    p.lastOpportunityAt=state.time.totalHours;
    addOpportunity(state,{id:'partnership_time',name:def.sharedName,summary:def.sharedSummary,expireAt:state.time.totalHours+72,source:`Hubungan dengan ${def.name}`,art:def.image});
  }
}

function runPartnershipOpportunity(state,id){
  if(id!=='partnership_time') return null;
  if(!state.opportunities.some(x=>x.id==='partnership_time')) return 'Waktu bersama itu belum tersedia sekarang.';
  const p=ensurePartnershipState(state),def=partnershipPerson(state);
  if(!def||!['exploring','dating','committed'].includes(p.status)){removeOpportunity(state,id);return 'Hubungan itu sudah berubah arah.';}
  if(state.player.money<def.sharedCost) return `Kamu butuh sekitar Rp${def.sharedCost.toLocaleString('id-ID')} untuk rencana sederhana ini.`;
  removeOpportunity(state,id);
  state.time.totalHours+=def.sharedHours;
  state.player.money-=def.sharedCost;
  state.player.fatigue=Math.max(0,state.player.fatigue-4);
  state.skills.social=(state.skills.social||0)+7;
  state.relationships[def.id]=(state.relationships[def.id]||0)+4;
  p.dates+=1;p.sharedHours+=def.sharedHours;p.trust+=3;p.lastSharedAt=state.time.totalHours;p.strain=Math.max(0,p.strain-1);
  if(typeof ensureHealthState==='function'){const h=ensureHealthState(state);h.stress=clampHealth(h.stress-(p.status==='committed'?9:6));h.rhythm=clampHealth(h.rhythm+3);h.lastRecoveryAt=state.time.totalHours;}
  addRecent(state,def.sharedResult);
  return `${def.sharedName} selesai · hubungan terasa lebih dekat.`;
}

function partnershipIntroEvent(state,id){
  const p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[id];
  if(!def) return null;
  p.consideredAt[id]=state.time.totalHours;
  return {id:`partnership_intro_${id}`,type:'HUBUNGAN',title:def.introTitle,art:def.image,artAlt:def.name,text:def.introText,choices:[
    {label:'Jujur dan lihat arahnya',hint:'Mulai mendekat tanpa langsung memberi label',effects:[{type:'partnership_explore',npc:id}],result:`Kamu nggak membuat janji besar. Kamu cuma jujur bahwa kedekatan dengan ${def.name} layak diberi ruang untuk berkembang.`},
    {label:'Jaga sebagai sahabat dekat',hint:'Hubungan tetap penting, tanpa jalur romantis',effects:[{type:'partnership_friend',npc:id}],result:`Kamu memilih menjaga batas yang terasa benar. ${def.name} tetap menjadi orang penting tanpa harus menjadi pasangan.`}
  ]};
}

function getNextPartnershipEvent(state){
  const p=ensurePartnershipState(state),now=state.time.totalHours;
  if(state.pendingEvent) return null;
  if(p.status==='single'){
    const eligible=['sari','andi'].filter(id=>partnershipEligible(state,id)).sort((a,b)=>{
      const score=id=>(state.relationships?.[id]||0)+(state.social?.encounters?.[id]||0)*2+(state.relationshipStakes?.fulfilled?.[id]||0)*5;
      return score(b)-score(a);
    });
    if(eligible.length) return partnershipIntroEvent(state,eligible[0]);
    return null;
  }
  const def=partnershipPerson(state); if(!def) return null;
  if(p.status==='exploring' && p.dates>=3 && p.trust>=9 && (state.relationships[def.id]||0)>=65 && now-(p.lastEventAt||-9999)>=48){
    p.lastEventAt=now;
    return {id:'partnership_define_relationship',type:'HUBUNGAN',title:`Apa Kalian Mau Menyebut Ini Sebagai Hubungan?`,art:def.image,artAlt:def.name,text:`Kedekatan dengan ${def.name} sudah melewati rasa penasaran awal. Kalian sengaja mencari waktu untuk bertemu, saling tahu ritme buruk masing-masing, dan mulai terasa aneh kalau terus pura-pura semuanya sama seperti dulu.`,choices:[
      {label:'Coba jalani sebagai pasangan',hint:'Mulai pacaran · tetap butuh waktu dan perhatian',effects:[{type:'partnership_dating'}],result:`Kalian sepakat mencoba. Nggak ada janji bahwa semuanya akan mudah, tapi sekarang hubungan ini punya nama dan tanggung jawab.`},
      {label:'Jangan lanjutkan ke pacaran',hint:'Kembali ke persahabatan dekat',effects:[{type:'partnership_step_back',friendOnly:true}],result:`Kalian memilih jujur sebelum hubungan berjalan terlalu jauh. Kedekatan tetap ada, hanya bentuknya yang berbeda.`}
    ]};
  }
  if(['dating','committed'].includes(p.status) && now-(p.lastSharedAt||p.sinceAt||now)>=10*24 && now-(p.lastEventAt||-9999)>=7*24){
    p.lastEventAt=now;
    return {id:'partnership_time_pressure',type:'HUBUNGAN',title:`Kesibukan Mulai Mengambil Ruang`,art:def.image,artAlt:def.name,text:`Sudah cukup lama sejak kamu dan ${def.name} benar-benar meluangkan waktu tanpa urusan lain. Hubungan belum rusak, tapi mulai terasa seperti sesuatu yang hanya disisakan setelah semua target selesai.`,choices:[
      {label:'Sisihkan waktu sekarang',hint:'4j · pulihkan kedekatan',effects:[{type:'hours',value:4},{type:'fatigue',value:-6},{type:'relationship',target:def.id,value:4},{type:'partnership_shared_direct',hours:4,trust:3},{type:'health_stress',value:-8}],result:`Kamu memilih membatalkan beberapa hal kecil dan benar-benar hadir. Kadang hubungan dijaga lewat waktu yang sengaja dikosongkan.`},
      {label:'Jujur kalau hidup lagi padat',hint:'Tidak kehilangan waktu · kedekatan sedikit menurun',effects:[{type:'relationship',target:def.id,value:-2},{type:'partnership_strain',value:1}],result:`Kamu nggak menjanjikan waktu yang belum punya. ${def.name} mengerti, walau jarak kecil tetap terasa.`}
    ]};
  }
  if(p.status==='dating' && getCalendar(now).age>=21 && p.dates>=6 && p.trust>=20 && (state.relationships[def.id]||0)>=75 && p.strain<=1 && now>=(p.nextMilestoneAt||p.sinceAt+30*24) && now-(p.lastEventAt||-9999)>=7*24){
    p.lastEventAt=now;
    return {id:'partnership_commitment',type:'FASE HIDUP',title:`Membicarakan Arah Bersama ${def.name}`,art:def.image,artAlt:def.name,text:`Hubungan ini sudah bertahan melewati jadwal kerja, tekanan hidup, dan hari-hari biasa yang nggak romantis. Pertanyaannya sekarang bukan apakah kalian dekat, tapi seberapa besar hubungan ini akan ikut masuk ke keputusan hidup berikutnya.`,choices:[
      {label:'Jalani sebagai hubungan serius',hint:'Komitmen lebih kuat · membuka fase hidup berikutnya',effects:[{type:'partnership_commit'}],result:`Kalian sepakat berhenti memperlakukan hubungan ini sebagai sesuatu yang mudah digeser kalau hidup sedang sibuk. Keputusan berikutnya akan mulai mempertimbangkan dua orang.`},
      {label:'Jalani dulu tanpa komitmen lebih jauh',hint:'Tetap pacaran · keputusan besar ditunda',effects:[{type:'partnership_delay_commit'}],result:`Kalian tetap bersama, tapi sepakat belum menjadikan hubungan ini pusat dari keputusan hidup yang lebih besar.`}
    ]};
  }
  return null;
}

function partnershipNpcStatus(state,id){
  const p=ensurePartnershipState(state);
  if(p.partner===id){
    if(p.status==='committed'){
      const sl=typeof ensureSharedLifeState==='function'?ensureSharedLifeState(state):null;
      if(sl?.stage==='married') return 'Pasangan · menikah';
      if(sl?.stage==='engaged') return 'Pasangan · bertunangan';
      return 'Pasangan · hubungan serius';
    }
    if(p.status==='dating') return p.strain>=2?'Pasangan · hubungan sedang tegang':'Pasangan';
  }
  if(p.candidate===id&&p.status==='exploring') return 'Sedang saling mengenal lebih dekat';
  if(p.friendOnly[id]) return 'Sahabat dekat';
  return '';
}

function partnershipSnapshot(state){
  const p=ensurePartnershipState(state),def=partnershipPerson(state);
  if(!def) return null;
  const since=Math.max(0,state.time.totalHours-(p.sinceAt||state.time.totalHours));
  return {status:p.status,statusLabel:partnershipStatusLabel(state),id:def.id,name:def.name,image:def.image,role:def.role,dates:p.dates,sharedHours:p.sharedHours,trust:p.trust,strain:p.strain,sinceDays:Math.floor(since/24),lastSharedDays:p.lastSharedAt>0?Math.floor(Math.max(0,state.time.totalHours-p.lastSharedAt)/24):null};
}

function partnershipPressureModifier(state){
  const p=ensurePartnershipState(state);
  if(!['dating','committed'].includes(p.status)) return 0;
  const sinceShared=state.time.totalHours-(p.lastSharedAt||p.sinceAt||state.time.totalHours);
  let base=0;
  if(p.strain>=2) base=5;
  else if(sinceShared<=7*24) base=p.status==='committed'?-5:-3;
  else if(sinceShared>=12*24) base=3;
  const shared=typeof sharedLifePressureModifier==='function'?sharedLifePressureModifier(state):0;
  return base+shared;
}
