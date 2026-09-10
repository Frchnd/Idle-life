function sideMultiplier(state,fromRian=false,sector=null){
  let mult=1;
  if(state.life?.trajectory==='independent') mult+=0.15;
  if(fromRian && state.flags.rianTrusted) mult+=0.10;
  if(sector) mult*=sectorMultiplier(state,sector);
  return mult;
}

function sideCooldown(state,normal){
  return state.life?.trajectory==='independent'?Math.max(36,Math.round(normal*0.7)):normal;
}

function takeJob(state,jobId,npc){
  const job=JOBS[jobId];
  const previous=state.player.job;
  state.player.job=job.id;
  state.player.workplace=job.workplace;
  state.player.salary=job.salary;
  state.player.statuses=state.player.statuses.filter(x=>!['peran_ganda','gaji_ditekan','jam_lebih_fleksibel'].includes(x));
  if(npc && state.npc[npc]) state.npc[npc].known=true;
  return {job,previous};
}

function runOpportunity(state,id){
  const dataResult=runDataOpportunity(state,id);
  if(dataResult!==null) return dataResult;
  const opp=state.opportunities.find(item=>item.id===id);
  if(!opp) return 'Peluang itu sudah tidak tersedia.';
  if(opp.contested) addRecent(state,`Kamu bergerak lebih cepat dan mengambil “${opp.name}” sebelum ${opp.competitor||'orang lain'}.`);

  if(id==='workshop_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'mechanic_junior','pak_arman');
    state.npc.dika.known=true;
    state.relationships.pak_arman=Math.max(5,state.relationships.pak_arman);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Mekanik Junior di Bengkel Sinar Jaya.':'Umur 18 · Mulai bekerja sebagai Mekanik Junior di Bengkel Sinar Jaya.');
    addRecent(state,'Kamu diterima bekerja di Bengkel Sinar Jaya.');
    return `Pak Surya menerimamu sebagai ${job.name}.`;
  }

  if(id==='store_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'store_clerk','maya');
    state.relationships.maya=Math.max(5,state.relationships.maya);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Pramuniaga di Toko Serba Ada.':'Umur 18 · Mulai bekerja sebagai Pramuniaga di Toko Serba Ada.');
    addRecent(state,'Kamu diterima bekerja di Toko Serba Ada.');
    return `Mira menerimamu sebagai ${job.name}.`;
  }

  if(id==='cafe_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'cafe_crew','sari');
    state.relationships.sari=Math.max(5,state.relationships.sari||0);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Barista Pemula di Kafe Senja.':'Umur 18 · Mulai bekerja sebagai Barista Pemula di Kafe Senja.');
    addRecent(state,'Kamu diterima bekerja di Kafe Senja.');
    return `Sari membawamu masuk sebagai ${job.name}.`;
  }

  if(id==='logistics_job'){
    removeOpportunity(state,id);
    const {job,previous}=takeJob(state,'warehouse_staff','dimas');
    state.relationships.dimas=Math.max(5,state.relationships.dimas||0);
    addHistory(state,previous?'Umur 18 · Beralih menjadi Staf Gudang di Lintas Kota Logistik.':'Umur 18 · Mulai bekerja sebagai Staf Gudang di Lintas Kota Logistik.');
    addRecent(state,'Kamu diterima bekerja di Lintas Kota Logistik.');
    return `Dimas memasukkanmu ke tim sebagai ${job.name}.`;
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
    const payout=Math.round(250000*sideMultiplier(state,true,'technology'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+10);
    state.skills.technology+=18;
    state.relationships.rian+=4;
    state.scheduled.push({at:state.time.totalHours+36,kind:'tech_referral'});
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addHistory(state,'Umur 18 · Mendapat pekerjaan teknologi pertama lewat Rian.');
    addRecent(state,'Rian mengenalkanmu ke pekerjaan setup komputer kecil.');
    return `Kamu menyelesaikan setup komputer pertamamu · +Rp${payout.toLocaleString('id-ID')}.`;
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
    const payout=Math.round(350000*sideMultiplier(state,true,'mechanics'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+14);
    state.skills.mechanics+=18;
    state.relationships.rian+=5;
    state.scheduled.push({at:state.time.totalHours+36,kind:'private_referral'});
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addHistory(state,'Umur 18 · Mengambil servis privat pertama lewat Rian.');
    addRecent(state,'Kamu mulai dikenal di luar Bengkel Sinar Jaya.');
    return `Servis privat selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }

  if(id==='private_repeat'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(300000*sideMultiplier(state,state.flags.rianTrusted,'mechanics'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+12);
    state.skills.mechanics+=16;
    addRecent(state,'Pelanggan baru datang lewat rekomendasi.');
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    state.scheduled.push({at:state.time.totalHours+sideCooldown(state,96),kind:'private_repeat_offer'});
    return `Servis rekomendasi selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }

  if(id==='promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'mechanic_senior','pak_arman');
    state.flags.promoted=true;
    state.relationships.pak_arman+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Mekanik Senior.');
    addRecent(state,'Pak Surya mempromosikanmu menjadi Mekanik Senior.');
    return `Kamu sekarang ${job.name}. Tanggung jawab dan gajimu meningkat.`;
  }

  if(id==='store_promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'store_supervisor','maya');
    state.flags.storePromoted=true;
    state.relationships.maya+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Supervisor Toko.');
    addRecent(state,'Mira mempercayakan satu shift toko kepadamu.');
    return `Kamu sekarang ${job.name}. Mengelola orang mulai menjadi bagian dari pekerjaanmu.`;
  }


  if(id==='cafe_promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'cafe_lead','sari');
    state.relationships.sari=(state.relationships.sari||0)+6;
    addHistory(state,'Umur 18 · Dipercaya menjadi Barista Senior di Kafe Senja.');
    addRecent(state,'Sari mulai mempercayakan ritme satu shift kepadamu.');
    return `Kamu sekarang ${job.name}. Pelayanan, kualitas, dan ritme tim mulai jadi tanggung jawabmu.`;
  }

  if(id==='logistics_promotion'){
    removeOpportunity(state,id);
    const {job}=takeJob(state,'dispatch_coordinator','dimas');
    state.relationships.dimas=(state.relationships.dimas||0)+6;
    addHistory(state,'Umur 18 · Naik menjadi Koordinator Pengiriman di Lintas Kota Logistik.');
    addRecent(state,'Dimas mempercayakan koordinasi rute dan alur barang kepadamu.');
    return `Kamu sekarang ${job.name}. Kesalahan kecil kini bisa memengaruhi satu tim, bukan cuma tugasmu sendiri.`;
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


  if(id==='career_cafe'){
    removeOpportunity(state,id);
    const jobId=(state.career.jobWorkCounts.cafe_crew||0)>=6?'cafe_lead':'cafe_crew';
    const {job,previous}=takeJob(state,jobId,'sari');
    state.relationships.sari=Math.max(5,state.relationships.sari||0);
    addHistory(state,`Umur 18 · Beralih dari ${JOBS[previous]?.name||'pekerjaan lama'} ke ${job.name} di Kafe Senja.`);
    addRecent(state,'Kamu mengubah arah karier ke dunia hospitality.');
    return `Kamu sekarang bekerja sebagai ${job.name}. Pengalaman pelayananmu punya arah baru.`;
  }

  if(id==='career_logistics'){
    removeOpportunity(state,id);
    const jobId=(state.career.jobWorkCounts.warehouse_staff||0)>=6?'dispatch_coordinator':'warehouse_staff';
    const {job,previous}=takeJob(state,jobId,'dimas');
    state.relationships.dimas=Math.max(5,state.relationships.dimas||0);
    addHistory(state,`Umur 18 · Beralih dari ${JOBS[previous]?.name||'pekerjaan lama'} ke ${job.name} di Lintas Kota Logistik.`);
    addRecent(state,'Kamu mengubah arah karier ke operasi logistik.');
    return `Kamu sekarang bekerja sebagai ${job.name}. Ketelitian dan koordinasi menjadi modal utama.`;
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
    const payout=Math.round(220000*sideMultiplier(state,false,'technology'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+9);
    state.skills.technology+=16;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    state.scheduled.push({at:state.time.totalHours+sideCooldown(state,72),kind:'tech_freelance_offer'});
    addRecent(state,'Kamu menyelesaikan pekerjaan teknologi dari laptopmu sendiri.');
    return `Kerja lepas teknologi selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }

  if(id==='promo_side_job'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(180000*sideMultiplier(state,false,'retail'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+8);
    state.skills.social+=14;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    state.scheduled.push({at:state.time.totalHours+sideCooldown(state,96),kind:'promo_side_offer'});
    addRecent(state,'Kamu mengambil shift promosi singkat di luar pekerjaan utama.');
    return `Shift promosi selesai · +Rp${payout.toLocaleString('id-ID')} · Sosial meningkat.`;
  }

  if(id==='rent_room'){
    const deposit=state.flags.familySupport?1000000:1200000;
    if(state.player.money<deposit) return `Kamu membutuhkan Rp${deposit.toLocaleString('id-ID')} untuk deposit dan biaya awal.`;
    removeOpportunity(state,id);
    state.player.money-=deposit;
    state.housing={id:'rented_room',label:'Kamar sewa sendiri',monthlyCost:1100000,movedAt:state.time.totalHours};
    state.economy.livingCost=1100000;
    state.player.statuses=state.player.statuses.filter(x=>x!=='tinggal_bersama_keluarga');
    if(!state.player.statuses.includes('tinggal_sendiri')) state.player.statuses.push('tinggal_sendiri');
    state.flags.movedOut=true;
    state.relationships.family-=2;
    state.scheduled.push({at:state.time.totalHours+12,kind:'move_out_reflection'});
    addHistory(state,'Umur 18 · Pindah dari rumah keluarga ke kamar sewa sendiri.');
    addRecent(state,'Kamu mulai tinggal sendiri. Biaya hidup naik, tetapi ruang dan ritmemu sekarang milikmu sendiri.');
    return 'Kamu pindah ke kamar sewa. Biaya hidup bulanan naik menjadi Rp1.100.000, tetapi belajar dan istirahat di rumah menjadi lebih efektif.';
  }




  if(id==='market_repair'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(300000*sideMultiplier(state,false,'mechanics'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+12);
    state.skills.mechanics+=16;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addRecent(state,'Lonjakan permintaan servis lokal memberimu pekerjaan tambahan.');
    return `Servis dari kondisi pasar selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }

  if(id==='market_promo'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(190000*sideMultiplier(state,false,'retail'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+8);
    state.skills.social+=14;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addRecent(state,'Kondisi retail yang ramai membuka shift tambahan untukmu.');
    return `Shift event selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }

  if(id==='market_tech'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(240000*sideMultiplier(state,false,'technology'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+9);
    state.skills.technology+=17;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addRecent(state,'Permintaan digital lokal menghasilkan pekerjaan teknologi tambahan.');
    return `Setup digital selesai · +Rp${payout.toLocaleString('id-ID')}.`;
  }


  if(id==='market_hospitality'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(185000*sideMultiplier(state,false,'hospitality'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+9);
    discoverSkill(state,'hospitality');
    state.skills.hospitality+=16;
    state.skills.social+=5;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addRecent(state,'Keramaian kota memberimu shift hospitality tambahan.');
    return `Shift kafe selesai · +Rp${payout.toLocaleString('id-ID')} · Hospitality berkembang.`;
  }

  if(id==='market_logistics'){
    removeOpportunity(state,id);
    state.time.totalHours+=4;
    const payout=Math.round(205000*sideMultiplier(state,false,'logistics'));
    state.player.money+=payout;
    state.player.fatigue=Math.min(100,state.player.fatigue+11);
    discoverSkill(state,'logistics');
    state.skills.logistics+=17;
    state.career.sideIncomeTotal=(state.career.sideIncomeTotal||0)+payout;
    addRecent(state,'Lonjakan paket kota memberimu shift sortir tambahan.');
    return `Shift logistik selesai · +Rp${payout.toLocaleString('id-ID')} · Logistik berkembang.`;
  }

  if(id==='start_business'){
    const sector=strongestBusinessSector(state);
    if(!sector) return 'Belum ada kemampuan yang cukup kuat untuk dijadikan usaha.';
    const result=startBusiness(state,sector);
    if(result.error) return result.error;
    removeOpportunity(state,id);
    return result.text;
  }

  return 'Peluang belum memiliki aksi.';
}
