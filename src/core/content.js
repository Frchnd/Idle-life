const CONTENT_REGISTRY={activities:{},opportunities:{},events:{},jobs:{},eventPools:{}};
const CONTENT_TEMPLATES={activities:{},opportunities:{},events:{},jobs:{}};
const REQUIREMENT_PRESETS={};
const CONTENT_PACKS={};

function cloneContent(value){ return value==null?value:JSON.parse(JSON.stringify(value)); }

function registerContentPack(id,definition){
  if(!id) throw new Error('Content pack harus punya id');
  if(CONTENT_PACKS[id]) throw new Error(`Content pack duplikat: ${id}`);
  const def=cloneContent(definition||{});
  def.id=id;
  def.version=Number(def.version||1);
  def.content=def.content||{};
  CONTENT_PACKS[id]=def;
  return def;
}

function getContentPack(id){ return CONTENT_PACKS[id]||null; }
function listContentPacks(){ return Object.values(CONTENT_PACKS); }

function contentPackOwner(type,id){
  for(const pack of listContentPacks()){
    if((pack.content?.[type]||[]).includes(id)) return pack.id;
  }
  return null;
}

function syncContentPackRuntime(state){
  const runtime=ensureContentRuntime(state);
  const packs=listContentPacks();
  const known=packs.map(pack=>pack.id);
  const hadPackRuntime=Object.keys(runtime.packVersions||{}).length>0;
  if(!hadPackRuntime || !Array.isArray(runtime.enabledPacks) || !runtime.enabledPacks.length){
    runtime.enabledPacks=packs.filter(pack=>pack.defaultEnabled!==false).map(pack=>pack.id);
  }else{
    runtime.enabledPacks=runtime.enabledPacks.filter(id=>known.includes(id));
    for(const pack of packs){
      if(runtime.packVersions[pack.id]===undefined && pack.defaultEnabled!==false && !runtime.enabledPacks.includes(pack.id)) runtime.enabledPacks.push(pack.id);
    }
  }
  runtime.packVersions=runtime.packVersions||{};
  for(const pack of packs) runtime.packVersions[pack.id]=pack.version;
  return runtime;
}

function contentEnabled(state,type,id){
  const owner=contentPackOwner(type,id);
  if(!owner) return true;
  const runtime=ensureContentRuntime(state);
  return !Array.isArray(runtime.enabledPacks) || !runtime.enabledPacks.length || runtime.enabledPacks.includes(owner);
}

function buildContentCatalog(){
  const byType={};
  const byTag={};
  const packs=listContentPacks().map(pack=>{
    const counts={};
    for(const [type,ids] of Object.entries(pack.content||{})) counts[type]=(ids||[]).length;
    return {id:pack.id,name:pack.name||pack.id,version:pack.version,description:pack.description||'',counts};
  });
  for(const [type,items] of Object.entries(CONTENT_REGISTRY)){
    byType[type]=Object.keys(items).length;
    for(const item of Object.values(items)){
      for(const tag of item.tags||[]){
        byTag[tag]=byTag[tag]||{count:0,types:{}};
        byTag[tag].count++;
        byTag[tag].types[type]=(byTag[tag].types[type]||0)+1;
      }
    }
  }
  return {packs,byType,byTag};
}

function registerContent(type,definitions=[]){
  if(!CONTENT_REGISTRY[type]) throw new Error(`Tipe konten tidak dikenal: ${type}`);
  for(const raw of definitions){
    const def=cloneContent(raw);
    if(!def?.id) throw new Error(`Konten ${type} tanpa id`);
    if(CONTENT_REGISTRY[type][def.id]) throw new Error(`ID konten duplikat: ${type}:${def.id}`);
    CONTENT_REGISTRY[type][def.id]=def;
  }
}

function getContent(type,id){ return CONTENT_REGISTRY[type]?.[id]||null; }
function listContent(type){ return Object.values(CONTENT_REGISTRY[type]||{}); }

function mergeContent(base,overrides){
  if(Array.isArray(overrides)) return cloneContent(overrides);
  if(!overrides || typeof overrides!=='object') return overrides===undefined?cloneContent(base):overrides;
  const out=(base && typeof base==='object' && !Array.isArray(base))?cloneContent(base):{};
  for(const [key,value] of Object.entries(overrides)){
    if(value && typeof value==='object' && !Array.isArray(value) && out[key] && typeof out[key]==='object' && !Array.isArray(out[key])) out[key]=mergeContent(out[key],value);
    else out[key]=cloneContent(value);
  }
  return out;
}

function registerContentTemplate(type,id,definition){
  if(!CONTENT_TEMPLATES[type]) throw new Error(`Template tidak mendukung tipe: ${type}`);
  if(!id) throw new Error('Template harus punya id');
  if(CONTENT_TEMPLATES[type][id]) throw new Error(`Template duplikat: ${type}:${id}`);
  CONTENT_TEMPLATES[type][id]=cloneContent(definition||{});
}

function defineFromTemplate(type,templateId,definition){
  const base=CONTENT_TEMPLATES[type]?.[templateId];
  if(!base) throw new Error(`Template tidak ditemukan: ${type}:${templateId}`);
  const def=mergeContent(base,definition||{});
  def.template=templateId;
  registerContent(type,[def]);
  return getContent(type,def.id);
}

function registerRequirementPreset(id,definition,requiredParams=[]){
  if(!id) throw new Error('Requirement preset harus punya id');
  if(REQUIREMENT_PRESETS[id]) throw new Error(`Requirement preset duplikat: ${id}`);
  REQUIREMENT_PRESETS[id]={definition:cloneContent(definition),requiredParams:[...requiredParams]};
}

function interpolatePreset(value,params){
  if(Array.isArray(value)) return value.map(item=>interpolatePreset(item,params));
  if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,interpolatePreset(v,params)]));
  if(typeof value!=='string') return value;
  const exact=value.match(/^\{\{([a-zA-Z0-9_]+)\}\}$/);
  if(exact && Object.prototype.hasOwnProperty.call(params,exact[1])) return params[exact[1]];
  return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g,(_,key)=>Object.prototype.hasOwnProperty.call(params,key)?String(params[key]):`{{${key}}}`);
}

function expandRequirement(req){
  if(!req || typeof req!=='object' || Array.isArray(req)) return req;
  if(!req.preset) return req;
  const preset=REQUIREMENT_PRESETS[req.preset];
  if(!preset) return {...req,__presetError:`Preset tidak ditemukan: ${req.preset}`};
  const params=req.params||{};
  const missing=preset.requiredParams.filter(key=>!Object.prototype.hasOwnProperty.call(params,key));
  if(missing.length) return {...req,__presetError:`Preset ${req.preset} kekurangan parameter: ${missing.join(', ')}`};
  return interpolatePreset(preset.definition,params);
}

function getStatePath(state,path){
  if(!path) return undefined;
  return String(path).split('.').reduce((obj,key)=>obj==null?undefined:obj[key],state);
}

function compareValue(actual,op,expected){
  switch(op||'eq'){
    case 'eq': return actual===expected;
    case 'neq': return actual!==expected;
    case 'gt': return Number(actual)>Number(expected);
    case 'gte': return Number(actual)>=Number(expected);
    case 'lt': return Number(actual)<Number(expected);
    case 'lte': return Number(actual)<=Number(expected);
    case 'includes': return Array.isArray(actual)?actual.includes(expected):String(actual??'').includes(String(expected));
    case 'not_includes': return Array.isArray(actual)?!actual.includes(expected):!String(actual??'').includes(String(expected));
    case 'truthy': return !!actual;
    case 'falsy': return !actual;
    default: return false;
  }
}

function meetsRequirement(state,rawReq){
  if(!rawReq) return true;
  if(Array.isArray(rawReq)) return rawReq.every(item=>meetsRequirement(state,item));
  const req=expandRequirement(rawReq);
  if(req?.__presetError) return false;
  if(req.all) return req.all.every(item=>meetsRequirement(state,item));
  if(req.any) return req.any.some(item=>meetsRequirement(state,item));
  if(req.not) return !meetsRequirement(state,req.not);
  if(req.path) return compareValue(getStatePath(state,req.path),req.op,req.value);
  if(req.flag) return compareValue(state.flags?.[req.flag],req.op||'eq',req.value===undefined?true:req.value);
  if(req.status) return compareValue(state.player?.statuses||[],req.present===false?'not_includes':'includes',req.status);
  if(req.relationship){
    const value=state.relationships?.[req.relationship]||0;
    if(req.min!==undefined && value<req.min) return false;
    if(req.max!==undefined && value>req.max) return false;
    return true;
  }
  if(req.skillTier){
    const rank={novice:0,basic:1,skilled:2,experienced:3,expert:4};
    const current=getSkillTier(state.skills?.[req.skillTier]||0).id;
    if(req.min && rank[current]<rank[req.min]) return false;
    if(req.max && rank[current]>rank[req.max]) return false;
    return true;
  }
  return true;
}

function meetsRequirements(state,requirements=[]){ return requirements.every(req=>meetsRequirement(state,req)); }

function resolveContentValue(state,spec){
  if(typeof spec==='number' || typeof spec==='string' || typeof spec==='boolean' || spec==null) return spec;
  let value=Number(spec.base||0);
  for(const rule of spec.rules||[]){
    if(meetsRequirements(state,rule.when||[])){
      if(rule.set!==undefined) value=Number(rule.set);
      if(rule.add!==undefined) value+=Number(rule.add);
      if(rule.multiply!==undefined) value*=Number(rule.multiply);
    }
  }
  if(spec.min!==undefined) value=Math.max(Number(spec.min),value);
  if(spec.max!==undefined) value=Math.min(Number(spec.max),value);
  return spec.round===false?value:Math.round(value);
}

function applyContentEffects(state,effects=[]){
  for(const raw of effects){
    if(raw.when && !meetsRequirements(state,raw.when)) continue;
    const effect={...raw};
    delete effect.when;
    if(Object.prototype.hasOwnProperty.call(effect,'value')){
      const rawValue=effect.value;
      const dynamicSpec=rawValue && typeof rawValue==='object' && !Array.isArray(rawValue) && ['base','rules','min','max','round'].some(key=>Object.prototype.hasOwnProperty.call(rawValue,key));
      effect.value=dynamicSpec?resolveContentValue(state,rawValue):cloneContent(rawValue);
    }
    if(effect.type==='path_increment'){
      const parts=effect.path.split('.');
      let cursor=state;
      for(let i=0;i<parts.length-1;i++) cursor=cursor[parts[i]]||(cursor[parts[i]]={});
      const key=parts[parts.length-1];
      cursor[key]=(Number(cursor[key])||0)+Number(effect.value||0);
      continue;
    }
    if(effect.type==='path_set'){
      const parts=effect.path.split('.');
      let cursor=state;
      for(let i=0;i<parts.length-1;i++) cursor=cursor[parts[i]]||(cursor[parts[i]]={});
      cursor[parts[parts.length-1]]=effect.fromPath?cloneContent(getStatePath(state,effect.fromPath)):effect.value;
      continue;
    }
    if(effect.type==='relationship_clamped'){
      const current=state.relationships[effect.target]||0;
      state.relationships[effect.target]=Math.max(effect.min??-100,Math.min(effect.max??100,current+Number(effect.value||0)));
      continue;
    }
    resolveEffects(state,[effect]);
  }
}

function runDataActivity(state,id){
  const def=getContent('activities',id);
  if(!def) return null;
  if(!contentEnabled(state,'activities',id)) return {error:'Konten ini sedang tidak aktif.'};
  if(!meetsRequirements(state,def.requirements||[])) return {error:def.lockedText||'Aktivitas ini belum tersedia.'};
  applyContentEffects(state,def.effects||[]);
  return def.result||`${def.name} selesai.`;
}

function runDataOpportunity(state,id){
  const def=getContent('opportunities',id);
  if(!def) return null;
  if(!contentEnabled(state,'opportunities',id)) return 'Konten ini sedang tidak aktif.';
  const active=state.opportunities?.some(item=>item.id===id);
  if(def.requiresActive!==false && !active) return 'Peluang itu sudah tidak tersedia.';
  if(!meetsRequirements(state,def.requirements||[])) return def.lockedText||'Syarat untuk peluang ini belum terpenuhi.';
  removeOpportunity(state,id);
  applyContentEffects(state,def.effects||[]);
  return def.result||'Peluang diambil.';
}

function contentEventToRuntime(def){
  return {
    id:def.id,
    type:def.type||'PERISTIWA',
    title:def.title,
    text:def.text,
    contentDriven:true,
    pool:def.pool||null,
    tags:[...(def.tags||[])],
    choices:(def.choices||[]).map(choice=>({
      label:choice.label,
      hint:choice.hint,
      effects:choice.effects||[],
      result:choice.result||'Keputusan dibuat.'
    }))
  };
}

function eventPoolScore(def){
  const pool=def.pool?getContent('eventPools',def.pool):null;
  return (pool?.priority||0)*1000+(def.priority||0);
}

function dataEventOnCooldown(state,def){
  const runtime=state.contentRuntime||{};
  if(def.once && runtime.eventHistory?.includes(def.id)) return true;
  const until=runtime.eventCooldowns?.[def.id]||0;
  return until>state.time.totalHours;
}

function eligibleDataEvents(state,options={}){
  const tagsAny=options.tagsAny||[];
  const tagsAll=options.tagsAll||[];
  const poolId=options.pool||null;
  return listContent('events').filter(def=>{
    if(!contentEnabled(state,'events',def.id)) return false;
    if(poolId && def.pool!==poolId) return false;
    const tags=def.tags||[];
    if(tagsAny.length && !tagsAny.some(tag=>tags.includes(tag))) return false;
    if(tagsAll.length && !tagsAll.every(tag=>tags.includes(tag))) return false;
    if(dataEventOnCooldown(state,def)) return false;
    return meetsRequirements(state,def.requirements||[]);
  }).sort((a,b)=>eventPoolScore(b)-eventPoolScore(a));
}

function ensureContentRuntime(state){
  state.contentRuntime=state.contentRuntime||{};
  state.contentRuntime.eventHistory=Array.isArray(state.contentRuntime.eventHistory)?state.contentRuntime.eventHistory:[];
  state.contentRuntime.eventCooldowns=state.contentRuntime.eventCooldowns||{};
  state.contentRuntime.poolHistory=state.contentRuntime.poolHistory||{};
  state.contentRuntime.poolRecent=state.contentRuntime.poolRecent||{};
  state.contentRuntime.packVersions=state.contentRuntime.packVersions||{};
  state.contentRuntime.enabledPacks=Array.isArray(state.contentRuntime.enabledPacks)?state.contentRuntime.enabledPacks:[];
  if(!Number.isFinite(Number(state.contentRuntime.rngSeed))) state.contentRuntime.rngSeed=137;
  return state.contentRuntime;
}

function nextContentRandom(state){
  const runtime=ensureContentRuntime(state);
  let seed=(Number(runtime.rngSeed)||137)>>>0;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  runtime.rngSeed=seed;
  return seed/4294967296;
}

function weightedEventWeight(state,def){
  const pool=def.pool?getContent('eventPools',def.pool):null;
  let weight=Math.max(0.01,Number(def.weight||1))*Math.max(0.01,Number(pool?.weight||1));
  const runtime=ensureContentRuntime(state);
  const recent=runtime.poolRecent?.[def.pool]||[];
  if(recent.includes(def.id)) weight*=recent[0]===def.id?0.15:0.45;
  if(runtime.poolHistory?.[def.pool]===def.id) weight*=0.25;
  return Math.max(0.001,weight);
}

function chooseWeightedEvent(state,candidates,options={}){
  if(!candidates.length) return null;
  const highestPoolPriority=Math.max(...candidates.map(def=>getContent('eventPools',def.pool)?.priority||0));
  let shortlist=candidates.filter(def=>(getContent('eventPools',def.pool)?.priority||0)===highestPoolPriority);
  const highestEventPriority=Math.max(...shortlist.map(def=>Number(def.priority||0)));
  shortlist=shortlist.filter(def=>Number(def.priority||0)>=highestEventPriority-(options.priorityBand??10));
  if(shortlist.length===1) return shortlist[0];
  const weights=shortlist.map(def=>weightedEventWeight(state,def));
  const total=weights.reduce((a,b)=>a+b,0);
  const random=typeof options.random==='function'?options.random():nextContentRandom(state);
  let cursor=random*total;
  for(let i=0;i<shortlist.length;i++){
    cursor-=weights[i];
    if(cursor<=0) return shortlist[i];
  }
  return shortlist[shortlist.length-1];
}

function nextDataEvent(state,options={}){
  const candidates=eligibleDataEvents(state,options);
  const picked=chooseWeightedEvent(state,candidates,options);
  return picked?contentEventToRuntime(picked):null;
}

function recordDataEventResolved(state,eventId){
  const def=getContent('events',eventId);
  if(!def) return;
  ensureContentRuntime(state);
  if(!state.contentRuntime.eventHistory.includes(eventId)) state.contentRuntime.eventHistory.push(eventId);
  if(def.cooldownHours) state.contentRuntime.eventCooldowns[eventId]=state.time.totalHours+Number(def.cooldownHours);
  if(def.pool){
    state.contentRuntime.poolHistory[def.pool]=eventId;
    const recent=Array.isArray(state.contentRuntime.poolRecent[def.pool])?state.contentRuntime.poolRecent[def.pool]:[];
    state.contentRuntime.poolRecent[def.pool]=[eventId,...recent.filter(id=>id!==eventId)].slice(0,3);
  }
}

function validateRequirement(req,path,errors,warnings){
  if(!req) return;
  if(Array.isArray(req)){ req.forEach((item,i)=>validateRequirement(item,`${path}[${i}]`,errors,warnings)); return; }
  if(req.preset){
    const preset=REQUIREMENT_PRESETS[req.preset];
    if(!preset){ errors.push(`${path} memakai preset tidak dikenal: ${req.preset}`); return; }
    const params=req.params||{};
    const missing=preset.requiredParams.filter(key=>!Object.prototype.hasOwnProperty.call(params,key));
    if(missing.length) errors.push(`${path} preset ${req.preset} kekurangan parameter: ${missing.join(', ')}`);
    return;
  }
  if(req.all) req.all.forEach((item,i)=>validateRequirement(item,`${path}.all[${i}]`,errors,warnings));
  if(req.any) req.any.forEach((item,i)=>validateRequirement(item,`${path}.any[${i}]`,errors,warnings));
  if(req.not) validateRequirement(req.not,`${path}.not`,errors,warnings);
  if(req.skillTier && !['mechanics','learning','social','technology'].includes(req.skillTier)) errors.push(`${path} memakai skill tidak dikenal: ${req.skillTier}`);
  if(req.relationship && !['family','rian','pak_arman','dika','maya','nadia','ari'].includes(req.relationship)) warnings.push(`${path} memakai relationship target baru: ${req.relationship}`);
}

function validateEffect(effect,path,errors,warnings,knownEffectTypes){
  if(!effect?.type){ errors.push(`${path} tidak punya effect.type`); return; }
  if(!knownEffectTypes.has(effect.type)){ errors.push(`${path} memakai effect tidak dikenal: ${effect.type}`); return; }
  if(effect.type==='skill' && !['mechanics','learning','social','technology'].includes(effect.skill)) errors.push(`${path} memakai skill tidak dikenal: ${effect.skill}`);
  if((effect.type==='relationship'||effect.type==='relationship_clamped') && !effect.target) errors.push(`${path} tidak punya target relationship`);
  if((effect.type==='path_increment'||effect.type==='path_set') && !effect.path) errors.push(`${path} tidak punya path`);
  if(effect.type==='opportunity' && !effect.opportunity?.id) errors.push(`${path} membuat opportunity tanpa id`);
  if(effect.when) (effect.when||[]).forEach((req,i)=>validateRequirement(req,`${path}.when[${i}]`,errors,warnings));
}

function validateContentFramework(){
  const errors=[],warnings=[];
  const knownEffectTypes=new Set([
    'money','fatigue','hours','skill','relationship','flag','promotion','store_progress','tech_progress','career_search_handled','side_income','asset','npc_state','job','npc_known','recent','history','opportunity','schedule','status_add','status_remove','trajectory','housing','salary_delta','salary_scale','job_clear','career_restructure','salary_negotiated','business_close','business_recover','business_reinvest','business_retainer','business_reputation','business_client_loss','business_stamp','business_hire_helper','business_delegate','business_owner_fulltime','business_helper_issue','business_market_strategy','business_market_reputation','path_increment','path_set','relationship_clamped'
  ]);
  const idPattern=/^[a-z0-9_]+$/;

  for(const [type,items] of Object.entries(CONTENT_REGISTRY)){
    for(const def of Object.values(items)){
      const label=`${type}:${def.id||'?'}`;
      if(!def.id) errors.push(`${type}:? tidak punya id`);
      else if(!idPattern.test(def.id)) errors.push(`${label} memakai id yang tidak konsisten`);
      if(type!=='events' && type!=='eventPools' && !def.name) errors.push(`${label} tidak punya nama`);
      if(def.template && !CONTENT_TEMPLATES[type]?.[def.template]) errors.push(`${label} memakai template tidak dikenal: ${def.template}`);
      (def.requirements||[]).forEach((req,i)=>validateRequirement(req,`${label}.requirements[${i}]`,errors,warnings));

      if(type==='activities'){
        if(!Number.isFinite(Number(def.duration)) || Number(def.duration)<=0) errors.push(`${label} punya duration tidak valid`);
        if(!Array.isArray(def.effects)) errors.push(`${label} tidak punya effects array`);
      }
      if(type==='jobs'){
        if(!def.workplace) errors.push(`${label} tidak punya workplace`);
        if(!Number.isFinite(Number(def.salary)) || Number(def.salary)<0) errors.push(`${label} punya salary tidak valid`);
        if(!Number.isFinite(Number(def.duration)) || Number(def.duration)<=0) errors.push(`${label} punya duration tidak valid`);
        if(!['mechanics','social','technology'].includes(def.skill)) errors.push(`${label} memakai skill pekerjaan tidak dikenal: ${def.skill}`);
      }
      if(type==='events'){
        if(!def.title || !def.text) errors.push(`${label} harus punya title dan text`);
        if(!Array.isArray(def.choices) || def.choices.length<2) errors.push(`${label} harus punya minimal 2 pilihan`);
        if(def.pool && !getContent('eventPools',def.pool)) errors.push(`${label} memakai event pool tidak dikenal: ${def.pool}`);
        if(def.tags && !Array.isArray(def.tags)) errors.push(`${label}.tags harus array`);
        if(def.weight!==undefined && (!Number.isFinite(Number(def.weight)) || Number(def.weight)<=0)) errors.push(`${label}.weight harus angka > 0`);
      }
      if(type==='eventPools'){
        if(!def.name) errors.push(`${label} tidak punya nama`);
        if(def.tags && !Array.isArray(def.tags)) errors.push(`${label}.tags harus array`);
        if(def.weight!==undefined && (!Number.isFinite(Number(def.weight)) || Number(def.weight)<=0)) errors.push(`${label}.weight harus angka > 0`);
      }

      const effectGroups=[];
      if(Array.isArray(def.effects)) effectGroups.push({effects:def.effects,path:`${label}.effects`});
      for(let i=0;i<(def.choices||[]).length;i++){
        const choice=def.choices[i];
        if(!choice.label) errors.push(`${label}.choices[${i}] tidak punya label`);
        effectGroups.push({effects:choice.effects||[],path:`${label}.choices[${i}].effects`});
      }
      for(const group of effectGroups) group.effects.forEach((effect,i)=>validateEffect(effect,`${group.path}[${i}]`,errors,warnings,knownEffectTypes));
    }
  }

  const packOwners={};
  for(const pack of listContentPacks()){
    const label=`pack:${pack.id}`;
    if(!/^[a-z0-9_]+$/.test(pack.id)) errors.push(`${label} memakai id yang tidak konsisten`);
    if(!pack.name) errors.push(`${label} tidak punya nama`);
    if(!Number.isInteger(pack.version) || pack.version<1) errors.push(`${label}.version harus integer >= 1`);
    for(const [type,ids] of Object.entries(pack.content||{})){
      if(!CONTENT_REGISTRY[type]){ errors.push(`${label} menunjuk tipe konten tidak dikenal: ${type}`); continue; }
      if(!Array.isArray(ids)){ errors.push(`${label}.content.${type} harus array`); continue; }
      for(const id of ids){
        if(!getContent(type,id)) errors.push(`${label} menunjuk konten yang tidak ada: ${type}:${id}`);
        const key=`${type}:${id}`;
        if(packOwners[key] && packOwners[key]!==pack.id) errors.push(`${key} dimiliki lebih dari satu pack: ${packOwners[key]}, ${pack.id}`);
        else packOwners[key]=pack.id;
      }
    }
  }

  for(const pack of listContentPacks()){
    for(const dependency of pack.dependsOn||[]){
      if(!getContentPack(dependency)) errors.push(`pack:${pack.id} bergantung pada pack yang tidak ada: ${dependency}`);
    }
  }
  for(const type of ['activities','opportunities','events','jobs']){
    for(const id of Object.keys(CONTENT_REGISTRY[type]||{})){
      if(!packOwners[`${type}:${id}`]) errors.push(`${type}:${id} belum dimiliki content pack mana pun`);
    }
  }

  for(const [type,templates] of Object.entries(CONTENT_TEMPLATES)){
    for(const [id,def] of Object.entries(templates)) if(!def || typeof def!=='object') errors.push(`Template ${type}:${id} tidak valid`);
  }

  return {
    ok:errors.length===0,
    errors,warnings,
    counts:Object.fromEntries(Object.entries(CONTENT_REGISTRY).map(([type,items])=>[type,Object.keys(items).length])),
    templates:Object.fromEntries(Object.entries(CONTENT_TEMPLATES).map(([type,items])=>[type,Object.keys(items).length])),
    presets:Object.keys(REQUIREMENT_PRESETS).length,
    packs:Object.keys(CONTENT_PACKS).length,
    catalog:buildContentCatalog()
  };
}
