defineFromTemplate('jobs','entry_job',{
  id:'mechanic_junior',name:'Mekanik Junior',workplace:'Bengkel Sinar Jaya',workplaceId:'sinar_jaya',salary:120000,
  skill:'mechanics',fatigue:18,tags:['employment','full_time','entry','mechanics']
});
defineFromTemplate('jobs','entry_job',{
  id:'store_clerk',name:'Pramuniaga',workplace:'Toko Serba Ada',workplaceId:'serba_ada',salary:100000,
  skill:'social',skillXp:13,fatigue:14,tags:['employment','full_time','entry','retail']
});
defineFromTemplate('jobs','advanced_job',{
  id:'mechanic_senior',name:'Mekanik Senior',workplace:'Bengkel Sinar Jaya',workplaceId:'sinar_jaya',salary:170000,
  skill:'mechanics',fatigue:18,tags:['employment','full_time','advanced','mechanics']
});
defineFromTemplate('jobs','advanced_job',{
  id:'store_supervisor',name:'Supervisor Toko',workplace:'Toko Serba Ada',workplaceId:'serba_ada',salary:145000,
  skill:'social',skillXp:14,fatigue:15,tags:['employment','full_time','advanced','retail']
});
defineFromTemplate('jobs','entry_job',{
  id:'it_assistant',name:'Asisten Teknisi IT',workplace:'Nusa Komputer',workplaceId:'nusa_komputer',salary:140000,
  skill:'technology',skillXp:15,fatigue:15,tags:['employment','full_time','entry','technology']
});

const JOBS=Object.fromEntries(listContent('jobs').map(job=>[job.id,job]));
function jobLabel(jobId){ return JOBS[jobId]?.name||'Belum bekerja'; }
