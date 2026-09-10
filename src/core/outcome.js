function basicCount(state){
  return ['mechanics','social','technology','learning'].filter(id=>getSkillTier(state.skills[id]||0).id!=='novice').length;
}

function workedPathCount(state){
  const counts=state.career?.jobWorkCounts||{};
  const paths=[
    (counts.mechanic_junior||0)+(counts.mechanic_senior||0),
    (counts.store_clerk||0)+(counts.store_supervisor||0),
    counts.it_assistant||0
  ];
  return paths.filter(x=>x>0).length;
}

function hasDebt(state){
  return state.player.money<0 || state.player.statuses.some(x=>x==='utang_keluarga'||x==='utang_rian');
}

function getOutcomeProfile(state){
  const advancedJob=['mechanic_senior','store_supervisor'].includes(state.player.job) || (state.player.job==='it_assistant' && (state.career.jobWorkCounts.it_assistant||0)>=5);
  const basics=basicCount(state);
  const paths=workedPathCount(state);
  const finance=financialState(state).id;
  const side=state.career.sideIncomeTotal||0;
  const relAvg=(state.relationships.family+state.relationships.rian+Math.max(0,state.relationships.pak_arman)+Math.max(0,state.relationships.maya)+Math.max(0,state.relationships.nadia))/5;

  if(hasDebt(state) && state.player.money<150000){
    return {
      id:'rebuild',title:'Sedang Menata Ulang',
      summary:'Kamu belum kalah. Hidupmu sekarang lebih banyak soal menstabilkan pilihan yang sudah dibuat daripada mengejar ekspansi baru.',
      traits:['Tekanan keuangan nyata','Masih punya ruang untuk pulih','Keputusan berikutnya lebih penting dari statistik masa lalu']
    };
  }

  if(state.business?.active && state.business.ownerFullTime){
    return {
      id:'owner',title:'Pemilik Usaha',
      summary:'Kamu sudah melewati titik ketika usaha hanya menjadi tambahan. Penghasilan, reputasi, dan risiko hidupmu sekarang bergantung langsung pada sistem yang kamu bangun dan orang yang kamu percaya.',
      traits:[state.business.helperActive?`Tim kecil bersama ${state.business.helperName||'helper'}`:'Masih menjalankan usaha sendiri',`Profit usaha terakhir Rp${Math.round(state.business.lastWeeklyProfit||0).toLocaleString('id-ID')}`,state.business.delegated?'Sebagian pekerjaan sudah bisa berjalan tanpa kehadiranmu':'Kualitas masih sangat bergantung pada kehadiranmu',`Posisi pasar: ${businessMarketPosition(state).label}`]
    };
  }

  if((state.life?.trajectory==='independent' && side>=650000) || state.business?.active){
    return {
      id:'independent',title:'Perintis Mandiri',
      summary:'Pekerjaan utama masih penting, tapi identitasmu mulai terbentuk dari peluang yang kamu ciptakan sendiri.',
      traits:[state.business?.active?`Punya ${state.business.name} · ${state.business.retainedClients||0} pelanggan tetap`:`Pendapatan sampingan Rp${Math.round(side).toLocaleString('id-ID')}`,state.business?.active?`Kapasitas ${state.business.capacity||2} pekerjaan/minggu · ${state.business.missedDemand||0} permintaan terlewat`:(state.assets.laptop?'Punya alat kerja sendiri':'Jaringan pelanggan mulai terbentuk'),'Waktu menjadi resource paling ketat']
    };
  }

  if(paths>=2 && basics>=3){
    return {
      id:'adaptive',title:'Generalis Adaptif',
      summary:'Kamu tidak tumbuh lewat satu jalur lurus. Kekuatanmu justru muncul ketika kemampuan dari dunia berbeda saling membantu.',
      traits:[`${basics} bidang sudah melewati tahap Pemula`,`${paths} jalur kerja pernah dijalani`,'Skill silang mulai membuka solusi yang tidak dimiliki spesialis awal']
    };
  }

  if(advancedJob || state.life?.trajectory==='career'){
    return {
      id:'professional',title:'Profesional Andal',
      summary:'Kamu mulai menukar kebebasan eksplorasi dengan kedalaman, reputasi kerja, dan stabilitas yang lebih kuat.',
      traits:[advancedJob?'Posisi kerja sudah naik tingkat':'Fokus karier sudah dipilih',finance==='comfortable'?'Keuangan nyaman':'Pendapatan utama makin penting','Hubungan profesional mulai punya bobot']
    };
  }

  if((state.relationships.family>=72 && state.relationships.rian>=55) || relAvg>=45){
    return {
      id:'connected',title:'Orang yang Bisa Diandalkan',
      summary:'Kemajuanmu bukan cuma datang dari skill dan uang. Orang-orang mulai mengingat apakah kamu hadir ketika mereka benar-benar membutuhkanmu.',
      traits:[state.flags.familySupport?'Keluarga tahu kamu bisa diandalkan':'Hubungan keluarga tetap kuat',state.flags.rianTrusted?'Rian benar-benar percaya padamu':'Pertemanan Rian tetap dekat','Relasi membuka konsekuensi, bukan sekadar bonus angka']
    };
  }

  return {
    id:'forming',title:'Masih Membentuk Arah',
    summary:'Belum ada satu identitas yang mendominasi. Itu bukan masalah—pilihanmu masih cukup terbuka untuk berubah drastis.',
    traits:['Belum terkunci pada satu jalur','Masih mudah mengubah prioritas','Eksperimen berikutnya akan sangat menentukan']
  };
}

function isVerticalSliceReady(state){
  const enoughTime=state.time.totalHours>=360;
  const enoughChoices=(state.pacing?.eventCount||0)>=7;
  const enoughWork=(state.career?.workCount||0)>=8;
  const meaningfulState=state.player.job && (
    state.flags.promoted || state.flags.storePromoted ||
    (state.player.job==='it_assistant' && (state.career.jobWorkCounts.it_assistant||0)>=3) ||
    (state.career.sideIncomeTotal||0)>=500000 ||
    state.life?.trajectory!=='open' ||
    basicCount(state)>=3
  );
  return enoughTime && enoughChoices && enoughWork && !!meaningfulState;
}
