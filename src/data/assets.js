const PERSONAL_ASSETS={
  laptop:{
    id:'laptop',name:'Laptop Bekas',category:'Produktif',image:'./assets/scenes/tech.webp',
    purchaseCost:750000,maintenanceCost:180000,maintenanceHours:2,buyable:false,
    summary:'Membuka kerja teknologi dari rumah dan sertifikasi jaringan.',
    benefit:'Kerja teknologi & belajar digital',wearLabel:'Dipakai untuk kerja teknologi.'
  },
  mechanic_toolkit:{
    id:'mechanic_toolkit',name:'Toolkit Mekanik Pribadi',category:'Produktif',image:'./assets/scenes/workshop.webp',
    purchaseCost:450000,maintenanceCost:120000,maintenanceHours:2,buyable:true,unlockSkill:'mechanics',unlockXp:100,
    summary:'Peralatan sendiri untuk servis kecil di luar bengkel.',
    benefit:'Servis sampingan lebih bernilai',wearLabel:'Aus saat dipakai servis.'
  },
  study_desk:{
    id:'study_desk',name:'Meja Belajar Nyaman',category:'Rumah',image:'./assets/housing/rented_room.webp',
    purchaseCost:320000,maintenanceCost:80000,maintenanceHours:1,buyable:true,unlockAfterWorks:3,
    summary:'Sudut belajar yang lebih rapi membuat sesi belajar lebih fokus.',
    benefit:'Belajar lebih efektif',wearLabel:'Pelan-pelan aus karena dipakai rutin.'
  },
  comfort_bed:{
    id:'comfort_bed',name:'Kasur yang Lebih Nyaman',category:'Rumah',image:'./assets/housing/family_home.webp',
    purchaseCost:480000,maintenanceCost:100000,maintenanceHours:1,buyable:true,unlockAfterWorks:5,
    summary:'Tidur lebih pulih tanpa harus menaikkan gaya hidup bulanan.',
    benefit:'Pemulihan istirahat lebih baik',wearLabel:'Kenyamanannya turun kalau lama tak dirawat.'
  },
  bicycle:{
    id:'bicycle',name:'Sepeda Bekas',category:'Transportasi',image:'./assets/ui/sinar_jaya.webp',
    purchaseCost:550000,maintenanceCost:90000,maintenanceHours:2,buyable:false,
    summary:'Transportasi pribadi murah untuk perjalanan dekat.',
    benefit:'Memangkas waktu perjalanan',wearLabel:'Aus saat dipakai bepergian.'
  },
  motorbike:{
    id:'motorbike',name:'Motor Bekas',category:'Transportasi',image:'./assets/scenes/workshop.webp',
    purchaseCost:2800000,maintenanceCost:220000,maintenanceHours:3,buyable:false,
    summary:'Mobilitas lebih cepat, tapi biaya dan perawatannya lebih berat.',
    benefit:'Mobilitas lebih nyaman',wearLabel:'Kondisi turun setiap dipakai bepergian.'
  },
  motorbike_reliable:{
    id:'motorbike_reliable',name:'Motor Harian Andal',category:'Transportasi',image:'./assets/scenes/workshop.webp',
    purchaseCost:3400000,maintenanceCost:320000,maintenanceHours:3,buyable:false,
    summary:'Motor yang lebih layak untuk ritme kerja, usaha, dan perjalanan kota yang padat.',
    benefit:'Memangkas perjalanan lebih jauh',wearLabel:'Aus saat dipakai bepergian.'
  },
};
