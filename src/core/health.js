function clampHealth(value,min=0,max=100){ return Math.max(min,Math.min(max,Number(value)||0)); }

function ensureHealthState(state){
  const base={stress:12,rhythm:58,lastProcessedAt:state.time?.totalHours||0,lastRecoveryAt:state.time?.totalHours||0,lastActionAt:state.time?.totalHours||0,lastAction:'start',workSinceRecovery:0,consecutivePressureDays:0,illness:null,illnessUntil:null,illnessStartedAt:null,illnessEventAt:null,pressureEventAt:-9999,sickCount:0};
  state.health=state.health||{};
  for(const [key,value] of Object.entries(base)) if(state.health[key]===undefined) state.health[key]=value;
  const h=state.health;
  h.stress=clampHealth(h.stress);
  h.rhythm=clampHealth(h.rhythm);
  if(!Number.isFinite(h.lastProcessedAt)) h.lastProcessedAt=state.time?.totalHours||0;
  if(!Number.isFinite(h.lastRecoveryAt)) h.lastRecoveryAt=state.time?.totalHours||0;
  if(!Number.isFinite(h.lastActionAt)) h.lastActionAt=state.time?.totalHours||0;
  if(!Number.isFinite(h.workSinceRecovery)) h.workSinceRecovery=0;
  if(!Number.isFinite(h.consecutivePressureDays)) h.consecutivePressureDays=0;
  if(!Number.isFinite(h.pressureEventAt)) h.pressureEventAt=-9999;
  if(!Number.isFinite(h.sickCount)) h.sickCount=0;
  return h;
}
function healthStressLabel(value){
  const v=Number(value)||0;
  if(v>=85) return {id:'overwhelmed',label:'Kewalahan',tone:'danger'};
  if(v>=68) return {id:'high',label:'Tertekan',tone:'warning'};
  if(v>=42) return {id:'managed',label:'Padat',tone:'info'};
  if(v>=22) return {id:'steady',label:'Terkendali',tone:'neutral'};
  return {id:'calm',label:'Tenang',tone:'positive'};
}

function healthRhythmLabel(value){
  const v=Number(value)||0;
  if(v>=72) return {id:'good',label:'Terjaga',tone:'positive'};
  if(v>=48) return {id:'okay',label:'Cukup',tone:'neutral'};
  if(v>=28) return {id:'fragile',label:'Goyah',tone:'warning'};
  return {id:'broken',label:'Berantakan',tone:'danger'};
}

function healthIllnessActive(state){
  const h=ensureHealthState(state);
  return !!h.illness;
}

function healthIllnessLabel(state){
  const h=ensureHealthState(state);
  if(!h.illness) return {id:'well',label:'Fit',tone:'positive'};
  if(h.illness==='run_down') return {id:'run_down',label:'Kurang enak badan',tone:'warning'};
  return {id:'unwell',label:'Perlu pulih',tone:'warning'};
}

function activeRelationshipCommitment(state){
  const records=state.relationshipStakes?.records||{};
  return Object.values(records).some(r=>r&&r.status==='active');
}

function healthPressureSnapshot(state){
  const h=ensureHealthState(state);
  const contributors=[];
  let score=8;
  const fatigue=state.player?.fatigue||0;
  if(fatigue>=70){score+=24;contributors.push('kelelahan');}
  else if(fatigue>=30){score+=9;contributors.push('tenaga menurun');}
  const finance=typeof financialState==='function'?financialState(state):null;
  if(finance?.id==='debt'){score+=20;contributors.push('utang');}
  else if(finance?.id==='tight'){score+=9;contributors.push('keuangan seret');}
  const company=typeof currentWorkplaceSnapshot==='function'?currentWorkplaceSnapshot(state):null;
  if(company?.pressure>=74){score+=14;contributors.push('kerja sangat padat');}
  else if(company?.pressure>=62){score+=7;contributors.push('kerja padat');}
  if(state.business?.active){score+=state.business.ownerFullTime?9:5;contributors.push(state.business.ownerFullTime?'usaha penuh waktu':'usaha sampingan');}
  if(state.business?.helperIssuePending){score+=8;contributors.push('masalah usaha');}
  if(activeRelationshipCommitment(state)){score+=5;contributors.push('janji aktif');}
  const strain=Object.values(state.relationshipStakes?.strain||{}).reduce((a,b)=>a+(Number(b)||0),0);
  if(strain>=12){score+=7;contributors.push('hubungan renggang');}
  if(state.player?.job&&typeof effectiveWorkCommuteHours==='function'){
    const job=JOBS?.[state.player.job];
    if(job){const commute=effectiveWorkCommuteHours(state,job.workplaceId);if(commute>=2){score+=6;contributors.push('perjalanan panjang');}else if(commute>=1) score+=2;}
  }
  if(h.illness){score+=10;contributors.push('tubuh belum pulih');}
  if((h.workSinceRecovery||0)>=4){score+=8;contributors.push('terlalu lama tanpa jeda');}
  if(state.finance?.lifestyle==='comfortable') score-=2;
  if(typeof lifePressureModifier==='function') score+=lifePressureModifier(state);
  if(typeof partnershipPressureModifier==='function') score+=partnershipPressureModifier(state);
  if(typeof familyPressureModifier==='function'){const fp=familyPressureModifier(state);score+=fp;if(fp>0)contributors.push('ritme keluarga');}
  score=clampHealth(score,0,100);
  return {score,contributors:[...new Set(contributors)].slice(0,4),label:score>=70?'Berat':score>=48?'Tinggi':score>=28?'Sedang':'Ringan'};
}

function startMinorIllness(state){
  const h=ensureHealthState(state);
  if(h.illness) return false;
  h.illness='run_down';
  h.illnessStartedAt=state.time.totalHours;
  h.illnessUntil=state.time.totalHours+48;
  h.illnessEventAt=null;
  h.sickCount=(h.sickCount||0)+1;
  h.stress=clampHealth(h.stress+4);
  h.rhythm=clampHealth(h.rhythm-7);
  if(typeof addRecent==='function') addRecent(state,'Tubuhmu mulai drop setelah ritme hidup terlalu padat.');
  return true;
}

function clearMinorIllness(state,forced=false){
  const h=ensureHealthState(state);
  if(!h.illness) return false;
  h.illness=null;
  h.illnessUntil=null;
  h.illnessStartedAt=null;
  h.illnessEventAt=null;
  h.workSinceRecovery=0;
  h.rhythm=clampHealth(h.rhythm+(forced?10:5));
  if(typeof addRecent==='function') addRecent(state,'Kondisi tubuhmu kembali stabil.');
  return true;
}

function processHealth(state){
  const h=ensureHealthState(state);
  const now=state.time.totalHours||0;
  if(h.lastProcessedAt>now) h.lastProcessedAt=now;
  let changed=false;
  while(now-h.lastProcessedAt>=24){
    h.lastProcessedAt+=24;
    const pressure=healthPressureSnapshot(state).score;
    if(pressure>=70) h.stress+=9;
    else if(pressure>=48) h.stress+=5;
    else if(pressure>=28) h.stress+=2;
    else h.stress-=5;
    if((state.player.fatigue||0)>=70){h.stress+=4;h.rhythm-=6;}
    else if((state.player.fatigue||0)<25){h.rhythm+=3;}
    if(h.stress>=75) h.rhythm-=3;
    if(now-(h.lastRecoveryAt||0)<=48) h.rhythm+=2;
    const sustainedPressure=pressure>=48 || (((state.player.fatigue||0)>=70) && h.stress>=68);
    h.consecutivePressureDays=sustainedPressure?(h.consecutivePressureDays||0)+1:Math.max(0,(h.consecutivePressureDays||0)-1);
    h.stress=clampHealth(h.stress);
    h.rhythm=clampHealth(h.rhythm);
    changed=true;
    if(!h.illness && (state.player.fatigue||0)>=72 && h.stress>=68 && h.consecutivePressureDays>=2) startMinorIllness(state);
  }
  if(h.illness && Number.isFinite(h.illnessUntil) && now>=h.illnessUntil){
    if((state.player.fatigue||0)<=55 && h.stress<=68) clearMinorIllness(state,false);
    else h.illnessUntil=now+12;
    changed=true;
  }
  return changed;
}

function recordHealthAction(state,action){
  const h=ensureHealthState(state);
  const now=state.time.totalHours||0;
  h.lastAction=action;
  h.lastActionAt=now;
  if(action==='rest'||action==='recover'){
    h.stress=clampHealth(h.stress-(action==='recover'?22:13));
    h.rhythm=clampHealth(h.rhythm+(action==='recover'?15:9));
    h.workSinceRecovery=0;
    h.lastRecoveryAt=now;
    if(action==='recover'&&h.illness) clearMinorIllness(state,true);
  }else if(action==='work'){
    h.workSinceRecovery=(h.workSinceRecovery||0)+1;
    h.stress=clampHealth(h.stress+(h.workSinceRecovery>=4?5:2));
    h.rhythm=clampHealth(h.rhythm-1);
  }else if(action==='business_manage'){
    h.workSinceRecovery=(h.workSinceRecovery||0)+1;
    h.stress=clampHealth(h.stress+3);
    h.rhythm=clampHealth(h.rhythm-1);
  }else if(action==='study'){
    h.stress=clampHealth(h.stress+(h.stress>=68?2:1));
  }else if(action==='family'||action==='rian'||action==='social'||action==='parenting_time'){
    h.stress=clampHealth(h.stress-5);
    h.rhythm=clampHealth(h.rhythm+2);
  }else if(action==='city:gym_sehat'){
    h.stress=clampHealth(h.stress-15);
    h.rhythm=clampHealth(h.rhythm+9);
    h.workSinceRecovery=Math.max(0,(h.workSinceRecovery||0)-2);
    h.lastRecoveryAt=now;
  }else if(action==='city:kafe_senja'){
    h.stress=clampHealth(h.stress-7);
    h.rhythm=clampHealth(h.rhythm+3);
  }else if(String(action).startsWith('city:')){
    h.stress=clampHealth(h.stress-2);
    h.rhythm=clampHealth(h.rhythm+1);
  }else if(action==='opportunity'){
    h.stress=clampHealth(h.stress+2);
  }
  processHealth(state);
}

function healthActionFatigueModifier(state,type){
  const h=ensureHealthState(state);
  let extra=0;
  if(h.stress>=85) extra+=4;
  else if(h.stress>=68) extra+=2;
  if(h.illness) extra+=type==='work'||type==='business'?5:2;
  return extra;
}

function healthXpMultiplier(state){
  const h=ensureHealthState(state);
  let mult=1;
  if(h.stress>=85) mult-=.15;
  else if(h.stress>=68) mult-=.08;
  if(h.illness) mult-=.12;
  return Math.max(.65,mult);
}

function recoverHealthActivity(state){
  const h=ensureHealthState(state);
  if(!h.illness && h.stress<55 && (state.player.fatigue||0)<45) return {error:'Kondisimu belum membutuhkan satu blok waktu khusus untuk pulih.'};
  state.time.totalHours+=h.illness?10:4;
  state.player.fatigue=Math.max(0,state.player.fatigue-(h.illness?38:16));
  recordHealthAction(state,h.illness?'recover':'rest');
  return h.illness?'Kamu benar-benar mengosongkan waktu untuk tidur, makan, dan memulihkan diri.':'Kamu mengurangi ritme beberapa jam sebelum tekanan berubah jadi masalah yang lebih besar.';
}

function healthNeedsUrgentAttention(state){
  const h=ensureHealthState(state);
  const illnessUnseen=h.illness && h.illnessStartedAt!==null && h.illnessEventAt!==h.illnessStartedAt;
  const pressureDue=h.stress>=88 && state.time.totalHours-(h.pressureEventAt||-9999)>=7*24;
  return !!illnessUnseen || pressureDue;
}

function getNextHealthEvent(state){
  const h=ensureHealthState(state);
  if(h.illness && h.illnessStartedAt!==null && h.illnessEventAt!==h.illnessStartedAt){
    h.illnessEventAt=h.illnessStartedAt;
    return event('health_run_down','KONDISI','Tubuhmu Mulai Drop','Beberapa hari terakhir terlalu padat. Ini bukan keadaan darurat, tapi tubuhmu jelas minta ritme yang lebih pelan sebelum semuanya makin berat.',[
      {label:'Ambil waktu untuk pulih',hint:'10j · turunkan lelah & tekanan',effects:[{type:'hours',value:10},{type:'fatigue',value:-38},{type:'health_recover'}],result:'Kamu mengosongkan waktu untuk benar-benar pulih. Tidak produktif hari ini, tapi ritme hidupmu kembali punya ruang.'},
      {label:'Jalan lebih pelan dulu',hint:'4j · pulih sebagian',effects:[{type:'hours',value:4},{type:'fatigue',value:-15},{type:'health_stress',value:-10},{type:'health_rhythm',value:6}],result:'Kamu tidak berhenti total, tapi sengaja menurunkan beban. Tubuhmu belum pulih penuh.'}
    ]);
  }
  if(h.stress>=82 && state.time.totalHours-(h.pressureEventAt||-9999)>=7*24){
    h.pressureEventAt=state.time.totalHours;
    return event('health_pressure_peak','RITME HIDUP','Semuanya Mulai Terasa Bersamaan','Kerja, uang, hubungan, perjalanan, atau usaha mulai menumpuk di kepala. Kamu masih bisa terus jalan, tapi ritmemu jelas tidak sustainable kalau dibiarkan.',[
      {label:'Kosongkan beberapa jam',hint:'4j · turunkan tekanan',effects:[{type:'hours',value:4},{type:'fatigue',value:-12},{type:'health_stress',value:-18},{type:'health_rhythm',value:10}],result:'Kamu sengaja tidak mengisi semua waktu kosong dengan produktivitas. Tekanan mulai turun.'},
      {label:'Tetap gas',hint:'Tidak kehilangan waktu · risiko kondisi memburuk',effects:[{type:'health_stress',value:9},{type:'health_rhythm',value:-7},{type:'fatigue',value:4}],result:'Kamu memilih mempertahankan semua komitmen. Hari ini terselamatkan, tapi tubuhmu menyimpan biayanya.'}
    ]);
  }
  return null;
}

function healthSnapshot(state){
  const h=ensureHealthState(state);
  const stress=healthStressLabel(h.stress);
  const rhythm=healthRhythmLabel(h.rhythm);
  const illness=healthIllnessLabel(state);
  const pressure=healthPressureSnapshot(state);
  return {stress,rhythm,illness,pressure,stressValue:h.stress,rhythmValue:h.rhythm,canRecover:h.illness||h.stress>=55||(state.player.fatigue||0)>=45};
}
