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
  }
};

export function jobLabel(jobId){ return JOBS[jobId]?.name||'Belum bekerja'; }
