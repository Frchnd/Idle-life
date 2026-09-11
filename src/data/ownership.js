const MAJOR_ASSETS={
  business_rig:{
    id:'business_rig',name:'Peralatan Usaha Profesional',category:'Usaha',image:'./assets/scenes/business.webp',
    purchaseCost:2400000,maintenanceCost:280000,maintenanceHours:4,acquireHours:5,
    summary:'Peralatan yang lebih serius untuk menangani pekerjaan dengan ritme usaha, bukan sekadar kerja sampingan.',
    benefit:'+kapasitas dan nilai pekerjaan usaha',
    unlock(state){const b=state.business||{};return !!b.active && (b.equipmentLevel||0)>=2 && (b.reputation||0)>=22;}
  },
  owned_workspace:{
    id:'owned_workspace',name:'Unit Kerja Milik Sendiri',category:'Properti',image:'./assets/scenes/business.webp',
    purchaseCost:7500000,maintenanceCost:650000,maintenanceHours:6,acquireHours:12,
    summary:'Petak kecil yang benar-benar kamu miliki untuk menjalankan usaha. Mahal, tapi usaha tidak lagi sepenuhnya bergantung pada tempat pinjaman atau sewaan.',
    benefit:'+kapasitas, biaya tetap lebih ringan, reputasi pasar',
    unlock(state){const b=state.business||{};return !!b.active && (b.reputation||0)>=35 && (b.retainedClients||0)>=1 && (b.totalProfit||0)>=1500000;}
  }
};
