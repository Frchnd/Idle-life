// Build Y — pendidikan lanjutan sebagai jembatan dari skill ke posisi spesialis.
registerContent('certifications',[
  {
    id:'engine_diagnostics',name:'Sertifikasi Diagnostik Mesin',skill:'mechanics',cost:650000,duration:16,
    opportunityId:'cert_engine_diagnostics',jobId:'mechanic_diagnostic',jobOpportunityId:'job_mechanic_diagnostic',workplaceId:'sinar_jaya',
    unlockRequirements:[{preset:'skill_min',params:{skill:'mechanics',tier:'skilled'}}],
    jobUnlockRequirements:[{preset:'certification_has',params:{certification:'engine_diagnostics'}},{path:'world.workplaces.sinar_jaya.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'mechanic_diagnostic'}]
  },
  {
    id:'retail_operations',name:'Pelatihan Operasional Retail',skill:'social',cost:450000,duration:12,
    opportunityId:'cert_retail_operations',jobId:'operations_coordinator',jobOpportunityId:'job_operations_coordinator',workplaceId:'serba_ada',
    unlockRequirements:[{preset:'skill_min',params:{skill:'social',tier:'skilled'}}],
    jobUnlockRequirements:[{preset:'certification_has',params:{certification:'retail_operations'}},{path:'world.workplaces.serba_ada.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'operations_coordinator'}]
  },
  {
    id:'network_foundations',name:'Sertifikasi Jaringan Dasar',skill:'technology',cost:600000,duration:16,
    opportunityId:'cert_network_foundations',jobId:'network_technician',jobOpportunityId:'job_network_technician',workplaceId:'nusa_komputer',
    unlockRequirements:[{preset:'skill_min',params:{skill:'technology',tier:'skilled'}},{path:'assets.laptop',op:'eq',value:true}],
    jobUnlockRequirements:[{preset:'certification_has',params:{certification:'network_foundations'}},{path:'world.workplaces.nusa_komputer.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'network_technician'}]
  }
]);

registerContent('opportunities',[
  {
    id:'cert_engine_diagnostics',name:'Sertifikasi Diagnostik Mesin',tags:['learning','career','mechanics','certification'],
    requirements:[{preset:'certification_missing',params:{certification:'engine_diagnostics'}},{preset:'money_min',params:{amount:650000}}],
    lockedText:'Butuh Rp650rb untuk mengikuti sertifikasi ini.',
    effects:[{type:'money',value:-650000},{type:'hours',value:16},{type:'fatigue',value:18},{type:'skill',skill:'mechanics',value:70},{type:'skill',skill:'learning',value:35},{type:'certification',certification:'engine_diagnostics'},{type:'history',text:'Umur 18 · Menyelesaikan Sertifikasi Diagnostik Mesin.'},{type:'recent',text:'Kamu sekarang punya bukti kompetensi untuk pekerjaan diagnostik mesin.'}],
    result:'Sertifikasi selesai. Jalur Teknisi Diagnostik sekarang bisa terbuka ketika Bengkel Sinar Jaya punya ruang.'
  },
  {
    id:'cert_retail_operations',name:'Pelatihan Operasional Retail',tags:['learning','career','retail','certification'],
    requirements:[{preset:'certification_missing',params:{certification:'retail_operations'}},{preset:'money_min',params:{amount:450000}}],
    lockedText:'Butuh Rp450rb untuk mengikuti pelatihan ini.',
    effects:[{type:'money',value:-450000},{type:'hours',value:12},{type:'fatigue',value:14},{type:'skill',skill:'social',value:60},{type:'skill',skill:'learning',value:28},{type:'certification',certification:'retail_operations'},{type:'history',text:'Umur 18 · Menyelesaikan Pelatihan Operasional Retail.'},{type:'recent',text:'Kamu mulai punya dasar formal untuk mengelola operasional toko.'}],
    result:'Pelatihan selesai. Jalur Koordinator Operasional sekarang bisa terbuka saat cabang cukup sehat.'
  },
  {
    id:'cert_network_foundations',name:'Sertifikasi Jaringan Dasar',tags:['learning','career','technology','certification'],
    requirements:[{preset:'certification_missing',params:{certification:'network_foundations'}},{path:'assets.laptop',op:'eq',value:true},{preset:'money_min',params:{amount:600000}}],
    lockedText:'Butuh laptop sendiri dan Rp600rb untuk mengikuti sertifikasi ini.',
    effects:[{type:'money',value:-600000},{type:'hours',value:16},{type:'fatigue',value:16},{type:'skill',skill:'technology',value:72},{type:'skill',skill:'learning',value:32},{type:'certification',certification:'network_foundations'},{type:'history',text:'Umur 18 · Menyelesaikan Sertifikasi Jaringan Dasar.'},{type:'recent',text:'Kemampuan teknologimu sekarang punya spesialisasi jaringan yang lebih jelas.'}],
    result:'Sertifikasi selesai. Posisi Teknisi Jaringan sekarang bisa terbuka di Nusa Komputer.'
  },
  {
    id:'job_mechanic_diagnostic',name:'Posisi Teknisi Diagnostik',tags:['career','mechanics','specialist','certified'],
    requirements:[{preset:'certification_has',params:{certification:'engine_diagnostics'}},{path:'world.workplaces.sinar_jaya.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'mechanic_diagnostic'}],
    effects:[{type:'job',job:'mechanic_diagnostic',workplace:'Bengkel Sinar Jaya',salary:230000},{type:'status_remove',status:'gaji_ditekan'},{type:'status_remove',status:'jam_lebih_fleksibel'},{type:'status_remove',status:'peran_ganda'},{type:'npc_known',npc:'pak_arman'},{type:'history',text:'Umur 18 · Masuk ke posisi spesialis sebagai Teknisi Diagnostik.'},{type:'recent',text:'Sertifikasi dan pengalamanmu membawamu ke pekerjaan diagnostik yang lebih bernilai.'}],
    result:'Kamu sekarang bekerja sebagai Teknisi Diagnostik dengan gaji Rp230rb/hari.'
  },
  {
    id:'job_operations_coordinator',name:'Posisi Koordinator Operasional',tags:['career','retail','specialist','certified'],
    requirements:[{preset:'certification_has',params:{certification:'retail_operations'}},{path:'world.workplaces.serba_ada.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'operations_coordinator'}],
    effects:[{type:'job',job:'operations_coordinator',workplace:'Toko Serba Ada',salary:195000},{type:'status_remove',status:'gaji_ditekan'},{type:'status_remove',status:'jam_lebih_fleksibel'},{type:'status_remove',status:'peran_ganda'},{type:'npc_known',npc:'maya'},{type:'history',text:'Umur 18 · Menjadi Koordinator Operasional di Toko Serba Ada.'},{type:'recent',text:'Pelatihan operasionalmu berubah menjadi tanggung jawab kerja yang nyata.'}],
    result:'Kamu sekarang bekerja sebagai Koordinator Operasional dengan gaji Rp195rb/hari.'
  },
  {
    id:'job_network_technician',name:'Posisi Teknisi Jaringan',tags:['career','technology','specialist','certified'],
    requirements:[{preset:'certification_has',params:{certification:'network_foundations'}},{path:'world.workplaces.nusa_komputer.health',op:'gte',value:46},{path:'player.job',op:'neq',value:'network_technician'}],
    effects:[{type:'job',job:'network_technician',workplace:'Nusa Komputer',salary:225000},{type:'status_remove',status:'gaji_ditekan'},{type:'status_remove',status:'jam_lebih_fleksibel'},{type:'status_remove',status:'peran_ganda'},{type:'npc_known',npc:'nadia'},{type:'history',text:'Umur 18 · Masuk ke posisi Teknisi Jaringan di Nusa Komputer.'},{type:'recent',text:'Sertifikasi jaringan membuatmu dipercaya menangani pekerjaan teknologi yang lebih spesifik.'}],
    result:'Kamu sekarang bekerja sebagai Teknisi Jaringan dengan gaji Rp225rb/hari.'
  }
]);
