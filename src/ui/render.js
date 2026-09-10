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


function toneClass(tone='neutral'){return `tone-${['positive','warning','danger','info','neutral'].includes(tone)?tone:'neutral'}`;}
function conditionTone(id){return id==='good'?'positive':id==='exhausted'?'danger':'warning';}
function financeTone(id){return id==='comfortable'?'positive':id==='debt'?'danger':id==='tight'?'warning':'neutral';}
function phaseTone(label){const v=String(label||'').toLowerCase();return v.includes('lesu')?'danger':v.includes('melambat')?'warning':v.includes('ramai')?'positive':'neutral';}
function demandTone(label){const v=String(label||'').toLowerCase();return v==='lemah'?'danger':v.includes('sepi')?'warning':v.includes('tinggi')?'positive':'neutral';}
function costTone(label){const v=String(label||'').toLowerCase();return v==='mahal'?'danger':v.includes('mulai mahal')?'warning':v.includes('murah')?'positive':'neutral';}
function riskTone(label){const v=String(label||'').toLowerCase();return v==='tinggi'?'danger':v==='waspada'?'warning':v==='rendah'?'positive':'neutral';}
function workplaceTone(label){const v=String(label||'').toLowerCase();return v==='tertekan'?'danger':v==='rentan'?'warning':(v==='tumbuh'||v==='ekspansi')?'positive':'neutral';}
function businessHealthTone(label){const v=String(label||'').toLowerCase();return v==='terdesak'?'danger':v==='kewalahan'?'warning':(v==='stabil'||v==='punya nama')?'positive':'neutral';}

function renderSystemNotice(ui){
  const notices=[];
  if(ui.updateAvailable) notices.push(`<div class="system-banner tone-info"><div><b>Pembaruan siap</b><span>Versi baru sudah tersedia dan bisa dipakai tanpa menghapus save.</span></div><button class="btn mini center" data-ui="apply-update">Muat ulang</button></div>`);
  if(ui.networkOnline===false) notices.push(`<div class="system-banner tone-warning"><div><b>Mode offline</b><span>Game tetap bisa dimainkan. Perubahan disimpan di perangkat ini.</span></div></div>`);
  return notices.join('');
}

function renderEmptyState(title,text){
  return `<div class="empty-state"><div class="empty-dot" aria-hidden="true"></div><div><b>${esc(title)}</b><div>${esc(text)}</div></div></div>`;
}

function renderActionFeedback(ui){
  const f=ui.feedback;
  if(!f) return '';
  const details=(f.details||[]).length?`<div class="feedback-details">${f.details.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'';
  return `<div class="feedback-card ${toneClass(f.tone)}" role="status"><div class="feedback-copy"><div class="eyebrow">HASIL TERBARU</div><b>${esc(f.title||'Perubahan tersimpan')}</b><div>${esc(f.message||'')}</div>${details}</div><button class="feedback-close" data-ui="close-feedback" aria-label="Tutup hasil">×</button></div>`;
}

function renderConfirm(ui){
  if(!ui.confirm) return '';
  if(ui.confirm.type!=='new-life') return '';
  return `<div class="modal-backdrop" role="presentation"><div class="confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div class="eyebrow">KONFIRMASI</div><div class="confirm-title" id="confirm-title">${esc(ui.confirm.title)}</div><div class="confirm-text">${esc(ui.confirm.text)}</div><div class="confirm-actions"><button class="btn quiet center" data-ui="cancel-confirm">Batal</button><button class="btn danger center" data-ui="confirm-new-life">Mulai hidup baru</button></div></div></div>`;
}

function renderOnboarding(ui){
  const steps=[
    {kicker:'DASAR 1/3',title:'Waktu adalah biaya utama',text:'Kerja, belajar, istirahat, dan menjaga hubungan semuanya memakai waktu. Kamu tidak bisa memaksimalkan semuanya sekaligus.',note:'Tidak ada energy bar yang menahanmu. Konsekuensinya datang dari waktu, uang, dan kondisi hidup.'},
    {kicker:'DASAR 2/3',title:'Dunia tidak menunggumu',text:'Ekonomi, perusahaan, orang lain, dan peluang bergerak sendiri. Kesempatan yang kamu lewatkan bisa diambil orang lain.',note:'Kamu tidak harus mengejar semua peluang. Melewatkan sesuatu juga merupakan pilihan.'},
    {kicker:'DASAR 3/3',title:'Keputusan penting tetap milikmu',text:'Rutinitas bisa membantu hal repetitif, tapi game tidak akan memilih karier, hubungan, atau keputusan besar secara otomatis.',note:'Tidak ada satu jalur menang. Tujuannya adalah melihat hidup seperti apa yang terbentuk dari pilihanmu.'}
  ];
  const step=Math.max(0,Math.min(2,ui.onboardingStep||0));
  const x=steps[step];
  return `<div class="menu-screen onboarding-screen"><div class="menu-inner onboarding-inner">
    <div class="onboarding-head"><button class="icon-btn back" data-ui="onboarding-back" aria-label="Kembali">‹</button><div class="onboarding-progress" aria-label="Langkah ${step+1} dari 3">${steps.map((_,i)=>`<span class="${i===step?'active':i<step?'done':''}"></span>`).join('')}</div><button class="text-btn onboarding-skip" data-ui="onboarding-skip">Lewati</button></div>
    <div class="onboarding-card"><div class="eyebrow">${x.kicker}</div><div class="onboarding-title">${esc(x.title)}</div><div class="onboarding-text">${esc(x.text)}</div><div class="onboarding-note">${esc(x.note)}</div></div>
    <button class="btn primary menu-primary" data-ui="${step===2?'onboarding-finish':'onboarding-next'}">${step===2?'Mulai hidup':'Lanjut'}</button>
    <div class="build-note">Build U · UX Foundation</div>
  </div></div>`;
}

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

function renderMainMenu(state,ui){
  const cal=getCalendar(state.time.totalHours);
  const hasSave=ui.hasSave;
  const continueCopy=state.player.job?jobText(state):lifeDirection(state);
  return `<div class="menu-screen">
    <div class="menu-inner">
      <div class="brand-block">
        <div class="brand-mark">H</div>
        <div class="brand-title">HIDUP</div>
        <div class="brand-subtitle">Setiap pilihan meninggalkan jejak.</div>
      </div>

      ${renderSystemNotice(ui)}
      ${hasSave?`<div class="resume-card">
        <div class="resume-top"><div><div class="eyebrow">HIDUP TERAKHIR</div><div class="resume-name">${esc(state.player.name)}</div></div><div class="resume-money">${money(state.player.money)}</div></div>
        <div class="resume-meta">Umur ${cal.age} · Bulan ${cal.month} Hari ${cal.day} · ${String(cal.hour).padStart(2,'0')}:00</div>
        <div class="resume-line">${esc(continueCopy)}</div>
        <div class="resume-line muted">${esc(lifeDirection(state))}</div>
      </div>`:`<div class="menu-intro">Mulai dari umur 18. Waktu terus bergerak, dunia ikut berubah, dan nggak ada satu jalan hidup yang dianggap paling benar.</div>`}

      <div class="menu-actions">
        <button class="btn primary menu-primary" data-ui="${hasSave?'continue-game':'start-new'}">${hasSave?'Lanjutkan':'Mulai Hidup'}</button>
        ${hasSave?'<button class="btn quiet center" data-ui="start-new">Mulai Hidup Baru</button>':''}
        <button class="btn quiet center" data-ui="open-settings">Pengaturan</button>
        ${ui.installAvailable?'<button class="btn quiet center" data-ui="install">Pasang aplikasi</button>':''}
      </div>
      <div class="build-note">Build U · UX Foundation</div>
    </div>
  </div>`;
}

function settingChoice(label,value,current,dataAttr){
  return `<button class="seg ${current===value?'active':''}" ${dataAttr}="${value}">${esc(label)}</button>`;
}

function renderSettings(ui){
  const p=ui.prefs;
  return `<div class="menu-screen settings-screen">
    <div class="menu-inner settings-inner">
      <div class="menu-page-head"><button class="icon-btn back" data-ui="settings-back" aria-label="Kembali">‹</button><div><div class="eyebrow">PENGATURAN</div><div class="menu-page-title">Tampilan</div></div></div>
      ${renderSystemNotice(ui)}
      <div class="settings-card">
        <div class="setting-row"><div><b>Tema</b><div class="setting-help">Ikuti perangkat atau pilih tampilan tetap.</div></div></div>
        <div class="segments three">
          ${settingChoice('Sistem','system',p.theme,'data-pref-theme')}
          ${settingChoice('Terang','light',p.theme,'data-pref-theme')}
          ${settingChoice('Gelap','dark',p.theme,'data-pref-theme')}
        </div>
      </div>

      <div class="settings-card">
        <div class="setting-row"><div><b>Ukuran teks</b><div class="setting-help">Tidak mengubah jumlah informasi, hanya kenyamanan baca.</div></div></div>
        <div class="segments two">
          ${settingChoice('Normal','normal',p.textSize,'data-pref-text')}
          ${settingChoice('Besar','large',p.textSize,'data-pref-text')}
        </div>
      </div>

      <div class="settings-card setting-toggle-row">
        <div><b>Animasi lembut</b><div class="setting-help">Matikan untuk mengurangi gerakan/transisi.</div></div>
        <button class="switch ${p.motion?'on':''}" data-ui="toggle-motion" role="switch" aria-checked="${p.motion?'true':'false'}"><span></span></button>
      </div>

      <div class="settings-foot">Pengaturan tampilan dan onboarding disimpan terpisah dari save hidupmu.</div>
    </div>
  </div>`;
}

function renderFocusCard(kicker,title,text,body='',action=''){
  return `<div class="focus-card">
    <div class="focus-kicker">${esc(kicker)}</div>
    <div class="focus-title">${esc(title)}</div>
    ${text?`<div class="focus-text">${text}</div>`:''}
    ${body}
    ${action}
  </div>`;
}

function renderChapter(profile){
  if(!profile) return '';
  const traits=`<div class="trait-list">${profile.traits.map(x=>`<div class="trait">${esc(x)}</div>`).join('')}</div>`;
  return renderFocusCard('BAB PERTAMA SELESAI',profile.title,esc(profile.summary),traits+'<div class="focus-note">Ini bukan ending. Ini pembacaan sementara dari hidup yang sudah kamu bangun.</div>','<button class="btn primary full" data-ui="close-chapter">Lanjutkan hidup</button>');
}

function renderEvent(state){
  const ev=state.pendingEvent;
  if(!ev) return '';
  const choices=`<div class="choices">${ev.choices.map((choice,index)=>`<button class="choice" data-event-choice="${index}"><span><b>${esc(choice.label)}</b>${choice.hint?`<span class="hint">${esc(choice.hint)}</span>`:''}</span><span class="choice-arrow">›</span></button>`).join('')}</div>`;
  return renderFocusCard(ev.type||'SESUATU TERJADI',ev.title,esc(ev.text),choices);
}

function visibleOpportunities(state){
  return state.opportunities.filter(op=>!getContent('opportunities',op.id) || contentEnabled(state,'opportunities',op.id));
}

function renderOpportunities(state){
  const opportunities=visibleOpportunities(state);
  if(!opportunities.length) return '';
  return `<div class="stack opportunities-stack">${opportunities.map(op=>{
    const left=op.expireAt?Math.max(0,op.expireAt-state.time.totalHours):null;
    const expiry=left===null?'':`<span class="tag ${left<=24?'urgent':''}">${left<=24?'Segera berakhir':Math.ceil(left/24)+' hari'}</span>`;
    const claimLeft=op.contested&&op.claimAt?Math.max(0,op.claimAt-state.time.totalHours):null;
    const contested=claimLeft===null?'':`<div class="opportunity-warning">${esc(op.competitor||'Orang lain')} juga mengincar · ${claimLeft<=24?'kurang dari sehari':Math.ceil(claimLeft/24)+' hari untuk bergerak'}</div>`;
    return `<article class="opportunity-card ${op.contested?'contested':''}">
      <div class="opportunity-head"><div><div class="eyebrow">${op.contested?'PELUANG DIPEREBUTKAN':'PELUANG'}</div><div class="opportunity-title">${esc(op.name)}</div></div>${expiry}</div>
      <div class="opportunity-summary">${esc(op.summary)}</div>${contested}
      <button class="btn primary full compact" data-opportunity="${esc(op.id)}">Ambil peluang</button>
    </article>`;
  }).join('')}</div>`;
}

function renderLife(state,ui){
  const condition=getCondition(state.player.fatigue);
  const skillId=primarySkill(state),tier=getSkillTier(state.skills[skillId]||0),progress=skillProgress(state,skillId);
  const acts=availableActivities(state);
  return `<section id="life" class="page-stack">
    ${renderChapter(ui.chapterProfile)}
    ${ui.offlineSummary?renderFocusCard('SAAT KAMU PERGI','Rutinitas tetap berjalan',ui.offlineSummary,'','<button class="btn primary full" data-ui="close-offline">Lanjutkan hidup</button>'):''}
    ${ui.milestone?renderFocusCard('PENCAPAIAN','Pilihan hidupmu mulai saling terhubung','Karier, kemampuan, hubungan, dan pekerjaan sampingan sekarang mulai menciptakan konsekuensi yang berbeda.','','<button class="btn primary full" data-ui="close-milestone">Lanjut bermain</button>'):''}
    ${renderEvent(state)}
    ${renderActionFeedback(ui)}

    <div class="card life-card">
      <div class="card-head"><div><div class="eyebrow">SEKARANG</div><div class="section-title large">${esc(lifeDirection(state))}</div><div class="subline">${esc(jobText(state))}</div></div><span class="pill">${esc(SKILL_NAMES[skillId])} · ${esc(tier.label)}</span></div>
      <div class="skill-block"><div class="row small"><b>${esc(SKILL_NAMES[skillId])}</b><span class="muted">${esc(progress.text)}</span></div><div class="bar"><div style="width:${progress.pct}%"></div></div></div>
      ${renderOpportunities(state)}
      ${state.pendingEvent?'':`<div class="next-action"><div class="eyebrow">LANGKAH BERIKUTNYA</div><div class="actions">${acts.map(a=>`<button class="btn action-btn" data-action="${a.id}"><b>${esc(a.name)}</b><span class="hint">${esc(a.hint)}</span></button>`).join('')}</div></div>`}
      <div class="result small"><span>Catatan terakhir</span>${esc(ui.result||'Pilihanmu akan menentukan jalur yang mulai terbuka.')}</div>
    </div>

    <div class="card secondary-card">
      <div class="card-head"><div><div class="section-title">Rutinitas</div><div class="subline">${state.flags.routineUnlocked?(state.routine.enabled?'Aktif · hal repetitif berjalan otomatis':'Tersedia, tapi belum aktif'):'Terbuka setelah kamu punya ritme kerja.'}</div></div><button class="btn mini center ${state.routine.enabled?'tone-positive':''}" data-ui="toggle-routine" ${state.flags.routineUnlocked?'':'disabled'}>${state.routine.enabled?'Matikan':'Aktifkan'}</button></div>
      <div class="focus-note">Rutinitas hanya mengotomatisasi hal repetitif. Event, peluang, dan keputusan penting tetap menunggumu.</div>
      ${state.routine.enabled?'<button class="text-btn" data-ui="simulate-offline">Simulasikan 4 jam offline →</button>':''}
    </div>

    <div class="stat-strip"><div><span>Uang</span><b>${compactMoney(state.player.money)}</b></div><div class="${toneClass(conditionTone(condition.id))}"><span>Kondisi</span><b>${esc(condition.label)}</b></div><div><span>Arah</span><b>${esc(trajectoryLabel(state))}</b></div></div>
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
  const activeOpps=visibleOpportunities(state);
  return `<section id="world" class="page-stack">
    <div class="card">
      <div class="card-head"><div><div class="eyebrow">DUNIA</div><div class="section-title large">Kondisi ${esc(world.phase)}</div><div class="subline">Simulasi bergerak setiap 7 hari game.</div></div><span class="pill ${toneClass(phaseTone(world.phase))}">Minggu ${state.world?.week||0}</span></div>
      <div class="metric-grid"><div class="metric ${toneClass(demandTone(world.jobMarket))}"><span>Pasar kerja</span><b>${esc(world.jobMarket)}</b></div><div class="metric ${toneClass(costTone(world.costTrend))}"><span>Biaya hidup</span><b>${esc(world.costTrend)}</b></div><div class="metric ${toneClass(demandTone(world.mechanics))}"><span>Bengkel</span><b>${esc(world.mechanics)}</b></div><div class="metric ${toneClass(demandTone(world.retail))}"><span>Retail</span><b>${esc(world.retail)}</b></div><div class="metric ${toneClass(demandTone(world.technology))}"><span>Teknologi</span><b>${esc(world.technology)}</b></div></div>
      ${world.news.length?`<div class="signal-list">${world.news.map(x=>`<div class="signal">${esc(x)}</div>`).join('')}</div>`:renderEmptyState('Dunia sedang tenang','Belum ada perubahan besar yang perlu kamu perhatikan minggu ini.')}
    </div>

    ${state.business?.active?(()=>{const c=world.competitors?.[state.business.sector];const pos=businessMarketPosition(state);return `<div class="card"><div class="eyebrow">PASAR USAHAMU</div><div class="section-title">${esc(state.business.name||'Usaha Kecil')}</div><div class="key-row"><span>Posisi pasar</span><b>${esc(pos.label)}</b></div><div class="key-row"><span>Reputasi</span><b>${esc(businessMarketReputationLabel(state))}</b></div><div class="key-row"><span>Tekanan kompetitor</span><b>${esc(businessCompetitorPressureLabel(state))}</b></div>${c?`<div class="signal">${esc(c.name)} · ${esc(c.actionLabel)} · kekuatan ${Math.round(c.strength)}</div>`:''}<div class="subline space-top">Respons saat ini: ${esc(businessStrategyLabel(state))}</div></div>`})():''}

    <div class="card"><div class="eyebrow">TEMPAT KERJA</div><div class="section-title">Kondisi perusahaan</div><div class="list clean-list">${Object.values(world.workplaces||{}).map(c=>{const risk=employmentRiskLabel(c);return `<div class="list-row"><div><b>${esc(c.name)}</b><div class="subline">Arus usaha ${esc(companyCashflowLabel(c.margin||0))} · ${c.headcount||'-'} orang</div></div><div class="align-right"><b class="tone-text ${toneClass(workplaceTone(c.label))}">${esc(c.label)}</b><div class="subline tone-text ${toneClass(riskTone(risk))}">Risiko ${esc(risk)}</div></div></div>`}).join('')}</div></div>

    <div class="card"><div class="card-head"><div><div class="eyebrow">PELUANG</div><div class="section-title">Yang sedang terbuka</div></div><span class="pill">${activeOpps.length}</span></div><div class="list clean-list">${activeOpps.length?activeOpps.map(o=>`<div class="list-row single"><div><b>${esc(o.name)}</b><div class="subline">${esc(o.summary)}</div></div></div>`).join(''):renderEmptyState('Belum ada peluang penting','Aktivitas, kemampuan, dan perubahan dunia akan membuka peluang baru.')}</div></div>

    <div class="card"><div class="eyebrow">ORANG</div><div class="section-title">Lingkaran hidupmu</div><div class="list clean-list">${people.map(p=>`<div class="list-row"><div><b>${esc(p.name)}</b><div class="subline">${esc(p.desc)}</div></div><span class="relation">${esc(p.relation)}</span></div>`).join('')}</div></div>

    <div class="card"><div class="eyebrow">TERBARU</div><div class="section-title">Perubahan dunia</div><div class="timeline">${state.recent.length?state.recent.slice(0,8).map(x=>`<div class="timeline-item">${esc(x)}</div>`).join(''):renderEmptyState('Belum ada perubahan besar','Dunia akan meninggalkan jejak di sini saat sesuatu yang relevan terjadi.')}</div></div>
  </section>`;
}

function renderYou(state){
  const skills=state.discoveredSkills.map(id=>({id,name:SKILL_NAMES[id]||id,tier:getSkillTier(state.skills[id]||0).label,progress:skillProgress(state,id)}));
  const finance=financialState(state);
  const statuses=state.player.statuses.map(id=>STATUS_NAMES[id]||id);
  const profile=getOutcomeProfile(state);
  const health=state.business?.active?businessHealthLabel(state):'';
  return `<section id="you" class="page-stack">
    <div class="card profile-card"><div class="eyebrow">JEJAK HIDUP</div><div class="section-title hero-title">${esc(profile.title)}</div><div class="profile-summary">${esc(profile.summary)}</div>${state.flags.verticalSliceComplete?'<span class="pill space-top tone-positive">Bab 1 terbentuk</span>':''}</div>

    <div class="card"><div class="eyebrow">KAMU</div><div class="section-title">Kemampuan</div><div class="skill-list">${skills.map(s=>`<div class="skill-row"><div class="row"><b>${esc(s.name)}</b><span>${esc(s.tier)}</span></div><div class="bar slim"><div style="width:${s.progress.pct}%"></div></div></div>`).join('')}</div></div>

    <div class="card"><div class="eyebrow">KEADAAN HIDUP</div><div class="key-row"><span>Arah</span><b>${esc(lifeDirection(state))}</b></div><div class="key-row"><span>Strategi</span><b>${esc(trajectoryLabel(state))}</b></div><div class="key-row"><span>Tempat tinggal</span><b>${esc(housingLabel(state))}</b></div><div class="key-row"><span>Keuangan</span><b class="tone-text ${toneClass(financeTone(finance.id))}">${esc(finance.label)}</b></div><div class="subline space-top">Biaya hidup ${money(state.economy.livingCost)}/bulan</div>${statuses.length?`<div class="tag-cloud">${statuses.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>`:''}</div>

    <div class="card"><div class="eyebrow">KARIER</div><div class="section-title">${esc(state.player.job?jobLabel(state.player.job):'Belum bekerja')}</div><div class="subline space-top">${state.player.job?esc(state.player.workplace):'Peluang kerja akan muncul dari pilihan dan keadaan dunia.'}</div>${state.player.job?`<div class="key-row space-top"><span>Gaji saat ini</span><b>${money(state.player.salary||JOBS[state.player.job]?.salary||0)}/hari</b></div>`:''}<div class="key-row"><span>Pendapatan sampingan</span><b>${money(state.career.sideIncomeTotal||0)}</b></div></div>

    ${state.business?.active?`<div class="card"><div class="card-head"><div><div class="eyebrow">USAHA KECIL</div><div class="section-title">${esc(state.business.name||'Usaha Kecil')}</div></div><span class="pill ${toneClass(businessHealthTone(health))}">${esc(health)}</span></div><div class="key-row"><span>Skala</span><b>${esc(businessScaleLabel(state))}</b></div><div class="key-row"><span>Kapasitas</span><b>${state.business.servedClients||state.business.clients||0}/${state.business.capacity||2}</b></div><div class="key-row"><span>Pelanggan tetap</span><b>${state.business.retainedClients||0}</b></div>${state.business.helperActive?`<div class="key-row"><span>Ari</span><b>${esc(businessHelperLabel(state))}</b></div>`:''}<div class="key-row"><span>Profit minggu lalu</span><b>${money(state.business.lastWeeklyProfit||0)}</b></div><div class="subline space-top">Pasar ${esc(businessMarketPosition(state).label)} · ${esc(businessMarketReputationLabel(state))} · strategi ${esc(businessStrategyLabel(state).toLowerCase())}</div></div>`:''}

    <details class="card history-card"><summary><span><span class="eyebrow">RIWAYAT</span><span class="section-title">Riwayat hidup</span></span><span class="summary-hint">${state.history.length} catatan</span></summary><div class="timeline history-timeline">${state.history.map(x=>`<div class="timeline-item">${esc(x)}</div>`).join('')}</div></details>
  </section>`;
}

function renderGameHeader(state){
  const cal=getCalendar(state.time.totalHours),condition=getCondition(state.player.fatigue);
  return `<header class="game-header">
    <div class="game-header-left"><div class="header-time">Umur ${cal.age} · B${cal.month} H${cal.day} · ${String(cal.hour).padStart(2,'0')}:00</div><div class="header-name">${esc(state.player.name)}</div></div>
    <div class="game-header-right"><div class="header-money">${money(state.player.money)}</div><div class="header-condition tone-text ${toneClass(conditionTone(condition.id))}">${esc(condition.label)}</div></div>
    <button class="icon-btn menu-btn" data-ui="open-menu" aria-label="Buka menu">•••</button>
  </header>`;
}

function renderGame(root,state,ui){
  const page=ui.tab==='life'?renderLife(state,ui):ui.tab==='world'?renderWorld(state):renderYou(state);
  root.innerHTML=`<div class="game-shell">${renderGameHeader(state)}<main class="game-main">${renderSystemNotice(ui)}${page}</main><nav class="tabs" aria-label="Navigasi utama"><button class="tab ${ui.tab==='life'?'active':''}" data-tab="life"><span>HIDUP</span></button><button class="tab ${ui.tab==='world'?'active':''}" data-tab="world"><span>DUNIA</span></button><button class="tab ${ui.tab==='you'?'active':''}" data-tab="you"><span>KAMU</span></button></nav></div>`;
}

function render(root,state,ui){
  let screen='';
  if(ui.screen==='settings') screen=renderSettings(ui);
  else if(ui.screen==='onboarding') screen=renderOnboarding(ui);
  else if(ui.screen==='menu') screen=renderMainMenu(state,ui);
  else{
    renderGame(root,state,ui);
    if(ui.confirm) root.insertAdjacentHTML('beforeend',renderConfirm(ui));
    return;
  }
  root.innerHTML=screen+renderConfirm(ui);
}
