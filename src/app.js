
function installZoomLock(){
  if(typeof document==='undefined'||typeof document.addEventListener!=='function') return;
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
  document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].includes(e.key))e.preventDefault();});
}
installZoomLock();
const root=document.getElementById('app');
const contentValidation=validateContentFramework();
if(typeof window!=='undefined'){
  window.__HIDUP_CONTENT_REPORT__=contentValidation;
  window.__HIDUP_CONTENT_CATALOG__=buildContentCatalog();
}
if(!contentValidation.ok) console.error('[Hidup] Content validation gagal',contentValidation.errors);
if(contentValidation.warnings.length) console.warn('[Hidup] Content warnings',contentValidation.warnings);

let prefs=applyPrefs(loadPrefs());
let state=loadState();
let deferredPrompt=null;
let swRegistration=null;
let reloadOnController=false;
let hadSaveAtLaunch=hasSavedState();
let gamePrepared=false;
if(hadSaveAtLaunch && !prefs.onboardingSeen){
  prefs=savePrefs({...prefs,onboardingSeen:true});
  prefs=applyPrefs(prefs);
}
const ui={
  screen:'menu',tab:'life',result:'Pilihanmu akan menentukan jalur yang mulai terbuka.',offlineSummary:'',
  milestone:false,chapterProfile:null,installAvailable:false,hasSave:hadSaveAtLaunch,prefs,
  prologueStep:0,confirm:null,feedback:null,updateAvailable:false,
  networkOnline:typeof navigator==='undefined'?true:navigator.onLine!==false
};

function persist(){
  saveState(state);
  ui.hasSave=true;
}

function postStep(){
  simulateWorld(state);
  syncPersonalFinance(state);
  syncCharacterStories(state);
  syncRelationshipStakes(state);
  syncEducationOpportunities(state);
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
  const techDepth=(state.player.job==='it_assistant' && (state.career.jobWorkCounts.it_assistant||0)>=3)||state.player.job==='network_technician';
  const cafeDepth=state.player.job==='cafe_lead'||(state.career.jobWorkCounts.cafe_crew||0)>=6;
  const logisticsDepth=state.player.job==='dispatch_coordinator'||(state.career.jobWorkCounts.warehouse_staff||0)>=6;
  const mixedDepth=(getSkillTier(state.skills.technology).id!=='novice' && getSkillTier(state.skills.social).id!=='novice') ||
    (getSkillTier(state.skills.mechanics).id!=='novice' && getSkillTier(state.skills.social).id!=='novice');
  if(mechanicDepth||storeDepth||techDepth||cafeDepth||logisticsDepth||mixedDepth){
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

function prepareGame({allowOffline=true}={}){
  if(gamePrepared) return;
  syncContentPackRuntime(state);
  if(allowOffline && ui.hasSave){
    const elapsed=Date.now()-(state.lastSeen||Date.now());
    if(state.routine.enabled && elapsed>45*60*1000){
      const report=processOffline(elapsed);
      if(report.gameHours>0) ui.offlineSummary=`<b>${report.gameHours} jam waktu game berlalu.</b><br>Perubahan uang: ${formatSignedMoney(report.moneyDelta)}${report.stopped?'<br>Ada keputusan penting yang menghentikan rutinitas.':''}`;
    }
  }
  simulateWorld(state);
  syncPersonalFinance(state);
  syncCharacterStories(state);
  syncRelationshipStakes(state);
  syncEducationOpportunities(state);
  resolveContestedOpportunities(state);
  expireOpportunities(state);
  processLivingCosts(state);
  refreshEvent(state);
  checkVerticalSliceOutcome();
  if(ui.hasSave) persist();
  gamePrepared=true;
}

function draw(){
  render(root,state,ui);
  bind();
}

function bind(){
  root.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{ui.tab=btn.dataset.tab;draw();}));
  root.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>runActivity(btn.dataset.action)));
  root.querySelectorAll('[data-housing-move]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const before=feedbackSnapshot(state);
    const result=moveHousing(state,btn.dataset.housingMove);
    if(result && typeof result==='object' && result.error){
      ui.result=result.error;
      ui.feedback={title:'Belum bisa pindah',message:String(result.error),details:[],tone:'warning'};
      draw();
      return;
    }
    state.playtest.actions=(state.playtest.actions||0)+1;
    ui.result=result;
    ui.feedback=buildFeedback(before,state,result,'Tempat tinggal berubah');
    postStep();
  }));
  root.querySelectorAll('[data-finance-lifestyle]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const before=feedbackSnapshot(state);
    const result=changeLifestyle(state,btn.dataset.financeLifestyle);
    if(result&&typeof result==='object'&&result.error){ui.feedback={title:'Belum bisa diubah',message:String(result.error),details:[],tone:'warning'};draw();return;}
    syncLivingCost(state);ui.result=result;ui.feedback=buildFeedback(before,state,result,'Gaya hidup diperbarui');persist();draw();
  }));
  root.querySelectorAll('[data-finance-transport]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const before=feedbackSnapshot(state);
    const result=selectTransport(state,btn.dataset.financeTransport);
    if(result&&typeof result==='object'&&result.error){ui.feedback={title:'Belum bisa digunakan',message:String(result.error),details:[],tone:'warning'};draw();return;}
    syncLivingCost(state);ui.result=result;ui.feedback=buildFeedback(before,state,result,'Transportasi diperbarui');persist();draw();
  }));
  root.querySelectorAll('[data-finance-deposit]').forEach(btn=>btn.addEventListener('click',()=>{
    const before=feedbackSnapshot(state);const result=moveEmergencyFund(state,Number(btn.dataset.financeDeposit));
    if(result&&typeof result==='object'&&result.error){ui.feedback={title:'Belum bisa disimpan',message:String(result.error),details:[],tone:'warning'};draw();return;}
    ui.result=result;ui.feedback=buildFeedback(before,state,result,'Dana darurat bertambah');persist();draw();
  }));
  root.querySelectorAll('[data-finance-withdraw]').forEach(btn=>btn.addEventListener('click',()=>{
    const before=feedbackSnapshot(state);const raw=btn.dataset.financeWithdraw;const result=raw==='all'?withdrawAllEmergencyFund(state):moveEmergencyFund(state,-Number(raw));
    if(result&&typeof result==='object'&&result.error){ui.feedback={title:'Belum bisa ditarik',message:String(result.error),details:[],tone:'warning'};draw();return;}
    ui.result=result;ui.feedback=buildFeedback(before,state,result,'Dana darurat ditarik');persist();draw();
  }));
  root.querySelectorAll('[data-city-visit]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const before=feedbackSnapshot(state);
    const result=visitCityLocation(state,btn.dataset.cityVisit);
    if(result && typeof result==='object' && result.error){
      ui.result=result.error;
      ui.feedback={title:'Belum bisa pergi',message:String(result.error),details:[],tone:'warning'};
      draw();
      return;
    }
    state.playtest.actions=(state.playtest.actions||0)+1;
    ui.result=result;
    ui.feedback=buildFeedback(before,state,result,'Kunjungan selesai');
    postStep();
  }));
  root.querySelectorAll('[data-opportunity]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.pendingEvent) return;
    const id=btn.dataset.opportunity;
    const existed=state.opportunities.some(x=>x.id===id);
    const oldJob=state.player.job;
    const before=feedbackSnapshot(state);
    ui.result=runOpportunity(state,id);
    if(existed && !state.opportunities.some(x=>x.id===id)){
      state.playtest.opportunitiesTaken=(state.playtest.opportunitiesTaken||0)+1;
      if(oldJob && state.player.job && oldJob!==state.player.job) state.playtest.careerChanges=(state.playtest.careerChanges||0)+1;
    }
    ui.feedback=buildFeedback(before,state,ui.result,'Peluang diambil');
    postStep();
  }));
  root.querySelectorAll('[data-event-choice]').forEach(btn=>btn.addEventListener('click',()=>{
    const choice=state.pendingEvent?.choices?.[Number(btn.dataset.eventChoice)];
    if(!choice) return;
    const before=feedbackSnapshot(state);
    applyEventChoice(state,choice);
    ui.result=choice.result||'Keputusan dibuat.';
    ui.feedback=buildFeedback(before,state,ui.result,'Keputusan dibuat');
    postStep();
  }));
  root.querySelectorAll('[data-ui]').forEach(btn=>btn.addEventListener('click',()=>handleUi(btn.dataset.ui)));
  root.querySelectorAll('[data-pref-theme]').forEach(btn=>btn.addEventListener('click',()=>updatePrefs({theme:btn.dataset.prefTheme})));
  root.querySelectorAll('[data-pref-text]').forEach(btn=>btn.addEventListener('click',()=>updatePrefs({textSize:btn.dataset.prefText})));
}

function feedbackSnapshot(source){
  return {
    money:source.player.money,
    fatigue:source.player.fatigue,
    hours:source.time.totalHours,
    condition:getCondition(source.player.fatigue).id,
    skills:{...source.skills}
  };
}

function buildFeedback(before,after,message,title='Aksi selesai'){
  const details=[];
  const hourDelta=Math.max(0,(after.time.totalHours||0)-(before.hours||0));
  const moneyDelta=(after.player.money||0)-(before.money||0);
  if(hourDelta>0) details.push(`${hourDelta} jam berlalu`);
  if(moneyDelta!==0) details.push(formatSignedMoney(moneyDelta));
  const skillNames={mechanics:'Mekanik',learning:'Belajar',social:'Sosial',technology:'Teknologi',hospitality:'Hospitality',logistics:'Logistik'};
  Object.keys(skillNames).forEach(id=>{
    if((after.skills[id]||0)>(before.skills[id]||0)) details.push(`${skillNames[id]} berkembang`);
  });
  const nowCondition=getCondition(after.player.fatigue).id;
  if(nowCondition!==before.condition){
    const rank={good:0,tired:1,exhausted:2};
    details.push(rank[nowCondition]>rank[before.condition]?'Kondisi lebih berat':'Kondisi membaik');
  }
  let tone='neutral';
  if(after.player.money<0 || nowCondition==='exhausted') tone='danger';
  else if(nowCondition==='tired' && before.condition==='good') tone='warning';
  else if(moneyDelta>0 || Object.keys(skillNames).some(id=>(after.skills[id]||0)>(before.skills[id]||0))) tone='positive';
  return {title,message:String(message||'Perubahan tersimpan.'),details:details.slice(0,4),tone};
}

function runActivity(id){
  if(state.pendingEvent) return;
  const allowed=availableActivities(state).some(a=>a.id===id);
  if(!allowed) return;
  const before=feedbackSnapshot(state);
  const result=executeActivity(state,id);
  if(result && typeof result==='object' && result.error){
    ui.result=result.error;
    ui.feedback={title:'Belum bisa dilakukan',message:String(result.error),details:[],tone:'warning'};
    draw();
    return;
  }
  state.playtest.actions=(state.playtest.actions||0)+1;
  ui.result=result;
  ui.feedback=buildFeedback(before,state,result,'Aksi selesai');
  postStep();
}

function requestStartNewLife(){
  if(ui.hasSave){
    ui.confirm={type:'new-life',title:'Mulai hidup baru?',text:`Hidup ${state.player.name||'Raka'} yang sekarang akan diganti setelah prolog selesai. Pengaturan tampilan tetap tersimpan.`};
    draw();
    return;
  }
  beginPrologue();
}

function beginPrologue(){
  ui.confirm=null;
  ui.prologueStep=0;
  ui.screen='prologue';
  draw();
}

function commitNewLife(){
  clearState();
  state=createInitialState();
  syncContentPackRuntime(state);
  ui.tab='life';
  ui.result='Hidup baru dimulai.';
  ui.offlineSummary='';
  ui.milestone=false;
  ui.chapterProfile=null;
  ui.feedback={title:'Hidup dimulai',message:'Umur 18. Belum ada pekerjaan tetap. Arah hidup masih terbuka.',details:[],tone:'neutral'};
  ui.confirm=null;
  gamePrepared=false;
  persist();
  prepareGame({allowOffline:false});
  ui.screen='game';
  draw();
}

function finishPrologue(){
  prefs=savePrefs({...prefs,onboardingSeen:true});
  prefs=applyPrefs(prefs);
  ui.prefs=prefs;
  commitNewLife();
}

function updatePrefs(patch){
  prefs=savePrefs({...prefs,...patch});
  prefs=applyPrefs(prefs);
  ui.prefs=prefs;
  draw();
}

function handleUi(action){
  if(action==='continue-game'){
    prepareGame({allowOffline:true});
    ui.screen='game';
    draw();
    return;
  }
  if(action==='start-new'){requestStartNewLife();return;}
  if(action==='confirm-new-life'){beginPrologue();return;}
  if(action==='cancel-confirm'){ui.confirm=null;draw();return;}
  if(action==='prologue-next'){
    ui.prologueStep=Math.min(1,(ui.prologueStep||0)+1);
    draw();return;
  }
  if(action==='prologue-back'){
    if((ui.prologueStep||0)<=0){ui.screen='menu';draw();return;}
    ui.prologueStep=Math.max(0,ui.prologueStep-1);draw();return;
  }
  if(action==='prologue-finish'||action==='prologue-skip'){finishPrologue();return;}
  if(action==='open-menu'){
    persist();
    ui.screen='menu';
    ui.confirm=null;
    draw();
    return;
  }
  if(action==='open-settings'){ui.screen='settings';draw();return;}
  if(action==='settings-back'){ui.screen='menu';draw();return;}
  if(action==='toggle-motion'){updatePrefs({motion:!prefs.motion});return;}
  if(action==='close-feedback'){ui.feedback=null;draw();return;}
  if(action==='toggle-routine'){
    if(!state.flags.routineUnlocked) return;
    state.routine.enabled=!state.routine.enabled;
    ui.result=state.routine.enabled?'Rutinitas aktif. Aktivitas repetitif bisa berjalan saat kamu pergi.':'Rutinitas dimatikan.';
    ui.feedback={title:state.routine.enabled?'Rutinitas aktif':'Rutinitas berhenti',message:ui.result,details:[],tone:'neutral'};
    persist();draw();return;
  }
  if(action==='simulate-offline'){
    if(!state.routine.enabled) return;
    const report=processOffline(4*60*60*1000);
    ui.offlineSummary=`<b>${report.gameHours} jam waktu game berlalu.</b><br>Perubahan uang: ${formatSignedMoney(report.moneyDelta)}${report.stopped?'<br>Ada keputusan penting yang menghentikan rutinitas.':''}`;
    draw();return;
  }
  if(action==='close-offline'){ui.offlineSummary='';draw();return;}
  if(action==='close-milestone'){ui.milestone=false;draw();return;}
  if(action==='close-chapter'){ui.chapterProfile=null;draw();return;}
  if(action==='install' && deferredPrompt){
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;ui.installAvailable=false;draw();});
    return;
  }
  if(action==='apply-update'){
    const waiting=swRegistration?.waiting;
    if(waiting){
      reloadOnController=true;
      waiting.postMessage({type:'SKIP_WAITING'});
    }else if(typeof location!=='undefined') location.reload();
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
    syncPersonalFinance(state);
    syncCharacterStories(state);
    syncRelationshipStakes(state);
    syncEducationOpportunities(state);
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

function registerServiceWorker(){
  if(typeof navigator==='undefined'||!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    swRegistration=reg;
    if(reg.waiting && navigator.serviceWorker.controller){ui.updateAvailable=true;draw();}
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;
      if(!worker) return;
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed' && navigator.serviceWorker.controller){
          ui.updateAvailable=true;
          draw();
        }
      });
    });
    reg.update().catch(()=>{});
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloadOnController && typeof location!=='undefined') location.reload();
  });
}

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();deferredPrompt=event;ui.installAvailable=true;draw();
});
window.addEventListener('appinstalled',()=>{
  deferredPrompt=null;ui.installAvailable=false;
  if(ui.hasSave){addRecent(state,'Aplikasi berhasil di-install di perangkat ini.');persist();}
  draw();
});
window.addEventListener('online',()=>{ui.networkOnline=true;draw();});
window.addEventListener('offline',()=>{ui.networkOnline=false;draw();});

if(window.matchMedia){
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  const listener=()=>{if(prefs.theme==='system'){prefs=applyPrefs(prefs);draw();}};
  if(mq.addEventListener) mq.addEventListener('change',listener); else if(mq.addListener) mq.addListener(listener);
}

registerServiceWorker();
if(ui.hasSave) prepareGame({allowOffline:true});
draw();
