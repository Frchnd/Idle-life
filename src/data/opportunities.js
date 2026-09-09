import {JOBS} from './jobs.js';
import {removeOpportunity,addHistory,addRecent,discoverSkill} from '../core/effects.js';

function takeJob(state,jobId,npc){
  const job=JOBS[jobId];
  const previous=state.player.job;
  state.player.job=job.id;
  state.player.workplace=job.workplace;
  state.player.salary=job.salary;
  if(npc && state.npc[npc]) state.npc[npc].known=true;
  return {job,previous};
}

export function runOpportunity(state,id){
  const opp=state.opportunities.find(item=>item.id===id);
  if(!opp) return 'Peluang itu sudah tidak tersedia.';

  if(id==='workshop_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'mechanic_junior','pak_arman');
    state.npc.dika.known=true;
    state.relationships.pak_arman=Math.max(5,state.relationships.pak_arman);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Mekanik Junior di Bengkel Sinar Jaya.':'Umur 18 · Mulai bekerja sebagai Mekanik Junior di Bengkel Sinar Jaya.');
    addRecent(state,'Kamu diterima bekerja di Bengkel Sinar Jaya.');
    return `Pak Arman menerimamu sebagai ${job.name}.`;
  }

  if(id==='store_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'store_clerk','maya');
    state.relationships.maya=Math.max(5,state.relationships.maya);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Pramuniaga di Toko Serba Ada.':'Umur 18 · Mulai bekerja sebagai Pramuniaga di Toko Serba Ada.');
    addRecent(state,'Kamu diterima bekerja di Toko Serba Ada.');
    return `Maya menerimamu sebagai ${job.name}.`;
  }

  if(id==='tech_course'){
    if(state.player.money<250000) return 'Uangmu belum cukup untuk mengikuti kelas ini.';
    removeOpportunity(state,id);
    state.player.money-=250000;
    state.time.totalHours+=8;
    state.player.fatigue=Math.min(100,state.player.fatigue+12);
    discoverSkill(state,'technology');
    state.skills.technology+=80;
    state.skills.learning+=25;
    addHistory(state,'Umur 18 · Mengikuti kelas komputer dasar.');
    return 'Kelas selesai. Teknologi meningkat pesat dan jalur baru mulai terbuka.';
  }

  if(id==='tech_side_job'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    state.player.money+=250000;
    state.player.fatigue=Math.min(100,state.player.fatigue+10);
    state.skills.technology+=18;
    state.relationships.rian+=4;
    state.scheduled.push({at:state.time.totalHours+36,kind:'tech_referral'});
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+250000;
    addHistory(state,'Umur 18 · Mendapat pekerjaan teknologi pertama lewat Rian.');
    addRecent(state,'Rian mengenalkanmu ke pekerjaan setup komputer kecil.');
    return 'Kamu menyelesaikan setup komputer pertamamu · +Rp250.000.';
  }

  if(id==='it_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'it_assistant','nadia');
    state.relationships.nadia=Math.max(5,state.relationships.nadia);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Asisten Teknisi IT di Nusa Komputer.':'Umur 18 · Mulai bekerja sebagai Asisten Teknisi IT di Nusa Komputer.');
    addRecent(state,'Rekomendasi pekerjaan kecil membawamu ke Nusa Komputer.');
    return `Kamu sekarang bekerja sebagai ${job.name}.`;
  }

  if(id==='private_repair'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    state.player.money+=350000;
    state.player.fatigue=Math.min(100,state.player.fatigue+14);
    state.skills.mechanics+=18;
    state.relationships.rian+=5;
    state.scheduled.push({at:state.time.totalHours+36,kind:'private_referral'});
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+350000;
    addHistory(state,'Umur 18 · Mengambil servis privat pertama lewat Rian.');
    addRecent(state,'Kamu mulai dikenal di luar Bengkel Sinar Jaya.');
    return 'Servis privat selesai · +Rp350.000.';
  }

  if(id==='private_repeat'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    state.player.money+=300000;
    state.player.fatigue=Math.min(100,state.player.fatigue+12);
    state.skills.mechanics+=16;
    addRecent(state,'Pelanggan baru datang lewat rekomendasi.');
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+300000;
    state.scheduled.push({at:state.time.totalHours+96,kind:'private_repeat_offer'});
    return 'Servis rekomendasi selesai · +Rp300.000.';
  }

  if(id==='promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'mechanic_senior','pak_arman');
    state.flags.promoted=true;
    state.relationships.pak_arman+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Mekanik Senior.');
    addRecent(state,'Pak Arman mempromosikanmu menjadi Mekanik Senior.');
    return `Kamu sekarang ${job.name}. Tanggung jawab dan gajimu meningkat.`;
  }

  if(id==='store_promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'store_supervisor','maya');
    state.flags.storePromoted=true;
    state.relationships.maya+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Supervisor Toko.');
    addRecent(state,'Maya mempercayakan satu shift toko kepadamu.');
    return `Kamu sekarang ${job.name}. Mengelola orang mulai menjadi bagian dari pekerjaanmu.`;
  }



  if(id==='career_mechanic'){
    removeOpportunity(state,id);
    const jobId=state.flags.promoted?'mechanic_senior':'mechanic_junior';
    const {job,previous}=takeJob(state,jobId,'pak_arman');
    state.npc.dika.known=true;
    addHistory(state,`Umur 18 · Beralih dari ${JOBS[previous]?.name||'pekerjaan lama'} ke ${job.name}.`);
    addRecent(state,`Kamu mengubah arah karier dan kembali ke jalur bengkel sebagai ${job.name}.`);
    return `Kamu sekarang bekerja sebagai ${job.name}. Skill Mekanik yang pernah kamu bangun tetap terbawa.`;
  }

  if(id==='career_store'){
    removeOpportunity(state,id);
    const jobId=state.flags.storePromoted?'store_supervisor':'store_clerk';
    const {job,previous}=takeJob(state,jobId,'maya');
    addHistory(state,`Umur 18 · Beralih dari ${JOBS[previous]?.name||'pekerjaan lama'} ke ${job.name}.`);
    addRecent(state,`Kamu mengubah arah karier ke jalur pelayanan sebagai ${job.name}.`);
    return `Kamu sekarang bekerja sebagai ${job.name}. Pengalaman Sosialmu tidak hilang saat berganti jalur.`;
  }

  if(id==='career_it'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'it_assistant','nadia');
    state.relationships.nadia=Math.max(5,state.relationships.nadia);
    addHistory(state,`Umur 18 · Beralih dari ${JOBS[previous]?.name||'pekerjaan lama'} ke ${job.name}.`);
    addRecent(state,'Kamu mengubah arah karier ke Nusa Komputer.');
    return `Teknologi yang kamu pelajari di luar pekerjaan utama akhirnya menjadi karier utama.`;
  }

  if(id==='buy_laptop'){
    if(state.player.money<750000) return 'Uangmu belum cukup untuk membeli laptop ini.';
    removeOpportunity(state,id);
    state.player.money-=750000;
    state.assets.laptop=true;
    if(!state.player.statuses.includes('punya_laptop')) state.player.statuses.push('punya_laptop');
    state.scheduled.push({at:state.time.totalHours+24,kind:'tech_freelance_offer'});
    addHistory(state,'Umur 18 · Membeli laptop bekas untuk belajar dan kerja sampingan.');
    addRecent(state,'Laptop membuka kemungkinan kerja teknologi dari rumah.');
    return 'Kamu membeli laptop bekas. Tabungan turun, tetapi kemampuan Teknologi sekarang bisa menghasilkan uang lebih fleksibel.';
  }

  if(id==='tech_freelance'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    state.player.money+=220000;
    state.player.fatigue=Math.min(100,state.player.fatigue+9);
    state.skills.technology+=16;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+220000;
    state.scheduled.push({at:state.time.totalHours+72,kind:'tech_freelance_offer'});
    addRecent(state,'Kamu menyelesaikan pekerjaan teknologi dari laptopmu sendiri.');
    return 'Freelance teknologi selesai · +Rp220.000.';
  }

  if(id==='promo_side_job'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    state.player.money+=180000;
    state.player.fatigue=Math.min(100,state.player.fatigue+8);
    state.skills.social+=14;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+180000;
    state.scheduled.push({at:state.time.totalHours+96,kind:'promo_side_offer'});
    addRecent(state,'Kamu mengambil shift promosi singkat di luar pekerjaan utama.');
    return 'Shift promosi selesai · +Rp180.000 · Sosial meningkat.';
  }

  if(id==='repay_family'){
    if(state.player.money<300000) return 'Uangmu belum cukup untuk melunasi utang keluarga.';
    removeOpportunity(state,id);
    state.player.money-=300000;
    state.player.statuses=state.player.statuses.filter(x=>x!=='utang_keluarga');
    state.relationships.family+=8;
    addHistory(state,'Umur 18 · Melunasi utang kepada keluarga.');
    return 'Utang keluarga lunas. Beban hubungan itu selesai.';
  }

  if(id==='repay_rian'){
    if(state.player.money<300000) return 'Uangmu belum cukup untuk melunasi utang kepada Rian.';
    removeOpportunity(state,id);
    state.player.money-=300000;
    state.player.statuses=state.player.statuses.filter(x=>x!=='utang_rian');
    state.relationships.rian+=8;
    addHistory(state,'Umur 18 · Melunasi utang kepada Rian.');
    return 'Utang kepada Rian lunas. Hubungan kalian kembali lebih ringan.';
  }

  return 'Peluang belum memiliki aksi.';
}
