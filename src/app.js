const root=document.getElementById('app');
const contentValidation=validateContentFramework();
if(typeof window!=='undefined') window.__HIDUP_CONTENT_REPORT__=contentValidation;
if(!contentValidation.ok) console.error('[Hidup] Content validation gagal',contentValidation.errors);
if(contentValidation.warnings.length) console.warn('[Hidup] Content warnings',contentValidation.warnings);
let state=loadState();
let deferredPrompt=null;
const ui={tab:'life',result:'Pilihanmu akan menentukan jalur yang mulai terbuka.',offlineSummary:'',milestone:false,chapterProfile:null,installAvailable:false};

function persist(){ saveState(state); }

function postStep(){
  simulateWorld(state);
  resolveContestedOpportunities(state);
  expireOpportunities(state);
  processLivingCosts(state);
  if(state.career.workCount>=3) state.flags.routineUnlocked=true;
  refreshEvent(state);
  checkMilestone();
  checkVerticalSliceOutcome();
  persist();
  draw();
}

function checkMilestone(){
  if(state.flags.milestoneShown) return;
  const mechanicDepth=state.flags.promoted;
  const storeDepth=state.flags.storePromoted;
  const techDepth=state.player.job==='it_assistant' && (state.career.jobWorkCounts.it_assistant||0)>=3;
  const mixedDepth=(getSkillTier(state.skills.technology).id!=='novice' && getSkillTier(state.skills.social).id!=='novice') ||
    (getSkillTier(state.skills.mechanics).id!=='novice' && getSkillTier(state.skills.social).id!=='novice');
  if(mechanicDepth||storeDepth||techDepth||mixedDepth){
    state.flags.milestoneShown=true;
    ui.milestone=true;
  }
}

function checkVerticalSliceOutcome(){
  if(state.flags.verticalSliceComplete || state.pendingEvent) return;
  if(!isVerticalSliceReady(state)) return;
  const profile=getOutcomeProfile(state);
  state.flags.verticalSliceComplete=true;
  state.life.outcomeAt=state.time.totalHours;
  addHistory(state,`Umur 18 · Bab pertama hidupmu terbentuk sebagai “${profile.title}”.`);
  addRecent(state,`Vertical Slice selesai dengan arah sementara: ${profile.title}.`);
  ui.chapterProfile=profile;
}

function draw(){
  render(root,state,ui);
  bind();
}

function bind(){
  root.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{ui.tab=btn.dataset.tab;draw()}));
  root.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>runActivity(btn.dataset.action)));
  root.querySelectorAll('[data-opportunity]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const id=btn.dataset.opportunity;
    const existed=state.opportunities.some(x=>x.id===id);
    const oldJob=state.player.job;
    ui.result=runOpportunity(state,id);
    if(existed && !state.opportunities.some(x=>x.id===id)){
      state.playtest.opportunitiesTaken=(state.playtest.opportunitiesTaken||0)+1;
      if(oldJob && state.player.job && oldJob!==state.player.job) state.playtest.careerChanges=(state.playtest.careerChanges||0)+1;
    }
    postStep();
  }));
  root.querySelectorAll('[data-event-choice]').forEach(btn=>btn.addEventListener('click',()=>{
    const choice=state.pendingEvent?.choices?.[Number(btn.dataset.eventChoice)];
    if(!choice) return;
    applyEventChoice(state,choice);
    ui.result=choice.result||'Keputusan dibuat.';
    postStep();
  }));
  root.querySelectorAll('[data-ui]').forEach(btn=>btn.addEventListener('click',()=>handleUi(btn.dataset.ui)));
}

function runActivity(id){
  if(state.pendingEvent) return;
  const allowed=availableActivities(state).some(a=>a.id===id);
  if(!allowed) return;
  const result=executeActivity(state,id);
  if(result && typeof result==='object' && result.error){ ui.result=result.error; draw(); return; }
  state.playtest.actions=(state.playtest.actions||0)+1;
  ui.result=result;
  postStep();
}

function handleUi(action){
  if(action==='toggle-routine'){
    if(!state.flags.routineUnlocked) return;
    state.routine.enabled=!state.routine.enabled;
    ui.result=state.routine.enabled?'Rutinitas aktif. Aktivitas repetitif bisa berjalan saat kamu pergi.':'Rutinitas dimatikan.';
    persist(); draw(); return;
  }
  if(action==='simulate-offline'){
    if(!state.routine.enabled) return;
    const report=processOffline(4*60*60*1000);
    ui.offlineSummary=`<b>${report.gameHours} jam waktu game berlalu.</b><br>Perubahan uang: ${formatSignedMoney(report.moneyDelta)}${report.stopped?'<br>Ada keputusan penting yang menghentikan rutinitas.':''}`;
    draw(); return;
  }
  if(action==='close-offline'){ ui.offlineSummary=''; draw(); return; }
  if(action==='close-milestone'){ ui.milestone=false; draw(); return; }
  if(action==='close-chapter'){ ui.chapterProfile=null; draw(); return; }
  if(action==='reset'){
    if(confirm('Mulai ulang seluruh save Vertical Slice?')){
      clearState(); state=createInitialState(); ui.tab='life'; ui.result='Hidup baru dimulai.'; ui.offlineSummary=''; ui.milestone=false; ui.chapterProfile=null; postStep();
    }
    return;
  }
  if(action==='install' && deferredPrompt){
    deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;ui.installAvailable=false;draw()});
  }
}

function formatSignedMoney(value){
  const sign=value>0?'+':value<0?'-':'';
  return sign+'Rp'+Math.abs(Math.round(value)).toLocaleString('id-ID');
}

function processOffline(realMs){
  const capped=Math.min(Math.max(0,realMs),8*60*60*1000);
  const budget=Math.floor(capped/(60*60*1000)*6);
  const startHours=state.time.totalHours,startMoney=state.player.money;
  let consumed=0;
  state.playtest.offlineBatches=(state.playtest.offlineBatches||0)+1;
  while(consumed<budget && !state.pendingEvent){
    const before=state.time.totalHours;
    const remaining=budget-consumed;
    if(!state.player.job){
      if(remaining<4) break;
      const offlineAction=state.business?.active?'business_manage':(state.player.money>=20000?'study':'family');
      const result=executeActivity(state,offlineAction);
      if(result?.error) break;
    }else if(getCondition(state.player.fatigue).id==='exhausted'){
      if(remaining<8) break;
      executeActivity(state,'rest');
    }else if(remaining>=8){
      executeActivity(state,'work');
    }else if(remaining>=4 && state.player.money>=20000){
      executeActivity(state,'study');
    }else{
      break;
    }
    state.playtest.actions=(state.playtest.actions||0)+1;
    consumed+=state.time.totalHours-before;
    simulateWorld(state);
    resolveContestedOpportunities(state);
    expireOpportunities(state);
    processLivingCosts(state);
    if(state.career.workCount>=3) state.flags.routineUnlocked=true;
    refreshEvent(state);
  }
  checkMilestone();
  checkVerticalSliceOutcome();
  persist();
  return {gameHours:state.time.totalHours-startHours,moneyDelta:state.player.money-startMoney,stopped:!!state.pendingEvent};
}

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault(); deferredPrompt=event; ui.installAvailable=true; draw();
});
window.addEventListener('appinstalled',()=>{
  deferredPrompt=null; ui.installAvailable=false; addRecent(state,'Aplikasi berhasil di-install di perangkat ini.'); persist(); draw();
});

if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }

const elapsed=Date.now()-(state.lastSeen||Date.now());
if(state.routine.enabled && elapsed>45*60*1000){
  const report=processOffline(elapsed);
  if(report.gameHours>0) ui.offlineSummary=`<b>${report.gameHours} jam waktu game berlalu.</b><br>Perubahan uang: ${formatSignedMoney(report.moneyDelta)}${report.stopped?'<br>Ada keputusan penting yang menghentikan rutinitas.':''}`;
}
simulateWorld(state);
resolveContestedOpportunities(state);
expireOpportunities(state);
processLivingCosts(state);
refreshEvent(state);
checkVerticalSliceOutcome();
persist();
draw();
