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



// Build Y — posisi spesialis yang dibuka lewat pendidikan/sertifikasi.
defineFromTemplate('jobs','advanced_job',{
  id:'mechanic_diagnostic',name:'Teknisi Diagnostik',workplace:'Bengkel Sinar Jaya',workplaceId:'sinar_jaya',salary:230000,
  skill:'mechanics',skillXp:18,fatigue:19,tags:['employment','full_time','specialist','mechanics','certified']
});
defineFromTemplate('jobs','advanced_job',{
  id:'operations_coordinator',name:'Koordinator Operasional',workplace:'Toko Serba Ada',workplaceId:'serba_ada',salary:195000,
  skill:'social',skillXp:17,fatigue:16,tags:['employment','full_time','specialist','retail','certified']
});
defineFromTemplate('jobs','advanced_job',{
  id:'network_technician',name:'Teknisi Jaringan',workplace:'Nusa Komputer',workplaceId:'nusa_komputer',salary:225000,
  skill:'technology',skillXp:18,fatigue:17,tags:['employment','full_time','specialist','technology','certified']
});

// Build Z — dua industri baru di kota.
defineFromTemplate('jobs','entry_job',{
  id:'cafe_crew',name:'Barista Pemula',workplace:'Kafe Senja',workplaceId:'kafe_senja',salary:110000,
  skill:'hospitality',skillXp:15,fatigue:14,tags:['employment','full_time','entry','hospitality']
});
defineFromTemplate('jobs','advanced_job',{
  id:'cafe_lead',name:'Barista Senior',workplace:'Kafe Senja',workplaceId:'kafe_senja',salary:165000,
  skill:'hospitality',skillXp:17,fatigue:15,tags:['employment','full_time','advanced','hospitality']
});
defineFromTemplate('jobs','entry_job',{
  id:'warehouse_staff',name:'Staf Gudang',workplace:'Lintas Kota Logistik',workplaceId:'lintas_kota',salary:120000,
  skill:'logistics',skillXp:15,fatigue:17,tags:['employment','full_time','entry','logistics']
});
defineFromTemplate('jobs','advanced_job',{
  id:'dispatch_coordinator',name:'Koordinator Pengiriman',workplace:'Lintas Kota Logistik',workplaceId:'lintas_kota',salary:180000,
  skill:'logistics',skillXp:17,fatigue:16,tags:['employment','full_time','advanced','logistics']
});

const JOBS=Object.fromEntries(listContent('jobs').map(job=>[job.id,job]));
function jobLabel(jobId){ return JOBS[jobId]?.name||'Belum bekerja'; }
