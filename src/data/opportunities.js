import {JOBS} from './jobs.js';
import {removeOpportunity,addHistory,addRecent,discoverSkill} from '../core/effects.js';

function takeJob(state,jobId,npc){
  const job=JOBS[jobId];
  state.player.job=job.id;
  state.player.workplace=job.workplace;
  state.player.salary=job.salary;
  if(npc && state.npc[npc]) state.npc[npc].known=true;
  return job;
}

export function runOpportunity(state,id){
  const opp=state.opportunities.find(item=>item.id===id);
  if(!opp) return 'Peluang itu sudah tidak tersedia.';

  if(id==='workshop_job'){
    removeOpportunity(state,id);
    const job=takeJob(state,'mechanic_junior','pak_arman');
    state.npc.dika.known=true;
    state.relationships.pak_arman=Math.max(5,state.relationships.pak_arman);
    addHistory(state,'Umur 18 · Mulai bekerja sebagai Mekanik Junior di Bengkel Sinar Jaya.');
    addRecent(state,'Kamu diterima bekerja di Bengkel Sinar Jaya.');
    return `Pak Arman menerimamu sebagai ${job.name}.`;
  }

  if(id==='store_job'){
    removeOpportunity(state,id);
    const job=takeJob(state,'store_clerk','maya');
    state.relationships.maya=Math.max(5,state.relationships.maya);
    addHistory(state,'Umur 18 · Mulai bekerja sebagai Pramuniaga di Toko Serba Ada.');
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
    addHistory(state,'Umur 18 · Mendapat pekerjaan teknologi pertama lewat Rian.');
    addRecent(state,'Rian mengenalkanmu ke pekerjaan setup komputer kecil.');
    return 'Kamu menyelesaikan setup komputer pertamamu · +Rp250.000.';
  }

  if(id==='it_job'){
    removeOpportunity(state,id);
    const job=takeJob(state,'it_assistant','nadia');
    state.relationships.nadia=Math.max(5,state.relationships.nadia);
    addHistory(state,'Umur 18 · Mulai bekerja sebagai Asisten Teknisi IT di Nusa Komputer.');
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
    return 'Servis rekomendasi selesai · +Rp300.000.';
  }

  if(id==='promotion'){
    removeOpportunity(state,id);
    const job=takeJob(state,'mechanic_senior','pak_arman');
    state.flags.promoted=true;
    state.relationships.pak_arman+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Mekanik Senior.');
    addRecent(state,'Pak Arman mempromosikanmu menjadi Mekanik Senior.');
    return `Kamu sekarang ${job.name}. Tanggung jawab dan gajimu meningkat.`;
  }

  if(id==='store_promotion'){
    removeOpportunity(state,id);
    const job=takeJob(state,'store_supervisor','maya');
    state.flags.storePromoted=true;
    state.relationships.maya+=6;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Supervisor Toko.');
    addRecent(state,'Maya mempercayakan satu shift toko kepadamu.');
    return `Kamu sekarang ${job.name}. Mengelola orang mulai menjadi bagian dari pekerjaanmu.`;
  }

  return 'Peluang belum memiliki aksi.';
}
