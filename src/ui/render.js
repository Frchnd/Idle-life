import {getCalendar} from '../core/time.js';
import {getCondition,getSkillTier,relationshipLabel,skillTiers} from '../core/state.js';
import {JOBS,jobLabel} from '../data/jobs.js';
import {availableActivities} from '../data/activities.js';

const SKILL_NAMES={mechanics:'Mekanik',learning:'Belajar',social:'Sosial',technology:'Teknologi'};

function money(value){ return 'Rp'+Math.max(0,Math.round(value)).toLocaleString('id-ID'); }
function compactMoney(value){ return 'Rp'+Math.round(value/1000).toLocaleString('id-ID')+'rb'; }
function esc(value=''){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}

function primarySkill(state){
  if(state.player.job==='mechanic_junior'||state.player.job==='mechanic_senior') return 'mechanics';
  if(state.player.job==='store_clerk') return 'social';
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
  return `${jobLabel(state.player.job)} · ${state.player.workplace}`;
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
    return `<div class="opp-card"><div class="row"><div><div class="label">PELUANG</div><div class="section-title" style="margin-top:4px">${esc(op.name)}</div><div class="muted small" style="margin-top:4px">${esc(op.summary)}</div></div>${expiry}</div><button class="btn primary" style="width:100%;margin-top:10px" data-opportunity="${esc(op.id)}">Ambil peluang</button></div>`;
  }).join('')}</div>`;
}

function renderLife(state,ui){
  const condition=getCondition(state.player.fatigue);
  const skillId=primarySkill(state), tier=getSkillTier(state.skills[skillId]||0), progress=skillProgress(state,skillId);
  const acts=availableActivities(state);
  return `<section id="life">
    ${ui.offlineSummary?`<div class="card event"><div class="label">SAAT KAMU PERGI</div><div class="section-title" style="font-size:1.1rem;margin-top:6px">Rutinitas tetap berjalan</div><div class="muted small" style="margin-top:8px;line-height:1.5">${ui.offlineSummary}</div><button class="btn primary" style="width:100%;margin-top:14px" data-ui="close-offline">Lanjutkan hidup</button></div>`:''}
    ${ui.milestone?`<div class="card event"><div class="label">PENCAPAIAN PROTOTIPE</div><div class="section-title" style="font-size:1.15rem;margin-top:6px">Hidupmu mulai punya arah sendiri</div><div class="muted small" style="margin-top:8px;line-height:1.5">Kamu sudah membuktikan bahwa satu karakter bisa berkembang lewat jalur yang berbeda, bukan hanya mengulang pekerjaan yang sama.</div><button class="btn primary" style="width:100%;margin-top:14px" data-ui="close-milestone">Lanjut bermain</button></div>`:''}
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
      <div class="note" style="margin-top:10px">Rutinitas hanya mengotomatisasi hal repetitif. Event dan keputusan penting tetap menunggumu.</div>
      <div class="toolbar"><button class="btn center" data-ui="simulate-offline" ${state.routine.enabled?'':'disabled'}>Simulasikan saat tidak bermain</button>${ui.installAvailable?'<button class="btn center" data-ui="install">Pasang aplikasi</button>':''}</div>
    </div>

    <div class="stats"><div class="stat"><div class="label">Uang</div><div class="value">${compactMoney(state.player.money)}</div></div><div class="stat"><div class="label">Kondisi</div><div class="value">${condition.label}</div></div><div class="stat"><div class="label">Karier</div><div class="value">${esc(state.player.job?jobLabel(state.player.job):'Belum bekerja')}</div></div></div>
  </section>`;
}

function renderWorld(state){
  const people=[];
  people.push({name:'Rian',relation:relationshipLabel(state.relationships.rian),desc:'Teman masa kecil · ramah, impulsif'});
  if(state.npc.pak_arman.known) people.push({name:'Pak Arman',relation:relationshipLabel(state.relationships.pak_arman),desc:'Pemilik bengkel · tegas, adil'});
  if(state.npc.dika.known) people.push({name:'Dika',relation:relationshipLabel(state.relationships.dika),desc:'Rekan bengkel · ambisius, kompetitif'});
  if(state.npc.maya.known) people.push({name:'Maya',relation:relationshipLabel(state.relationships.maya),desc:'Supervisor toko · tenang, praktis'});
  return `<section id="world">
    <div class="card"><div class="section-title">Peluang Aktif</div><div class="list">${state.opportunities.length?state.opportunities.map(o=>`<div class="item"><b>${esc(o.name)}</b><div class="muted small" style="margin-top:4px">${esc(o.summary)}</div></div>`).join(''):'<div class="empty">Belum ada peluang penting.</div>'}</div>
    <div class="section-title" style="margin-top:22px">Orang</div><div class="people">${people.map(p=>`<div class="person"><div class="row"><b>${esc(p.name)}</b><span class="small">${esc(p.relation)}</span></div><div class="muted small">${esc(p.desc)}</div></div>`).join('')}</div>
    <div class="section-title" style="margin-top:22px">Perubahan Terbaru</div><div class="list">${state.recent.length?state.recent.map(x=>`<div class="item small">${esc(x)}</div>`).join(''):'<div class="empty">Belum ada hal penting.</div>'}</div></div>
  </section>`;
}

function renderYou(state){
  const skills=state.discoveredSkills.map(id=>({id,name:SKILL_NAMES[id]||id,tier:getSkillTier(state.skills[id]||0).label}));
  return `<section id="you"><div class="card"><div class="section-title">Kamu</div><div class="list">${skills.map(s=>`<div class="item"><div class="row"><span>${esc(s.name)}</span><b>${esc(s.tier)}</b></div></div>`).join('')}</div>
  <div class="divider"></div><div class="section-title">Karier</div><div class="small" style="margin-top:6px">${esc(jobText(state))}</div>
  <div class="divider"></div><div class="section-title">Riwayat Hidup</div><div class="list">${state.history.map(x=>`<div class="item small">${esc(x)}</div>`).join('')}</div>
  <button class="btn center" style="width:100%;margin-top:16px" data-ui="reset">Mulai ulang save</button></div></section>`;
}

export function render(root,state,ui){
  const cal=getCalendar(state.time.totalHours),condition=getCondition(state.player.fatigue);
  root.innerHTML=`
    <header class="top"><div><div class="muted small">Umur ${cal.age} · Bulan ${cal.month} Hari ${cal.day} · ${String(cal.hour).padStart(2,'0')}:00</div><div class="name">${esc(state.player.name)}</div><div class="muted small">${esc(jobText(state))}</div></div><div><div class="money">${money(state.player.money)}</div><div class="muted small" style="text-align:right">Kondisi: ${condition.label}</div></div></header>
    <main>${ui.tab==='life'?renderLife(state,ui):ui.tab==='world'?renderWorld(state):renderYou(state)}</main>
    <nav class="tabs"><button class="tab ${ui.tab==='life'?'active':''}" data-tab="life">HIDUP</button><button class="tab ${ui.tab==='world'?'active':''}" data-tab="world">DUNIA</button><button class="tab ${ui.tab==='you'?'active':''}" data-tab="you">KAMU</button></nav>`;
}
