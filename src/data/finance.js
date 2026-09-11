const LIFESTYLE_OPTIONS={
  frugal:{
    id:'frugal',name:'Hemat',monthlyCost:180000,
    restBonus:-3,studyFatigue:1,workFatigue:1,citySocialBonus:0,
    summary:'Pengeluaran ringan, tapi kenyamanan harian lebih terbatas.',
    tone:'warning'
  },
  balanced:{
    id:'balanced',name:'Seimbang',monthlyCost:350000,
    restBonus:0,studyFatigue:0,workFatigue:0,citySocialBonus:1,
    summary:'Cukup nyaman tanpa terlalu menekan arus kas.',
    tone:'info'
  },
  comfortable:{
    id:'comfortable',name:'Nyaman',monthlyCost:600000,
    restBonus:4,studyFatigue:-1,workFatigue:-1,citySocialBonus:2,
    summary:'Lebih nyaman dan ringan secara mental, tapi biaya rutin tinggi.',
    tone:'positive'
  }
};

const TRANSPORT_OPTIONS={
  public:{
    id:'public',name:'Angkot & Ojek',purchaseCost:0,monthlyCost:120000,
    commuteReduction:0,cityReduction:0,travelFatigue:0,
    summary:'Tanpa modal awal. Fleksibel, tapi waktu perjalanan tetap terasa.'
  },
  bicycle:{
    id:'bicycle',name:'Sepeda Bekas',purchaseCost:550000,monthlyCost:40000,
    commuteReduction:1,cityReduction:1,travelFatigue:1,
    summary:'Murah dirawat dan memangkas perjalanan dekat, tapi sedikit lebih melelahkan.'
  },
  motorbike:{
    id:'motorbike',name:'Motor Bekas',purchaseCost:2800000,monthlyCost:260000,
    commuteReduction:1,cityReduction:1,travelFatigue:-1,
    summary:'Mobilitas cepat dan nyaman, tapi butuh modal serta biaya rutin terbesar.'
  },
  motorbike_reliable:{
    id:'motorbike_reliable',name:'Motor Harian Andal',purchaseCost:3400000,monthlyCost:320000,
    commuteReduction:2,cityReduction:2,travelFatigue:-2,upgradeFrom:'motorbike',
    summary:'Upgrade tukar tambah dari motor bekas: lebih cepat, lebih stabil, dan cocok untuk hidup yang makin padat.'
  }
};
