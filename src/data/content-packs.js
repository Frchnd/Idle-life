// Content packs memisahkan ownership konten dari engine.
// Nanti ekspansi dapat menambah pack sendiri tanpa mengubah core simulation.
registerContentPack('core_life',{
  name:'Core Life',version:1,
  description:'Aktivitas hidup dasar, kondisi mendesak, dan milestone hubungan utama.',
  content:{
    activities:['family','rian'],
    events:['exhausted','family_milestone','rian_milestone']
  }
});

registerContentPack('career_core',{
  name:'Career Core',version:1,dependsOn:['core_life'],
  description:'Pekerjaan awal, pencarian karier, hari pertama, dan keputusan arah hidup.',
  content:{
    jobs:['mechanic_junior','mechanic_senior','store_clerk','store_supervisor','it_assistant'],
    activities:['job_search','career_search'],
    events:['job_leads','store_lead','first_workshop','first_store','trajectory_choice']
  }
});

registerContentPack('learning_technology',{
  name:'Learning & Technology',version:1,dependsOn:['core_life'],
  description:'Investasi belajar Teknologi dan aset yang membuka kerja lepas.',
  content:{
    opportunities:['tech_course','buy_laptop'],
    events:['tech_course_offer','laptop_offer_data']
  }
});

registerContentPack('life_finance',{
  name:'Life & Finance',version:1,dependsOn:['core_life'],
  description:'Pelunasan utang dan keputusan tempat tinggal.',
  content:{
    opportunities:['repay_family','repay_rian','rent_room']
  }
});


registerContentPack('career_specialization',{
  name:'Career Specialization',version:1,dependsOn:['career_core','learning_technology'],
  description:'Sertifikasi lanjutan dan posisi spesialis untuk tiga jalur karier utama.',
  content:{
    jobs:['mechanic_diagnostic','operations_coordinator','network_technician'],
    certifications:['engine_diagnostics','retail_operations','network_foundations'],
    opportunities:['cert_engine_diagnostics','cert_retail_operations','cert_network_foundations','job_mechanic_diagnostic','job_operations_coordinator','job_network_technician']
  }
});


registerContentPack('city_expansion_one',{
  name:'City Expansion I',version:1,dependsOn:['career_core'],
  description:'Kafe Senja dan Lintas Kota Logistik, beserta karakter, event awal, dan jalur promosi.',
  content:{
    jobs:['cafe_crew','cafe_lead','warehouse_staff','dispatch_coordinator'],
    events:['city_job_leads','city_career_discovery','first_cafe','first_logistics']
  }
});
