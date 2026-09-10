const HOUSING_OPTIONS={
  family_home:{
    id:'family_home',name:'Rumah Keluarga',label:'Bersama keluarga',neighborhood:'Kampung Melati',image:'./assets/housing/family_home.webp',
    monthlyCost:600000,deposit:0,moveHours:3,privacy:'Terbatas',restRecovery:45,studyFatigue:10,studyLearning:10,studyTechnology:10,
    benefit:'Biaya paling ringan · dekat keluarga',tradeoff:'Akses ke pusat kota lebih lambat',
    commute:{sinar_jaya:0,serba_ada:1,nusa_komputer:1,kafe_senja:1,lintas_kota:2},
    cityTravel:{kampus_harapan:1,pasar_tradisional:0,gym_sehat:1,kafe_senja:1}
  },
  rented_room:{
    id:'rented_room',name:'Kost Pusat Kota',label:'Kost Pusat Kota',neighborhood:'Pusat Kota',image:'./assets/housing/rented_room.webp',
    monthlyCost:1100000,deposit:1200000,moveHours:6,privacy:'Tinggi',restRecovery:52,studyFatigue:7,studyLearning:13,studyTechnology:13,
    benefit:'Privasi tinggi · akses kota cepat',tradeoff:'Biaya hidup paling berat',
    commute:{sinar_jaya:1,serba_ada:0,nusa_komputer:0,kafe_senja:0,lintas_kota:1},
    cityTravel:{kampus_harapan:0,pasar_tradisional:0,gym_sehat:0,kafe_senja:0}
  },
  shared_house:{
    id:'shared_house',name:'Rumah Bersama Cendana',label:'Rumah bersama',neighborhood:'Cendana',image:'./assets/housing/shared_house.webp',
    monthlyCost:850000,deposit:650000,moveHours:6,privacy:'Sedang',restRecovery:48,studyFatigue:9,studyLearning:11,studyTechnology:11,socialBonus:2,
    benefit:'Biaya sedang · akses sosial kuat',tradeoff:'Ruang pribadi lebih terbatas',
    commute:{sinar_jaya:1,serba_ada:0,nusa_komputer:1,kafe_senja:0,lintas_kota:1},
    cityTravel:{kampus_harapan:0,pasar_tradisional:0,gym_sehat:0,kafe_senja:0}
  },
  outskirts_room:{
    id:'outskirts_room',name:'Kontrakan Tepi Kota',label:'Kontrakan tepi kota',neighborhood:'Tegal Asri',image:'./assets/housing/outskirts_room.webp',
    monthlyCost:750000,deposit:500000,moveHours:7,privacy:'Tinggi',restRecovery:56,studyFatigue:8,studyLearning:12,studyTechnology:12,
    benefit:'Lebih tenang · biaya relatif ringan',tradeoff:'Perjalanan ke pusat kota lebih panjang',
    commute:{sinar_jaya:0,serba_ada:1,nusa_komputer:2,kafe_senja:2,lintas_kota:0},
    cityTravel:{kampus_harapan:1,pasar_tradisional:1,gym_sehat:1,kafe_senja:2}
  }
};
