const PARENTING_STAGES=[
  {id:'newborn',label:'Bayi baru lahir',minMonths:0,maxMonths:5,costMult:1,sleepLoad:1.05,connectionWindowDays:4,summary:'Hari-hari masih banyak ditentukan oleh tidur, tangis, dan belajar membaca kebutuhan kecil.'},
  {id:'infant',label:'Mulai mengenali dunia',minMonths:6,maxMonths:17,costMult:1.08,sleepLoad:.78,connectionWindowDays:5,summary:'Nara mulai mengenali wajah, suara, dan pola rumah yang berulang.'},
  {id:'toddler',label:'Balita aktif',minMonths:18,maxMonths:35,costMult:1.18,sleepLoad:.52,connectionWindowDays:5,summary:'Gerak, rasa ingin tahu, dan kemauan sendiri mulai memenuhi rumah.'},
  {id:'preschool',label:'Usia prasekolah',minMonths:36,maxMonths:59,costMult:1.28,sleepLoad:.34,connectionWindowDays:6,summary:'Nara mulai membawa cerita, pertanyaan, dan kebiasaan yang terasa semakin miliknya sendiri.'},
  {id:'child',label:'Masa kanak-kanak',minMonths:60,maxMonths:999,costMult:1.35,sleepLoad:.22,connectionWindowDays:7,summary:'Kebutuhannya berubah: bukan lagi sekadar dijaga, tapi ditemani memahami dunia yang makin luas.'}
];

const CHILD_TRAITS={
  curiosity:{id:'curiosity',label:'Penasaran',summary:'Sering ingin tahu, mencoba, dan bertanya sebelum merasa puas.'},
  warmth:{id:'warmth',label:'Hangat',summary:'Mudah mencari kedekatan dan merespons suasana orang di rumah.'},
  independence:{id:'independence',label:'Mandiri',summary:'Suka mencoba sendiri dan cepat menunjukkan kemauan pribadi.'}
};
