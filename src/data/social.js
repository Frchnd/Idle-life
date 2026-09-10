const SOCIAL_NPCS={
  andi:{
    id:'andi',name:'Andi',role:'Mahasiswa komunitas',image:'./assets/portraits/andi.webp',
    schedules:[
      {location:'kampus_harapan',days:[0,1,2,3,4],start:9,end:17},
      {location:'gym_sehat',days:[1,3],start:18,end:22}
    ]
  },
  bu_lestari:{
    id:'bu_lestari',name:'Bu Lestari',role:'Pedagang pasar',image:'./assets/portraits/bu_lestari.webp',
    schedules:[{location:'pasar_tradisional',days:[0,1,2,3,4,5,6],start:6,end:15}]
  },
  sari:{
    id:'sari',name:'Sari',role:'Barista Kafe Senja',image:'./assets/portraits/sari.webp',
    schedules:[
      {location:'kafe_senja',days:[0,1,2,4,5,6],start:10,end:20},
      {location:'gym_sehat',days:[3],start:18,end:21}
    ]
  },
  dimas:{
    id:'dimas',name:'Dimas',role:'Koordinator logistik',image:'./assets/portraits/dimas.webp',
    schedules:[{location:'gym_sehat',days:[0,2,4],start:18,end:22}]
  }
};

const SOCIAL_DAY_NAMES=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
