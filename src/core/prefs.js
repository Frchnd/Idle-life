const PREFS_KEY='hidup-app-prefs-v1';
const DEFAULT_PREFS={theme:'system',textSize:'normal',motion:true,onboardingSeen:false};

function loadPrefs(){
  try{
    const raw=localStorage.getItem(PREFS_KEY);
    if(!raw) return {...DEFAULT_PREFS};
    const saved=JSON.parse(raw);
    return sanitizePrefs({...DEFAULT_PREFS,...saved});
  }catch{
    return {...DEFAULT_PREFS};
  }
}

function sanitizePrefs(prefs){
  return {
    theme:['system','light','dark'].includes(prefs.theme)?prefs.theme:'system',
    textSize:['normal','large'].includes(prefs.textSize)?prefs.textSize:'normal',
    motion:prefs.motion!==false,
    onboardingSeen:prefs.onboardingSeen===true
  };
}

function savePrefs(prefs){
  const safe=sanitizePrefs(prefs);
  localStorage.setItem(PREFS_KEY,JSON.stringify(safe));
  return safe;
}

function resolvedTheme(prefs){
  if(prefs.theme==='light'||prefs.theme==='dark') return prefs.theme;
  return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
}

function applyPrefs(prefs){
  const safe=sanitizePrefs(prefs);
  const root=document.documentElement;
  const theme=resolvedTheme(safe);
  root.dataset.theme=theme;
  root.dataset.textSize=safe.textSize;
  root.dataset.motion=safe.motion?'on':'off';
  root.style.colorScheme=theme;
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta) themeMeta.setAttribute('content',theme==='dark'?'#171b33':'#78cfff');
  return safe;
}
