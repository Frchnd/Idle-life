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
registerContentTemplate('events','first_day',{
  type:'HARI PERTAMA',
  priority:60,
  pool:'first_days',
  tags:['career','first_day'],
  once:true,
  choices:[]
});
registerContentTemplate('events','career_lead',{
  type:'PELUANG KERJA',
  priority:70,
  pool:'early_career',
  tags:['career','opportunity'],
  once:true,
  choices:[]
});

registerContent('eventPools',[
  {id:'urgent',name:'Kondisi Mendesak',priority:100,tags:['condition','urgent']},
  {id:'early_career',name:'Awal Karier',priority:80,tags:['career','opportunity']},
  {id:'first_days',name:'Hari Pertama',priority:60,tags:['career','first_day']},
  {id:'life',name:'Kehidupan',priority:40,tags:['life','relationship']}
]);
