const SKILL_NAMES={mechanics:'Mekanik',learning:'Belajar',social:'Sosial',technology:'Teknologi'};
const STATUS_NAMES={tinggal_bersama_keluarga:'Tinggal bersama keluarga',tinggal_sendiri:'Tinggal sendiri',utang_keluarga:'Berutang pada keluarga',utang_rian:'Berutang pada Rian',punya_laptop:'Punya laptop sendiri',fokus_karier:'Memprioritaskan karier utama',jalur_mandiri:'Membangun jalur mandiri',jam_lebih_fleksibel:'Punya jadwal kerja lebih fleksibel',peran_ganda:'Memegang peran ganda di tempat kerja',gaji_ditekan:'Kompensasi tertekan setelah restrukturisasi',punya_usaha_kecil:'Punya usaha kecil sendiri',pemilik_usaha_penuh:'Fokus penuh sebagai pemilik usaha'};

function money(value){
  const sign=value<0?'-':'';
  return sign+'Rp'+Math.abs(Math.round(value)).toLocaleString('id-ID');
}
function compactMoney(value){
  const sign=value<0?'-':'';
  return sign+'Rp'+Math.abs(Math.round(value/1000)).toLocaleString('id-ID')+'rb';
}
function esc(value=''){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}

function primarySkill(state){
  if(state.player.job==='mechanic_junior'||state.player.job==='mechanic_senior') return 'mechanics';
  if(state.player.job==='store_clerk'||state.player.job==='store_supervisor') return 'social';
  if(state.player.job==='it_assistant') return 'technology';
  return state.discoveredSkills.includes('technology')?'technology':'learning';
}

function skillProgress(state,id){
  const xp=state.skills[id]||0;
  const current=getSkillTier(xp);
  const idx=skillTiers.findIndex(t=>t.id===current.id);
  if(idx===skillTiers.length-1) return {pct:100,text:'Ahli'};
  const next=skillTiers[idx+1];
  const pct=Math.max(0,Math.min(100,((xp-current.min)/(next.min-current.min))*100));
  return {pct,text:`${Math.round(pct)}% menuju ${next.label}`};
}

function jobText(state){
  if(!state.player.job) return 'Belum bekerja';
  const company=currentWorkplaceSnapshot(state);
  return `${jobLabel(state.player.job)} · ${state.player.workplace}${company?` · ${company.label}`:''}`;
}


function renderChapter(profile){
  if(!profile) return '';
  return `<div class="card event"><div class="label">BAB PERTAMA SELESAI</div><div class="section-title" style="font-size:1.2rem;margin-top:6px">${esc(profile.title)}</div><div class="muted small" style="margin-top:8px;line-height:1.5">${esc(profile.summary)}</div><div class="list" style="margin-top:12px">${profile.traits.map(x=>`<div class="item small">${esc(x)}</div>`).join('')}</div><div class="note" style="margin-top:12px">Ini bukan ending. Ini pembacaan sementara dari hidup yang sudah kamu bangun di Vertical Slice.</div><button class="btn primary" style="width:100%;margin-top:14px" data-ui="close-chapter">Lanjutkan hidup</button></div>`;
}

function renderEvent(state){
  const ev=state.pendingEvent;
  if(!ev) return '';
  return `<div class="card event">
    <div class="label">${esc(ev.type||'SESUATU TERJADI')}</div>
    <div class="section-title" style="font-size:1.1rem;margin-top:6px">${esc(ev.title)}</div>
    <div class="muted small" style="margin-top:8px;line-height:1.5">${esc(ev.text)}</div>
    <div class="choices">${ev.choices.map((choice,index)=>`<button class="choice" data-event-choice="${index}"><b>${esc(choice.label)}</b>${choice.hint?`<span class="hint">${esc(choice.hint)}</span>`:''}</button>`).join('')}</div>
  </div>`;
}

function renderOpportunities(state){
  if(!state.opportunities.length) return '';
  return `<div class="opp">${state.opportunities.map(op=>{
    const left=op.expireAt?Math.max(0,op.expireAt-state.time.totalHours):null;
    const expiry=left===null?'':`<span class="label">${left<=24?'Segera berakhir':Math.ceil(left/24)+' hari lagi'}</span>`;
    const claimLeft=op.contested&&op.claimAt?Math.max(0,op.claimAt-state.time.totalHours):null;
    const contested=claimLeft===null?'':`<div class="note" style="margin-top:7px">Diperebutkan · ${esc(op.competitor||'orang lain')} juga mengincar${claimLeft<=24?' · bisa diambil dalam kurang dari sehari':' · sekitar '+Math.ceil(claimLeft/24)+' hari untuk bergerak'}</div>`;
    return `<div class="opp-card"><div class="row"><div><div class="label">${op.contested?'PELUANG DIPEREBUTKAN':'PELUANG'}</div><div class="section-title" style="margin-top:4px">${esc(op.name)}</div><div class="muted small" style="margin-top:4px">${esc(op.summary)}</div>${contested}</div>${expiry}</div><button class="btn primary" style="width:100%;margin-top:10px" data-opportunity="${esc(op.id)}">Ambil peluang</button></div>`;
  }).join('')}</div>`;
}

function renderLife(state,ui){
  const condition=getCondition(state.player.fatigue);
  const skillId=primarySkill(state), tier=getSkillTier(state.skills[skillId]||0), progress=skillProgress(state,skillId);
  const acts=availableActivities(state);
  return `<section id="life">
    ${renderChapter(ui.chapterProfile)}
    ${ui.offlineSummary?`<div class="card event"><div class="label">SAAT KAMU PERGI</div><div class="section-title" style="font-size:1.1rem;margin-top:6px">Rutinitas tetap berjalan</div><div class="muted small" style="margin-top:8px;line-height:1.5">${ui.offlineSummary}</div><button class="btn primary" style="width:100%;margin-top:14px" data-ui="close-offline">Lanjutkan hidup</button></div>`:''}
    ${ui.milestone?`<div class="card event"><div class="label">PENCAPAIAN VERTICAL SLICE</div><div class="section-title" style="font-size:1.15rem;margin-top:6px">Pilihan hidupmu mulai saling terhubung</div><div class="muted small" style="margin-top:8px;line-height:1.5">Karier, kemampuan, hubungan, dan pekerjaan sampingan sekarang mulai menciptakan konsekuensi yang berbeda. Ini sudah lebih dekat ke bentuk game final daripada sekadar prototipe loop.</div><button class="btn primary" style="width:100%;margin-top:14px" data-ui="close-milestone">Lanjut bermain</button></div>`:''}
    ${renderEvent(state)}
    <div class="card">
      <div class="row"><div><div class="section-title">Hidup Saat Ini</div><div class="muted small">${esc(jobText(state))}</div></div><div class="pill">${esc(SKILL_NAMES[skillId])} · ${esc(tier.label)}</div></div>
      <div style="margin-top:18px"><div class="row small"><span>${esc(SKILL_NAMES[skillId])}</span><span class="muted">${esc(progress.text)}</span></div><div class="bar"><div style="width:${progress.pct}%"></div></div></div>
      ${renderOpportunities(state)}
      ${state.pendingEvent?'':`<div style="margin-top:18px"><div class="muted small">Mau melakukan apa selanjutnya?</div><div class="actions">${acts.map(a=>`<button class="btn" data-action="${a.id}"><b>${esc(a.name)}</b><span class="hint">${esc(a.hint)}</span></button>`).join('')}</div></div>`}
      <div class="result small">${esc(ui.result||'Pilihanmu akan menentukan jalur yang mulai terbuka.')}</div>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="row"><div><div class="section-title">Rutinitas</div><div class="muted small">${state.flags.routineUnlocked?(state.routine.enabled?'Aktif · kerja otomatis, istirahat saat kelelahan':'Sudah tersedia, belum aktif'):'Terbuka setelah kamu punya ritme kerja.'}</div></div><button class="btn center" style="min-height:44px" data-ui="toggle-routine" ${state.flags.routineUnlocked?'':'disabled'}>${state.routine.enabled?'Matikan':'Aktifkan'}</button></div>
      <div class="note" style="margin-top:10px">Rutinitas hanya mengotomatisasi hal repetitif. Event, peluang, dan keputusan penting tetap menunggumu.</div>
      <div class="toolbar"><button class="btn center" data-ui="simulate-offline" ${state.routine.enabled?'':'disabled'}>Simulasikan saat tidak bermain</button>${ui.installAvailable?'<button class="btn center" data-ui="install">Pasang aplikasi</button>':''}</div>
    </div>

    <div class="stats"><div class="stat"><div class="label">Uang</div><div class="value">${compactMoney(state.player.money)}</div></div><div class="stat"><div class="label">Kondisi</div><div class="value">${condition.label}</div></div><div class="stat"><div class="label">Arah</div><div class="value">${esc(lifeDirection(state))}</div></div></div>
  </section>`;
}

function renderWorld(state){
  const people=[];
  const world=worldSnapshot(state);
  const rianLife={serabutan:'Teman masa kecil · masih mengambil kerja serabutan',kurir:'Teman masa kecil · bekerja sebagai kurir',koordinator_logistik:'Teman masa kecil · koordinator logistik'}[state.npc.rian?.life]||'Teman masa kecil · ramah, impulsif';
  people.push({name:'Rian',relation:relationshipLabel(state.relationships.rian),desc:rianLife});
  if(state.npc.pak_arman.known) people.push({name:'Pak Arman',relation:relationshipLabel(state.relationships.pak_arman),desc:'Pemilik bengkel · tegas, adil'});
  if(state.npc.dika.known){
    const desc=state.npc.dika.life==='kepala_mekanik'?'Mantan rekan · sekarang kepala mekanik di bengkel lain':state.npc.dika.life==='bengkel_lain'?'Mantan rekan bengkel · sekarang bekerja di tempat lain':'Rekan bengkel · ambisius, kompetitif';
    people.push({name:'Dika',relation:relationshipLabel(state.relationships.dika),desc});
  }
  if(state.npc.maya.known) people.push({name:'Maya',relation:relationshipLabel(state.relationships.maya),desc:state.npc.maya.life==='manajer_cabang'?'Manajer cabang · tenang, praktis':'Supervisor toko · tenang, praktis'});
  if(state.npc.nadia.known) people.push({name:'Nadia',relation:relationshipLabel(state.relationships.nadia),desc:state.npc.nadia.life==='lead_teknisi'?'Lead teknisi · cepat, pragmatis':'Teknisi senior · cepat, pragmatis'});
  if(state.npc.ari?.known) people.push({name:'Ari',relation:relationshipLabel(state.relationships.ari||0),desc:!state.business?.active?'Pernah membantu usaha kecilmu':state.business?.delegated?'Helper usahamu · mulai memegang pekerjaan rutin':'Helper usahamu · masih banyak bekerja bersamamu'});
  return `<section id="world">
    <div class="card">
      <div class="row"><div><div class="section-title">Kondisi Dunia</div><div class="muted small">Simulasi bergerak setiap 7 hari game.</div></div><span class="pill">${esc(world.phase)}</span></div>
      <div class="stats" style="margin-top:12px"><div class="stat"><div class="label">Pasar kerja</div><div class="value">${esc(world.jobMarket)}</div></div><div class="stat"><div class="label">Biaya hidup</div><div class="value">${esc(world.costTrend)}</div></div><div class="stat"><div class="label">Minggu dunia</div><div class="value">${state.world?.week||0}</div></div></div>
      <div class="list" style="margin-top:12px"><div class="item"><div class="row"><span>Bengkel</span><b>${esc(world.mechanics)}</b></div></div><div class="item"><div class="row"><span>Retail</span><b>${esc(world.retail)}</b></div></div><div class="item"><div class="row"><span>Teknologi</span><b>${esc(world.technology)}</b></div></div></div>
      ${state.business?.active?(()=>{const c=world.competitors?.[state.business.sector];const pos=businessMarketPosition(state);return `<div class="section-title" style="margin-top:18px">Pasar Usahamu</div><div class="item"><div class="row"><span>Posisi ${esc(state.business.name||'usaha')}</span><b>${esc(pos.label)}</b></div><div class="muted small" style="margin-top:4px">Reputasi pasar: ${esc(businessMarketReputationLabel(state))} · tekanan kompetitor: ${esc(businessCompetitorPressureLabel(state))}</div>${c?`<div class="muted small" style="margin-top:4px">${esc(c.name)} · ${esc(c.actionLabel)} · kekuatan pasar ${Math.round(c.strength)}</div>`:''}<div class="muted small" style="margin-top:4px">Respons saat ini: ${esc(businessStrategyLabel(state))}</div></div>`})():''}
      <div class="section-title" style="margin-top:18px">Kondisi Tempat Kerja</div>
      <div class="list">${Object.values(world.workplaces||{}).map(c=>`<div class="item"><div class="row"><span>${esc(c.name)}</span><b>${esc(c.label)}</b></div><div class="muted small" style="margin-top:4px">Arus usaha: ${esc(companyCashflowLabel(c.margin||0))} · Tim: ${c.headcount||'-'} orang</div><div class="muted small" style="margin-top:3px">Tekanan: ${esc(pressureLabel(c.pressure))} · Risiko kerja: ${esc(employmentRiskLabel(c))}</div></div>`).join('')}</div>
      ${world.news.length?`<div class="section-title" style="margin-top:18px">Sinyal Dunia</div><div class="list">${world.news.map(x=>`<div class="item small">${esc(x)}</div>`).join('')}</div>`:''}
      <div class="section-title" style="margin-top:22px">Peluang Aktif</div><div class="list">${state.opportunities.length?state.opportunities.map(o=>`<div class="item"><b>${esc(o.name)}</b><div class="muted small" style="margin-top:4px">${esc(o.summary)}</div></div>`).join(''):'<div class="empty">Belum ada peluang penting.</div>'}</div>
      <div class="section-title" style="margin-top:22px">Orang</div><div class="people">${people.map(p=>`<div class="person"><div class="row"><b>${esc(p.name)}</b><span class="small">${esc(p.relation)}</span></div><div class="muted small">${esc(p.desc)}</div></div>`).join('')}</div>
      <div class="section-title" style="margin-top:22px">Perubahan Terbaru</div><div class="list">${state.recent.length?state.recent.map(x=>`<div class="item small">${esc(x)}</div>`).join(''):'<div class="empty">Belum ada hal penting.</div>'}</div>
    </div>
  </section>`;
}

function renderYou(state){
  const skills=state.discoveredSkills.map(id=>({id,name:SKILL_NAMES[id]||id,tier:getSkillTier(state.skills[id]||0).label}));
  const finance=financialState(state);
  const statuses=state.player.statuses.map(id=>STATUS_NAMES[id]||id);
  const profile=getOutcomeProfile(state);
  return `<section id="you"><div class="card"><div class="section-title">Kamu</div><div class="list">${skills.map(s=>`<div class="item"><div class="row"><span>${esc(s.name)}</span><b>${esc(s.tier)}</b></div></div>`).join('')}</div>
  <div class="divider"></div><div class="section-title">Jejak Hidup Saat Ini</div><div class="item" style="margin-top:10px"><div class="row"><b>${esc(profile.title)}</b>${state.flags.verticalSliceComplete?'<span class="pill">Bab 1</span>':''}</div><div class="muted small" style="margin-top:6px;line-height:1.45">${esc(profile.summary)}</div></div>
  <div class="divider"></div><div class="section-title">Keadaan Hidup</div><div class="list"><div class="item"><div class="row"><span>Arah</span><b>${esc(lifeDirection(state))}</b></div></div><div class="item"><div class="row"><span>Strategi</span><b>${esc(trajectoryLabel(state))}</b></div></div><div class="item"><div class="row"><span>Tempat tinggal</span><b>${esc(housingLabel(state))}</b></div><div class="muted small" style="margin-top:4px">Biaya hidup: ${money(state.economy.livingCost)}/bulan</div></div><div class="item"><div class="row"><span>Keuangan</span><b>${esc(finance.label)}</b></div></div>${statuses.map(x=>`<div class="item small">${esc(x)}</div>`).join('')}</div>
  <div class="divider"></div><div class="section-title">Karier & Sampingan</div><div class="small" style="margin-top:6px">${esc(jobText(state))}</div>${state.player.job?`<div class="muted small" style="margin-top:5px">Gaji saat ini: ${money(state.player.salary||JOBS[state.player.job]?.salary||0)}/hari</div>`:''}<div class="muted small" style="margin-top:5px">Total pendapatan sampingan: ${money(state.career.sideIncomeTotal||0)}</div>
  ${state.business?.active?`<div class="divider"></div><div class="section-title">Usaha Kecil</div><div class="item" style="margin-top:10px"><div class="row"><b>${esc(state.business.name||'Usaha Kecil')}</b><span class="pill">${esc(businessHealthLabel(state))}</span></div><div class="muted small" style="margin-top:6px">Skala: ${esc(businessScaleLabel(state))} · ditangani: ${state.business.servedClients||state.business.clients||0}/${state.business.capacity||2} kapasitas</div><div class="muted small" style="margin-top:4px">Pelanggan tetap: ${state.business.retainedClients||0} · permintaan terlewat: ${state.business.missedDemand||0} · peralatan: ${esc(businessEquipmentLabel(state))}</div>${state.business.helperActive?`<div class="muted small" style="margin-top:4px">Ari: ${esc(businessHelperLabel(state))} · upah ${money(state.business.helperWage||0)}/minggu · ${state.business.delegated?'pekerjaan rutin didelegasikan':'masih banyak bekerja bersamamu'}</div>`:''}<div class="muted small" style="margin-top:4px">Profit minggu terakhir: ${money(state.business.lastWeeklyProfit||0)} · total: ${money(state.business.totalProfit||0)}</div><div class="muted small" style="margin-top:4px">Pasar: ${esc(businessMarketPosition(state).label)} · ${esc(businessMarketReputationLabel(state))} · strategi ${esc(businessStrategyLabel(state).toLowerCase())}</div><div class="muted small" style="margin-top:4px">Pelanggan dimenangkan: ${state.business.clientsWon||0} · hilang ke pasar: ${state.business.clientsLost||0}</div></div>`:''}
  <div class="divider"></div><div class="section-title">Riwayat Hidup</div><div class="list">${state.history.map(x=>`<div class="item small">${esc(x)}</div>`).join('')}</div>
  <button class="btn center" style="width:100%;margin-top:16px" data-ui="reset">Mulai ulang save</button></div></section>`;
}

function render(root,state,ui){
  const cal=getCalendar(state.time.totalHours),condition=getCondition(state.player.fatigue);
  root.innerHTML=`
    <header class="top"><div><div class="muted small">Umur ${cal.age} · Bulan ${cal.month} Hari ${cal.day} · ${String(cal.hour).padStart(2,'0')}:00</div><div class="name">${esc(state.player.name)}</div><div class="muted small">${esc(jobText(state))}</div></div><div><div class="money">${money(state.player.money)}</div><div class="muted small" style="text-align:right">Kondisi: ${condition.label}</div></div></header>
    <main>${ui.tab==='life'?renderLife(state,ui):ui.tab==='world'?renderWorld(state):renderYou(state)}</main>
    <nav class="tabs"><button class="tab ${ui.tab==='life'?'active':''}" data-tab="life">HIDUP</button><button class="tab ${ui.tab==='world'?'active':''}" data-tab="world">DUNIA</button><button class="tab ${ui.tab==='you'?'active':''}" data-tab="you">KAMU</button></nav>`;
}
