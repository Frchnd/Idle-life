const FAMILY_CARE_OPTIONS={
  shared:{id:'shared',name:'Bergantian Berdua',baseMonthlyCost:0,setupCost:0,minMonths:0,pressure:3,workFatigue:1,careDaily:-.12,summary:'Tidak ada biaya penjagaan tambahan, tapi jadwal kerja dua orang lebih sering saling bertabrakan.'},
  network:{id:'network',name:'Jaringan Keluarga',baseMonthlyCost:160000,setupCost:100000,minMonths:0,pressure:-2,workFatigue:0,careDaily:.24,summary:'Keluarga membantu beberapa jam penting. Lebih ringan, tapi tetap perlu menjaga hubungan dan kontribusi.'},
  daycare:{id:'daycare',name:'Penitipan Harian Lokal',baseMonthlyCost:650000,setupCost:300000,minMonths:6,pressure:-3,workFatigue:-1,careDaily:.18,summary:'Biaya lebih tinggi, tapi jam kerja menjadi lebih mudah diprediksi dan benturan jadwal berkurang.'}
};

const FAMILY_PARTNER_CAREER={
  sari:{name:'Sari',steady:'Shift kafe stabil',busy:'Jadwal kafe sedang padat',reduced:'Mengurangi shift sementara',opportunityTitle:'Sari Mendapat Kesempatan Memimpin Shift Besar',opportunityText:'Kafe Senja menawarkan Sari kesempatan memegang rangkaian shift yang bisa memperkuat posisinya. Masalahnya, beberapa minggu ke depan juga sedang padat di rumah.'},
  andi:{name:'Andi',steady:'Proyek komunitas stabil',busy:'Proyek komunitas sedang padat',reduced:'Mengurangi proyek sementara',opportunityTitle:'Andi Mendapat Proyek yang Sulit Dilewatkan',opportunityText:'Andi ditawari tanggung jawab lebih besar di proyek komunitas. Kesempatannya nyata, tapi waktunya datang ketika rumah juga sedang butuh banyak kehadiran.'}
};
