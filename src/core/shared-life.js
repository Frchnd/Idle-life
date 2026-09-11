function ensureSharedLifeState(state){
  const base={
    planning:false,cohabiting:false,partner:null,homeId:null,sharedSinceAt:null,
    agreement:'balanced',lastAgreementAt:-9999,lastTalkAt:-9999,deferredUntil:-9999,
    stage:'none',engagedAt:null,marriedAt:null,lastMilestoneAt:-9999,
    conflict:0,lastConflictAt:-9999,lastConflictNoticeWeek:-999,lastProcessedWeek:0,householdWeeks:0
  };
  if(!state.sharedLife||typeof state.sharedLife!=='object') state.sharedLife={};
  const s=state.sharedLife;
  for(const [key,value] of Object.entries(base)) if(s[key]===undefined) s[key]=value;
  if(!SHARED_LIFE_AGREEMENTS[s.agreement]) s.agreement='balanced';
  if(!['none','engaged','married'].includes(s.stage)) s.stage='none';
  s.conflict=Math.max(0,Math.min(3,Number(s.conflict)||0));
  s.householdWeeks=Math.max(0,Number(s.householdWeeks)||0);
  s.lastProcessedWeek=Math.max(0,Number(s.lastProcessedWeek)||0);
  if(s.cohabiting && !s.partner) s.partner=ensurePartnershipState(state).partner||null;
  return s;
}

function sharedLifeProfile(state){
  const p=ensurePartnershipState(state),id=p.partner||p.candidate||ensureSharedLifeState(state).partner;
  return id?SHARED_LIFE_PROFILES[id]||null:null;
}

function sharedLifeAgreement(state){
  const s=ensureSharedLifeState(state);
  return SHARED_LIFE_AGREEMENTS[s.agreement]||SHARED_LIFE_AGREEMENTS.balanced;
}

function sharedLifePlayerShare(state){
  if(!ensureSharedLifeState(state).cohabiting) return 1;
  return sharedLifeAgreement(state).playerShare;
}

function adjustSharedLivingCosts(state,fullHousing,fullLifestyle){
  const s=ensureSharedLifeState(state);
  if(!s.cohabiting) return {housing:fullHousing,lifestyle:fullLifestyle,partnerContribution:0,playerShare:1};
  const share=sharedLifePlayerShare(state);
  const housing=Math.round(fullHousing*share/10000)*10000;
  const lifestyle=Math.round(fullLifestyle*(.55+.45*share)/10000)*10000;
  const partnerContribution=Math.max(0,(fullHousing+fullLifestyle)-(housing+lifestyle));
  return {housing,lifestyle,partnerContribution,playerShare:share};
}

function sharedLifePartnerCommuteForMeta(state,meta){
  const profile=sharedLifeProfile(state);
  if(!profile||!meta) return 0;
  if(profile.workplaceId) return Math.max(0,Number(meta.commute?.[profile.workplaceId]||0));
  if(profile.locationId) return Math.max(0,Number(meta.cityTravel?.[profile.locationId]||0));
  return 0;
}

function sharedLifePartnerCommute(state){
  return sharedLifePartnerCommuteForMeta(state,housingMeta(state));
}

function sharedLifeRakaCommute(state){
  if(!state.player?.job) return 0;
  const job=JOBS[state.player.job];
  return job?effectiveWorkCommuteHours(state,job.workplaceId):0;
}

function sharedLifeHomeFit(state,meta){
  const raka=state.player?.job?financeCommuteForHousingMeta(state,meta,JOBS[state.player.job]?.workplaceId):0;
  const partner=sharedLifePartnerCommuteForMeta(state,meta);
  const total=raka+partner;
  return {raka,partner,total,label:total<=1?'Cocok untuk dua rutinitas':total<=3?'Masih seimbang':'Salah satu akan banyak perjalanan'};
}

function sharedLifeMoveCost(state,id){
  if(state.housing?.id===id) return 250000;
  return housingDeposit(state,id);
}

function planSharedHome(state){
  const p=ensurePartnershipState(state),s=ensureSharedLifeState(state);
  if(p.status!=='committed'||!p.partner) return false;
  s.planning=true;s.partner=p.partner;s.lastTalkAt=state.time.totalHours;s.deferredUntil=-9999;
  addRecent(state,`Kamu dan ${PARTNERSHIP_CANDIDATES[p.partner]?.name||'pasanganmu'} mulai benar-benar mempertimbangkan tempat tinggal bersama.`);
  return true;
}

function deferSharedLife(state,days=30){
  const s=ensureSharedLifeState(state);
  s.lastTalkAt=state.time.totalHours;s.deferredUntil=state.time.totalHours+days*24;
  addRecent(state,'Kalian sepakat belum menyatukan tempat tinggal. Hubungan tetap serius tanpa harus buru-buru mengubah rumah.');
  return true;
}

function moveInTogether(state,id){
  const p=ensurePartnershipState(state),s=ensureSharedLifeState(state),def=PARTNERSHIP_CANDIDATES[p.partner];
  const target=HOUSING_OPTIONS[id];
  if(!def||p.status!=='committed') return {error:'Hubungan belum berada di tahap untuk tinggal bersama.'};
  if(!s.planning && !s.cohabiting && s.stage==='none') return {error:'Kalian belum membicarakan tinggal bersama.'};
  if(!target||!SHARED_LIFE_HOMES.includes(id)) return {error:'Tempat tinggal itu belum cocok untuk rencana hidup bersama.'};
  const cost=sharedLifeMoveCost(state,id);
  if(state.player.money<cost) return {error:`Butuh Rp${cost.toLocaleString('id-ID')} untuk menyiapkan tempat tinggal bersama.`};
  const sameHome=state.housing?.id===id;
  const alreadyCohabiting=!!s.cohabiting,previousAgreement=s.agreement,previousSharedSince=s.sharedSinceAt,previousAgreementAt=s.lastAgreementAt;
  state.player.money-=cost;
  state.time.totalHours+=sameHome?4:(target.moveHours||6);
  if(!sameHome){
    state.housing={id:target.id,label:target.label,neighborhood:target.neighborhood,monthlyCost:target.monthlyCost,baseMonthlyCost:target.monthlyCost,movedAt:state.time.totalHours,moves:(state.housing?.moves||0)+1};
  }
  state.player.statuses=state.player.statuses.filter(x=>!['tinggal_bersama_keluarga','tinggal_sendiri','tinggal_bersama_penghuni','tinggal_tepi_kota'].includes(x));
  if(!state.player.statuses.includes('tinggal_bersama_pasangan')) state.player.statuses.push('tinggal_bersama_pasangan');
  s.planning=true;s.cohabiting=true;s.partner=p.partner;s.homeId=id;s.sharedSinceAt=alreadyCohabiting?(previousSharedSince||state.time.totalHours):state.time.totalHours;s.agreement=alreadyCohabiting?previousAgreement:'balanced';s.lastAgreementAt=alreadyCohabiting?previousAgreementAt:-9999;s.conflict=alreadyCohabiting?s.conflict:0;s.lastProcessedWeek=state.world?.week||0;
  state.relationships[p.partner]=(state.relationships[p.partner]||0)+4;
  p.trust+=3;p.lastSharedAt=state.time.totalHours;
  if(typeof syncLivingCost==='function') syncLivingCost(state);
  addHistory(state,`Umur 18 · Mulai tinggal bersama ${def.name} di ${target.name}.`);
  addRecent(state,`Kamu dan ${def.name} sekarang berbagi satu rumah. Biaya jadi lebih ringan, tapi jadwal dan kompromi harian mulai punya bobot baru.`);
  return `Mulai tinggal bersama di ${target.name} · biaya persiapan Rp${cost.toLocaleString('id-ID')}.`;
}

function sharedAgreementCooldownLeft(state){
  const s=ensureSharedLifeState(state);
  return Math.max(0,30*24-(state.time.totalHours-(s.lastAgreementAt||-9999)));
}

function changeSharedAgreement(state,id){
  const s=ensureSharedLifeState(state),p=ensurePartnershipState(state);
  const def=SHARED_LIFE_AGREEMENTS[id];
  if(!s.cohabiting) return {error:'Kalian belum tinggal bersama.'};
  if(!def) return {error:'Kesepakatan biaya itu tidak dikenal.'};
  if(s.agreement===id) return {error:'Itu sudah menjadi pembagian biaya kalian.'};
  const left=sharedAgreementCooldownLeft(state);
  if(left>0) return {error:`Pembagian biaya baru bisa dibicarakan lagi sekitar ${Math.ceil(left/24)} hari lagi.`};
  state.time.totalHours+=1;
  s.agreement=id;s.lastAgreementAt=state.time.totalHours;s.conflict=Math.max(0,s.conflict-1);
  if(p.partner) state.relationships[p.partner]=(state.relationships[p.partner]||0)+1;
  if(typeof syncLivingCost==='function') syncLivingCost(state);
  addRecent(state,`Pembagian biaya rumah berubah menjadi “${def.name}”.`);
  return `Kalian menyepakati pembagian biaya baru · ${def.name}.`;
}

function engagePartnership(state){
  const s=ensureSharedLifeState(state),p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[p.partner];
  if(!def||p.status!=='committed'||s.stage!=='none') return false;
  s.stage='engaged';s.engagedAt=state.time.totalHours;s.lastMilestoneAt=state.time.totalHours;s.deferredUntil=-9999;
  p.trust+=4;state.relationships[p.partner]=(state.relationships[p.partner]||0)+4;
  if(!state.player.statuses.includes('bertunangan')) state.player.statuses.push('bertunangan');
  addHistory(state,`Umur 18 · Bertunangan dengan ${def.name}.`);
  addRecent(state,`Kamu dan ${def.name} sepakat membawa hubungan ini ke pertunangan—bukan sebagai ending, tapi sebagai keputusan hidup berikutnya.`);
  return true;
}

function marryPartnership(state){
  const s=ensureSharedLifeState(state),p=ensurePartnershipState(state),def=PARTNERSHIP_CANDIDATES[p.partner];
  const cost=750000;
  if(!def||p.status!=='committed'||s.stage!=='engaged'||state.player.money<cost) return false;
  state.player.money-=cost;state.time.totalHours+=8;
  s.stage='married';s.marriedAt=state.time.totalHours;s.lastMilestoneAt=state.time.totalHours;s.deferredUntil=-9999;
  p.trust+=5;state.relationships[p.partner]=(state.relationships[p.partner]||0)+5;
  state.player.statuses=state.player.statuses.filter(x=>x!=='bertunangan');
  if(!state.player.statuses.includes('menikah')) state.player.statuses.push('menikah');
  addHistory(state,`Umur 18 · Menikah dengan ${def.name} dalam perayaan sederhana.`);
  addRecent(state,`Kamu dan ${def.name} menikah. Kehidupan bersama tetap harus dijalani hari demi hari—sekarang dengan komitmen yang lebih jelas.`);
  return true;
}

function deferSharedMilestone(state,days=30){
  const s=ensureSharedLifeState(state);
  s.deferredUntil=state.time.totalHours+days*24;s.lastMilestoneAt=state.time.totalHours;
  addRecent(state,'Kalian memilih menunda langkah besar. Menunggu juga bisa menjadi keputusan yang sehat.');
  return true;
}

function adjustSharedConflict(state,value){
  const s=ensureSharedLifeState(state);
  s.conflict=Math.max(0,Math.min(3,s.conflict+Number(value||0)));
  s.lastConflictAt=state.time.totalHours;
  return s.conflict;
}

function processSharedLife(state){
  const s=ensureSharedLifeState(state),p=ensurePartnershipState(state);
  if(!s.cohabiting||!p.partner) return s;
  const currentWeek=Math.max(0,Number(state.world?.week)||0);
  if(currentWeek<=s.lastProcessedWeek) return s;
  const profile=sharedLifeProfile(state),agreement=sharedLifeAgreement(state);
  for(let week=s.lastProcessedWeek+1;week<=currentWeek;week++){
    s.householdWeeks+=1;
    let pressure=0;
    const rakaCommute=sharedLifeRakaCommute(state),partnerCommute=sharedLifePartnerCommute(state);
    if(rakaCommute+partnerCommute>=4) pressure+=1;
    if(state.player.money<0) pressure+=1;
    if(p.strain>=2) pressure+=1;
    if(agreement.playerShare<.5 && profile && (1-agreement.playerShare)>profile.contributionCapacity+.05) pressure+=1;
    const recentlyTogether=state.time.totalHours-(p.lastSharedAt||0)<=8*24;
    if(pressure>=2) s.conflict=Math.min(3,s.conflict+1);
    else if(pressure===0 && recentlyTogether) s.conflict=Math.max(0,s.conflict-1);
    if(s.conflict===0 && week%2===0){p.trust+=1;state.relationships[p.partner]=(state.relationships[p.partner]||0)+1;}
    if(typeof ensureHealthState==='function'){
      const h=ensureHealthState(state);
      h.stress=clampHealth(h.stress+(s.conflict>=2?2:s.conflict===0?-1:0));
    }
    if(s.conflict>=2 && (s.lastConflictNoticeWeek<0 || week-s.lastConflictNoticeWeek>=4)){
      s.lastConflictNoticeWeek=week;
      addRecent(state,'Rutinitas rumah mulai terasa berat. Bukan krisis, tapi ada hal yang perlu dibicarakan sebelum jadi kebiasaan.');
    }
  }
  s.lastProcessedWeek=currentWeek;
  return s;
}

function sharedLifePressureModifier(state){
  const s=ensureSharedLifeState(state);
  if(!s.cohabiting) return 0;
  if(s.conflict>=3) return 7;
  if(s.conflict===2) return 4;
  if(s.conflict===0) return -3;
  return 0;
}

function sharedLifeSnapshot(state){
  const s=ensureSharedLifeState(state),p=ensurePartnershipState(state),profile=sharedLifeProfile(state);
  if(!p.partner||p.status!=='committed') return null;
  const home=s.cohabiting?housingMeta(state):null;
  const fullHousing=home?housingCurrentMonthlyCost(state):0;
  const fullLifestyle=typeof lifestyleMonthlyCost==='function'?lifestyleMonthlyCost(state):0;
  const split=adjustSharedLivingCosts(state,fullHousing,fullLifestyle);
  return {
    ...s,partnerName:PARTNERSHIP_CANDIDATES[p.partner]?.name||p.partner,profile,
    agreementLabel:sharedLifeAgreement(state).name,playerShare:sharedLifePlayerShare(state),home,
    playerMonthlyHousing:split.housing,partnerContribution:split.partnerContribution,
    rakaCommute:s.cohabiting?sharedLifeRakaCommute(state):0,partnerCommute:s.cohabiting?sharedLifePartnerCommute(state):0,
    conflictLabel:s.conflict>=3?'Banyak gesekan':s.conflict===2?'Perlu dibicarakan':s.conflict===1?'Sedang menyesuaikan':'Ritme selaras',
    stageLabel:s.stage==='married'?'Menikah':s.stage==='engaged'?'Bertunangan':'Hubungan serius'
  };
}

function getNextSharedLifeEvent(state){
  const p=ensurePartnershipState(state),s=ensureSharedLifeState(state),now=state.time.totalHours,age=getCalendar(now).age;
  if(state.pendingEvent||p.status!=='committed'||!p.partner) return null;
  const def=PARTNERSHIP_CANDIDATES[p.partner]; if(!def) return null;
  if(!s.planning&&!s.cohabiting&&age>=21&&p.dates>=8&&p.trust>=24&&(state.relationships[p.partner]||0)>=75&&p.strain<=1&&now>=s.deferredUntil&&now-(s.lastTalkAt||-9999)>=10*24){
    s.lastTalkAt=now;
    return {id:'shared_life_home_talk',type:'FASE HIDUP',title:`Apakah Sudah Waktunya Berbagi Rumah?`,art:def.image,artAlt:def.name,text:`Hubungan dengan ${def.name} sekarang cukup serius untuk mulai menyentuh keputusan yang sangat biasa sekaligus besar: alamat pulang. Tinggal bersama bisa meringankan biaya dan membuat waktu lebih dekat—tapi commute, uang, dan kebiasaan dua orang juga akan bertemu setiap hari.`,choices:[
      {label:'Mulai cari tempat untuk berdua',hint:'Buka pilihan tinggal bersama di KAMU',effects:[{type:'shared_life_plan'}],result:'Kalian nggak langsung pindah. Kalian sepakat mulai melihat tempat tinggal sebagai keputusan bersama.'},
      {label:'Tetap tinggal terpisah dulu',hint:'Tidak ada penalti · bicarakan lagi nanti',effects:[{type:'shared_life_defer',days:30}],result:'Hubungan tetap serius. Kalian memilih belum menyatukan rumah hanya karena “sudah waktunya”.'}
    ]};
  }
  if(s.cohabiting&&s.conflict>=2&&now-(s.lastConflictAt||-9999)>=7*24){
    s.lastConflictAt=now;
    return {id:'shared_life_routine_conflict',type:'HUBUNGAN',title:'Rumah Mulai Terasa Seperti Jadwal',art:def.image,artAlt:def.name,text:`Beberapa minggu terakhir, pekerjaan, perjalanan, biaya, dan waktu istirahat saling tumpang tindih. Nggak ada ledakan besar—justru itu masalahnya. Gesekan kecil mulai terasa normal.`,choices:[
      {label:'Atur ulang ritme bersama',hint:'4j · kurangi konflik dan tekanan',effects:[{type:'hours',value:4},{type:'relationship',target:p.partner,value:3},{type:'shared_life_conflict',value:-2},{type:'partnership_shared_direct',hours:4,trust:2},{type:'health_stress',value:-7}],result:'Kalian sengaja membahas hal-hal membosankan: jam pulang, waktu sendiri, pekerjaan rumah, dan kapan harus bilang capek. Justru itu yang membuat rumah kembali terasa ringan.'},
      {label:'Kembali ke pembagian biaya seimbang',hint:'1j · kurangi satu sumber gesekan',effects:[{type:'shared_life_agreement',agreement:'balanced',force:true},{type:'shared_life_conflict',value:-1}],result:'Kalian memilih mengurangi satu sumber ketegangan: uang rumah kembali dibagi dengan pola yang lebih sederhana.'}
    ]};
  }
  const enoughShared=s.cohabiting?(now-(s.sharedSinceAt||now)>=20*24):p.sharedHours>=45;
  if(s.stage==='none'&&age>=22&&enoughShared&&p.dates>=10&&p.trust>=30&&(state.relationships[p.partner]||0)>=80&&p.strain<=1&&s.conflict<=1&&now>=s.deferredUntil&&now-(s.lastMilestoneAt||-9999)>=14*24){
    s.lastMilestoneAt=now;
    return {id:'shared_life_engagement',type:'FASE HIDUP',title:`Membicarakan Pertunangan dengan ${def.name}`,art:def.image,artAlt:def.name,text:`Kalian sudah cukup lama melihat versi hidup yang tidak rapi: jadwal buruk, uang yang kadang sempit, dan hari biasa tanpa momen besar. Kalau ada langkah berikutnya, itu bukan karena hubungan terasa sempurna—tapi karena kalian tahu apa yang sedang dipilih.`,choices:[
      {label:'Mulai pertunangan',hint:'Komitmen baru · belum mengubah rumah atau biaya otomatis',effects:[{type:'shared_life_engage'}],result:'Kalian sepakat bertunangan. Tidak ada sistem yang langsung menjadi mudah, tapi arah hubungan sekarang jauh lebih jelas.'},
      {label:'Belum sekarang',hint:'Tunda 30 hari · tanpa penalti',effects:[{type:'shared_life_defer_milestone',days:30}],result:'Kalian memilih menunggu sampai keputusan ini terasa benar, bukan sekadar tepat waktu.'}
    ]};
  }
  if(s.stage==='engaged'&&age>=23&&now-(s.engagedAt||now)>=45*24&&p.trust>=36&&(state.relationships[p.partner]||0)>=85&&p.strain<=1&&s.conflict<=1&&state.player.money>=750000&&now>=s.deferredUntil&&now-(s.lastMilestoneAt||-9999)>=30*24){
    s.lastMilestoneAt=now;
    return {id:'shared_life_marriage',type:'FASE HIDUP',title:`Menentukan Bentuk Pernikahan`,art:def.image,artAlt:def.name,text:`Pertunangan memberi kalian waktu untuk memastikan keputusan ini masih terasa benar di hari-hari biasa. Kalian bisa menikah sederhana tanpa mengubah game menjadi soal pesta—atau tetap menunggu kalau kehidupan belum memberi ruang.`,choices:[
      {label:'Nikah sederhana',hint:'8j · Rp750rb · membuka fase keluarga berikutnya',effects:[{type:'shared_life_marry'}],result:`Kalian menikah dengan sederhana. Tidak ada layar kemenangan—besok tetap ada kerja, tagihan, dan waktu yang harus dibagi. Hanya saja sekarang kalian memilih menjalaninya sebagai keluarga.`},
      {label:'Tunda dulu',hint:'Tidak ada penalti · bicarakan lagi nanti',effects:[{type:'shared_life_defer_milestone',days:45}],result:'Kalian sepakat belum perlu membuktikan apa pun lewat tanggal tertentu. Keputusan tetap ada ketika hidup lebih siap.'}
    ]};
  }
  return null;
}
