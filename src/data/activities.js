import {JOBS} from './jobs.js';
import {getCondition} from '../core/state.js';

function xpMod(state){
  const id=getCondition(state.player.fatigue).id;
  if(id==='exhausted') return .7;
  if(id==='tired') return .9;
  return 1;
}

export function availableActivities(state){
  const list=[];
  if(!state.player.job){
    list.push({id:'job_search',name:'Cari Kerja',hint:'6j · cari peluang kerja',duration:6});
    list.push({id:'study',name:'Belajar',hint:'4j · Rp20rb',duration:4});
    list.push({id:'family',name:'Bantu Keluarga',hint:'4j · jaga hubungan',duration:4});
    list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
    return list;
  }
  const job=JOBS[state.player.job];
  list.push({id:'work',name:'Kerja',hint:`${job.duration}j · +Rp${Math.round(job.salary/1000)}rb`,duration:job.duration});
  list.push({id:'study',name:'Belajar',hint:'4j · Rp20rb',duration:4});
  list.push({id:'rest',name:'Istirahat',hint:'8j · pulihkan kondisi',duration:8});
  list.push({id:'rian',name:'Main dengan Rian',hint:'3j · sosial',duration:3});
  return list;
}

export function executeActivity(state,id){
  if(id==='job_search'){
    state.time.totalHours+=6;
    state.player.fatigue=Math.min(100,state.player.fatigue+8);
    state.career.jobSearchCount++;
    return 'Kamu menghabiskan waktu mencari lowongan dan bertanya ke beberapa tempat.';
  }
  if(id==='study'){
    if(state.player.money<20000) return {error:'Uangmu belum cukup untuk biaya belajar.'};
    state.player.money-=20000;
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+10);
    state.skills.learning+=10;
    state.skills.technology+=Math.round(10*xpMod(state));
    if(!state.discoveredSkills.includes('technology')) state.discoveredSkills.push('technology');
    return 'Kamu belajar beberapa jam. Kemampuan Belajar dan Teknologi meningkat.';
  }
  if(id==='family'){
    state.time.totalHours+=4;
    state.player.fatigue=Math.min(100,state.player.fatigue+7);
    state.relationships.family+=4;
    state.skills.social+=3;
    return 'Kamu membantu keluarga dan menghabiskan waktu bersama mereka.';
  }
  if(id==='rian'){
    state.time.totalHours+=3;
    state.player.fatigue=Math.min(100,state.player.fatigue+5);
    state.relationships.rian=Math.min(60,state.relationships.rian+3);
    state.skills.social+=6;
    return 'Kamu menghabiskan waktu bersama Rian. Hubungan kalian tetap hangat.';
  }
  if(id==='rest'){
    state.time.totalHours+=8;
    state.player.fatigue=Math.max(0,state.player.fatigue-45);
    return 'Kamu beristirahat dan memulihkan kondisi.';
  }
  if(id==='work'){
    const job=JOBS[state.player.job];
    if(!job) return {error:'Pekerjaan aktif tidak ditemukan.'};
    state.time.totalHours+=job.duration;
    state.player.money+=job.salary;
    state.player.fatigue=Math.min(100,state.player.fatigue+job.fatigue);
    state.skills[job.skill]=(state.skills[job.skill]||0)+Math.round(job.skillXp*xpMod(state));
    if(!state.discoveredSkills.includes(job.skill)) state.discoveredSkills.push(job.skill);
    state.career.workCount++;
    state.career.jobWorkCounts[state.player.job]=(state.career.jobWorkCounts[state.player.job]||0)+1;
    if(state.player.job==='mechanic_junior') state.career.promotionProgress++;
    if(state.player.job==='store_clerk') state.career.storeProgress++;
    if(state.player.job==='it_assistant') state.career.techProgress++;
    const skillName={mechanics:'Mekanik',social:'Sosial',technology:'Teknologi'}[job.skill]||'kemampuan utama';
    return `Kerja selesai · +Rp${job.salary.toLocaleString('id-ID')} · kemampuan ${skillName} meningkat.`;
  }
  return {error:'Aktivitas tidak dikenal.'};
}
