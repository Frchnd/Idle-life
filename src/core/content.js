const CONTENT_REGISTRY={activities:{},opportunities:{},events:{}};

function registerContent(type,definitions=[]){
  if(!CONTENT_REGISTRY[type]) throw new Error(`Tipe konten tidak dikenal: ${type}`);
  for(const def of definitions){
    if(!def?.id) throw new Error(`Konten ${type} tanpa id`);
    if(CONTENT_REGISTRY[type][def.id]) throw new Error(`ID konten duplikat: ${type}:${def.id}`);
    CONTENT_REGISTRY[type][def.id]=def;
  }
}

function getContent(type,id){ return CONTENT_REGISTRY[type]?.[id]||null; }
function listContent(type){ return Object.values(CONTENT_REGISTRY[type]||{}); }

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

function meetsRequirement(state,req){
  if(!req) return true;
  if(Array.isArray(req)) return req.every(item=>meetsRequirement(state,item));
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
    if(Object.prototype.hasOwnProperty.call(effect,'value')) effect.value=resolveContentValue(state,effect.value);
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
      cursor[parts[parts.length-1]]=effect.value;
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
  if(!meetsRequirements(state,def.requirements||[])) return {error:def.lockedText||'Aktivitas ini belum tersedia.'};
  applyContentEffects(state,def.effects||[]);
  return def.result||`${def.name} selesai.`;
}

function runDataOpportunity(state,id){
  const def=getContent('opportunities',id);
  if(!def) return null;
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
    choices:(def.choices||[]).map(choice=>({
      label:choice.label,
      hint:choice.hint,
      effects:choice.effects||[],
      result:choice.result||'Keputusan dibuat.'
    }))
  };
}

function nextDataEvent(state){
  const candidates=listContent('events')
    .filter(def=>meetsRequirements(state,def.requirements||[]))
    .sort((a,b)=>(b.priority||0)-(a.priority||0));
  return candidates.length?contentEventToRuntime(candidates[0]):null;
}

function validateContentFramework(){
  const errors=[];
  const knownEffectTypes=new Set([
    'money','fatigue','hours','skill','relationship','flag','promotion','store_progress','tech_progress','career_search_handled','side_income','asset','npc_state','job','npc_known','recent','history','opportunity','schedule','status_add','status_remove','trajectory','housing','salary_delta','salary_scale','job_clear','career_restructure','salary_negotiated','business_close','business_recover','business_reinvest','business_retainer','business_reputation','business_client_loss','business_stamp','business_hire_helper','business_delegate','business_owner_fulltime','business_helper_issue','business_market_strategy','business_market_reputation','path_increment','path_set','relationship_clamped'
  ]);
  for(const type of Object.keys(CONTENT_REGISTRY)){
    for(const def of listContent(type)){
      if(!def.id || !def.name && type!=='events') errors.push(`${type}:${def.id||'?'} tidak punya nama`);
      const groups=[...(def.effects?[def.effects]:[]),...(def.choices||[]).map(c=>c.effects||[])];
      for(const effects of groups) for(const effect of effects) if(effect.type && !knownEffectTypes.has(effect.type)) errors.push(`${type}:${def.id} memakai effect tidak dikenal: ${effect.type}`);
    }
  }
  return {ok:errors.length===0,errors,counts:Object.fromEntries(Object.entries(CONTENT_REGISTRY).map(([type,items])=>[type,Object.keys(items).length]))};
}
