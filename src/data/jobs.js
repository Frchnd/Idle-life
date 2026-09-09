export const JOBS={
  mechanic_junior:{
    id:'mechanic_junior',name:'Mekanik Junior',workplace:'Bengkel Sinar Jaya',salary:120000,duration:8,
    skill:'mechanics',skillXp:15,fatigue:18
  },
  store_clerk:{
    id:'store_clerk',name:'Pramuniaga',workplace:'Toko Serba Ada',salary:100000,duration:8,
    skill:'social',skillXp:13,fatigue:14
  },
  mechanic_senior:{
    id:'mechanic_senior',name:'Mekanik Senior',workplace:'Bengkel Sinar Jaya',salary:170000,duration:8,
    skill:'mechanics',skillXp:14,fatigue:18
  },
  store_supervisor:{
    id:'store_supervisor',name:'Supervisor Toko',workplace:'Toko Serba Ada',salary:145000,duration:8,
    skill:'social',skillXp:14,fatigue:15
  },
  it_assistant:{
    id:'it_assistant',name:'Asisten Teknisi IT',workplace:'Nusa Komputer',salary:140000,duration:8,
    skill:'technology',skillXp:15,fatigue:15
  }
};

export function jobLabel(jobId){ return JOBS[jobId]?.name||'Belum bekerja'; }
