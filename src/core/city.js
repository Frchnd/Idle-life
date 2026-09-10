function ensureCityState(state){
  const base={name:'Kota Harapan',lastVisited:null,lastVisitedAt:-999,visits:{kampus_harapan:0,pasar_tradisional:0,gym_sehat:0,kafe_senja:0}};
  state.city={...base,...(state.city||{})};
  state.city.visits={...base.visits,...(state.city.visits||{})};
  state.relationships=state.relationships||{};
  if(state.relationships.andi===undefined) state.relationships.andi=0;
  if(state.relationships.bu_lestari===undefined) state.relationships.bu_lestari=0;
  if(state.relationships.sari===undefined) state.relationships.sari=0;
  if(state.relationships.dimas===undefined) state.relationships.dimas=0;
  state.npc=state.npc||{};
  state.npc.andi={known:false,life:'mahasiswa',progress:0,...(state.npc.andi||{})};
  state.npc.bu_lestari={known:false,life:'pedagang_pasar',progress:0,...(state.npc.bu_lestari||{})};
  state.npc.sari={known:false,life:'barista_senior',progress:0,...(state.npc.sari||{})};
  state.npc.dimas={known:false,life:'koordinator_shift',progress:0,...(state.npc.dimas||{})};
  ensureSocialState(state);
  return state.city;
}

function cityLocationSnapshot(state){
  ensureCityState(state);
  return Object.values(CITY_LOCATIONS).map(loc=>{
    const presence=socialPresenceLabel(state,loc.id);
    return {...loc,visits:state.city.visits[loc.id]||0,presence};
  });
}

function pushCityOpportunity(state,opp){
  if(state.opportunities.some(x=>x.id===opp.id)) return false;
  state.opportunities.push(opp);
  return true;
}

function visitCityLocation(state,id){
  ensureCityState(state);
  const loc=CITY_LOCATIONS[id];
  if(!loc) return {error:'Lokasi itu belum tersedia.'};
  if(state.player.money<loc.cost) return {error:`Butuh Rp${loc.cost.toLocaleString('id-ID')} untuk pergi dan beraktivitas di sini.`};
  const presentAtArrival=socialPeopleAtLocation(state,id);
  const first=(state.city.visits[id]||0)===0;
  state.player.money-=loc.cost;
  state.time.totalHours+=loc.duration;
  state.city.lastVisited=id;
  state.city.lastVisitedAt=state.time.totalHours;
  state.city.visits[id]=(state.city.visits[id]||0)+1;
  const count=state.city.visits[id];
  let message='';

  if(id==='kampus_harapan'){
    state.player.fatigue=Math.min(100,state.player.fatigue+6);
    state.skills.learning=(state.skills.learning||0)+14;
    state.skills.technology=(state.skills.technology||0)+7;
    if(!state.discoveredSkills.includes('technology')) state.discoveredSkills.push('technology');
    if(first) addRecent(state,'Kampus Harapan membuka lingkungan belajar baru di luar rutinitasmu.');
    if(count%3===0 && (state.skills.learning||0)>=60){
      pushCityOpportunity(state,{id:'campus_project',name:'Bantu Acara Kampus',summary:'Komunitas kampus butuh bantuan setup perangkat untuk acara kecil.',expireAt:state.time.totalHours+72,source:'Kampus Harapan'});
    }
    message='Kamu menghabiskan beberapa jam di Kampus Harapan. Belajar terasa lebih luas ketika berada di antara orang dengan arah hidup berbeda.';
  } else if(id==='pasar_tradisional'){
    state.player.fatigue=Math.min(100,state.player.fatigue+5);
    state.skills.social=(state.skills.social||0)+10;
    state.skills.logistics=(state.skills.logistics||0)+5;
    if(!state.discoveredSkills.includes('logistics')) state.discoveredSkills.push('logistics');
    if(first) addRecent(state,'Ritme Pasar Tradisional mulai terasa sebagai bagian lain dari kehidupan kota.');
    if(count%2===0){
      pushCityOpportunity(state,{id:'market_helper',name:'Bantu Pedagang Pasar',summary:'Ada pedagang yang butuh bantuan angkut dan rapikan pesanan sebelum sore.',expireAt:state.time.totalHours+48,source:'Pasar Tradisional'});
    }
    message='Kamu berkeliling Pasar Tradisional, ngobrol dengan pedagang, dan mulai memahami bagaimana barang dan orang bergerak di kota.';
  } else if(id==='kafe_senja'){
    state.player.fatigue=Math.max(0,state.player.fatigue-5);
    state.skills.social=(state.skills.social||0)+7;
    state.skills.hospitality=(state.skills.hospitality||0)+4;
    if(!state.discoveredSkills.includes('hospitality')) state.discoveredSkills.push('hospitality');
    if(first){
      addHistory(state,'Umur 18 · Mulai menjadikan Kafe Senja sebagai salah satu tempat singgah di kota.');
      addRecent(state,'Kafe Senja memberi ruang untuk melihat hidup kota tanpa harus selalu mengejar pekerjaan.');
    }
    message='Kamu duduk beberapa jam di Kafe Senja. Suasananya cukup santai untuk memperhatikan orang, percakapan, dan ritme pelayanan.';
  } else {
    state.player.fatigue=Math.max(0,state.player.fatigue-18);
    if(first){
      addHistory(state,'Umur 18 · Menemukan Gym Sehat sebagai tempat memulihkan ritme tubuh.');
      addRecent(state,'Aktivitas ringan ternyata membantu pikiranmu ikut lebih segar.');
    }
    message='Kamu latihan ringan, mandi, dan memberi tubuh waktu untuk pulih. Kondisimu terasa lebih baik.';
  }

  const person=maybeStartSocialEncounter(state,id,presentAtArrival);
  if(person) message+=` ${person.name} kebetulan juga ada di sini.`;
  else if(presentAtArrival.length) message+=' Kamu melihat beberapa wajah familiar, tapi kali ini tidak sempat ngobrol lama.';
  return message;
}
