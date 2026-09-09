import {JOBS} from './jobs.js';
import {removeOpportunity,addHistory,addRecent,discoverSkill} from '../core/effects.js';

export function runOpportunity(state,id){
  const opp=state.opportunities.find(item=>item.id===id);
  if(!opp) return 'Peluang itu sudah tidak tersedia.';

  if(id==='workshop_job'){
    removeOpportunity(state,id);
    const job=JOBS.mechanic_junior;
    state.player.job=job.id; state.player.workplace=job.workplace; state.player.salary=job.salary;
    state.npc.pak_arman.known=true; state.npc.dika.known=true; state.relationships.pak_arman=5;
    addHistory(state,'Umur 18 · Mulai bekerja sebagai Mekanik Junior di Bengkel Sinar Jaya.');
    addRecent(state,'Kamu diterima bekerja di Bengkel Sinar Jaya.');
    return 'Pak Arman menerimamu sebagai Mekanik Junior.';
  }

  if(id==='store_job'){
    removeOpportunity(state,id);
    const job=JOBS.store_clerk;
    state.player.job=job.id; state.player.workplace=job.workplace; state.player.salary=job.salary;
    state.npc.maya.known=true; state.relationships.maya=5;
    addHistory(state,'Umur 18 · Mulai bekerja sebagai Pramuniaga di Toko Serba Ada.');
    addRecent(state,'Kamu diterima bekerja di Toko Serba Ada.');
    return 'Maya menerimamu untuk bekerja sebagai pramuniaga.';
  }

  if(id==='tech_course'){
    if(state.player.money<250000) return 'Uangmu belum cukup untuk mengikuti kelas ini.';
    removeOpportunity(state,id);
    state.player.money-=250000; state.time.totalHours+=8; state.player.fatigue=Math.min(100,state.player.fatigue+12);
    discoverSkill(state,'technology'); state.skills.technology+=80; state.skills.learning+=25;
    addHistory(state,'Umur 18 · Mengikuti kelas komputer dasar.');
    return 'Kelas selesai. Teknologi meningkat pesat dan jalur baru mulai terbuka.';
  }

  if(id==='tech_side_job'){
    removeOpportunity(state,id);
    state.time.totalHours+=4; state.player.money+=250000; state.player.fatigue=Math.min(100,state.player.fatigue+10); state.skills.technology+=18; state.relationships.rian+=4;
    addHistory(state,'Umur 18 · Mendapat pekerjaan teknologi pertama lewat Rian.');
    addRecent(state,'Rian mengenalkanmu ke pekerjaan setup komputer kecil.');
    return 'Kamu menyelesaikan setup komputer pertamamu · +Rp250.000.';
  }

  if(id==='private_repair'){
    removeOpportunity(state,id);
    state.time.totalHours+=4; state.player.money+=350000; state.player.fatigue=Math.min(100,state.player.fatigue+14); state.skills.mechanics+=18; state.relationships.rian+=5;
    addHistory(state,'Umur 18 · Mengambil servis privat pertama lewat Rian.');
    addRecent(state,'Kamu mulai dikenal di luar Bengkel Sinar Jaya.');
    return 'Servis privat selesai · +Rp350.000.';
  }

  if(id==='promotion'){
    removeOpportunity(state,id);
    const job=JOBS.mechanic_senior;
    state.player.job=job.id; state.player.salary=job.salary; state.flags.promoted=true;
    addHistory(state,'Umur 18 · Dipromosikan menjadi Mekanik Senior.');
    addRecent(state,'Pak Arman mempromosikanmu menjadi Mekanik Senior.');
    return 'Kamu sekarang Mekanik Senior. Tanggung jawab dan gajimu meningkat.';
  }

  return 'Peluang belum memiliki aksi.';
}
