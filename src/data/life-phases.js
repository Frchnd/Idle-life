defineFromTemplate('opportunities','learning_investment',{
  id:'young_talent_program',
  name:'Program Talenta Muda Kota',
  tags:['life_phase','learning','network'],
  requirements:[{preset:'age_between',params:{min:19,max:20}},{preset:'money_min',params:{amount:100000}},{path:'life.ageWindows.youngTalentTaken',op:'eq',value:false}],
  effects:[
    {type:'money',value:-100000},{type:'hours',value:12},{type:'fatigue',value:14},
    {type:'skill',skill:'learning',value:50},{type:'skill',skill:'social',value:25},
    {type:'path_set',path:'life.ageWindows.youngTalentTaken',value:true},
    {type:'history',text:'Umur 18 · Mengikuti Program Talenta Muda Kota sebelum jendela usianya berakhir.'}
  ],
  result:'Seharian penuh kamu bertemu orang dari jalur hidup yang berbeda. Nggak ada pekerjaan instan, tapi wawasan dan jaringanmu melebar.'
});

defineFromTemplate('opportunities','learning_investment',{
  id:'young_professional_forum',
  name:'Forum Profesional Muda',
  tags:['life_phase','career','network'],
  requirements:[{preset:'age_between',params:{min:21,max:24}},{preset:'money_min',params:{amount:60000}},{path:'life.ageWindows.professionalForumTaken',op:'eq',value:false}],
  effects:[
    {type:'money',value:-60000},{type:'hours',value:6},{type:'fatigue',value:7},
    {type:'skill',skill:'social',value:35},{type:'skill',skill:'learning',value:15},
    {type:'path_set',path:'life.ageWindows.professionalForumTaken',value:true},
    {type:'history',text:'Umur 18 · Mulai membangun jaringan profesional di luar tempat kerja sendiri.'}
  ],
  result:'Obrolan singkat dengan banyak orang membuatmu melihat bahwa karier tidak hanya bergerak lewat promosi internal.'
});
