// Preset requirement: reusable, parameterized, dan tetap terbaca manusia.
registerRequirementPreset('unemployed',{path:'player.job',op:'eq',value:null});
registerRequirementPreset('employed',{path:'player.job',op:'neq',value:null});
registerRequirementPreset('job_is',{path:'player.job',op:'eq',value:'{{job}}'},['job']);
registerRequirementPreset('money_min',{path:'player.money',op:'gte',value:'{{amount}}'},['amount']);
registerRequirementPreset('flag_false',{flag:'{{flag}}',value:false},['flag']);
registerRequirementPreset('status_present',{status:'{{status}}'},['status']);
registerRequirementPreset('career_work_min',{path:'career.workCount',op:'gte',value:'{{count}}'},['count']);
registerRequirementPreset('job_work_min',{path:'career.jobWorkCounts.{{job}}',op:'gte',value:'{{count}}'},['job','count']);
registerRequirementPreset('skill_min',{skillTier:'{{skill}}',min:'{{tier}}'},['skill','tier']);
registerRequirementPreset('relationship_min',{relationship:'{{target}}',min:'{{value}}'},['target','value']);
registerRequirementPreset('trajectory_is',{path:'life.trajectory',op:'eq',value:'{{trajectory}}'},['trajectory']);
registerRequirementPreset('asset_false',{path:'assets.{{asset}}',op:'eq',value:false},['asset']);
registerRequirementPreset('housing_is',{path:'housing.id',op:'eq',value:'{{housing}}'},['housing']);
registerRequirementPreset('certification_has',{path:'education.certifications',op:'includes',value:'{{certification}}'},['certification']);
registerRequirementPreset('certification_missing',{path:'education.certifications',op:'not_includes',value:'{{certification}}'},['certification']);
registerRequirementPreset('age_min',{age:{min:'{{age}}'}},['age']);
registerRequirementPreset('age_max',{age:{max:'{{age}}'}},['age']);
registerRequirementPreset('age_between',{age:{min:'{{min}}',max:'{{max}}'}},['min','max']);

registerContentTemplate('jobs','standard_job',{
  duration:8,
  skillXp:14,
  fatigue:15,
  tags:['employment','full_time']
});
registerContentTemplate('jobs','entry_job',{
  duration:8,
  skillXp:15,
  fatigue:15,
  level:'entry',
  tags:['employment','full_time','entry']
});
registerContentTemplate('jobs','advanced_job',{
  duration:8,
  skillXp:14,
  fatigue:16,
  level:'advanced',
  tags:['employment','full_time','advanced']
});

registerContentTemplate('activities','timed_activity',{
  tags:['routine'],
  requirements:[],
  effects:[]
});
registerContentTemplate('opportunities','debt_repayment',{
  tags:['finance','debt'],
  requirements:[],
  effects:[]
});
registerContentTemplate('opportunities','learning_investment',{
  tags:['learning','investment'],
  requirements:[],
  effects:[]
});
registerContentTemplate('opportunities','asset_purchase',{
  tags:['finance','asset','investment'],
  requirements:[],
  effects:[]
});
registerContentTemplate('opportunities','life_change',{
  tags:['life','major_decision'],
  requirements:[],
  effects:[]
});
registerContentTemplate('events','first_day',{
  type:'HARI PERTAMA',
  priority:60,
  weight:1,
  pool:'first_days',
  tags:['career','first_day'],
  once:true,
  choices:[]
});
registerContentTemplate('events','career_lead',{
  type:'PELUANG KERJA',
  priority:70,
  weight:1,
  pool:'early_career',
  tags:['career','opportunity'],
  once:true,
  choices:[]
});
registerContentTemplate('events','life_milestone',{
  type:'HUBUNGAN',
  priority:50,
  weight:1,
  pool:'life',
  tags:['life','relationship','milestone'],
  once:true,
  choices:[]
});
registerContentTemplate('events','major_choice',{
  type:'KEPUTUSAN BESAR',
  priority:65,
  weight:1,
  pool:'major_decisions',
  tags:['life','major_decision'],
  once:true,
  choices:[]
});
registerContentTemplate('events','learning_lead',{
  type:'PELUANG BELAJAR',
  priority:45,
  weight:1,
  pool:'learning',
  tags:['learning','opportunity'],
  once:true,
  choices:[]
});

registerContent('eventPools',[
  {id:'urgent',name:'Kondisi Mendesak',priority:100,weight:1,tags:['condition','urgent']},
  {id:'early_career',name:'Awal Karier',priority:80,weight:1,tags:['career','opportunity']},
  {id:'major_decisions',name:'Keputusan Besar',priority:70,weight:1,tags:['life','major_decision']},
  {id:'first_days',name:'Hari Pertama',priority:60,weight:1,tags:['career','first_day']},
  {id:'learning',name:'Belajar & Investasi Diri',priority:50,weight:1,tags:['learning','opportunity']},
  {id:'life',name:'Kehidupan',priority:40,weight:1,tags:['life','relationship']}
]);
