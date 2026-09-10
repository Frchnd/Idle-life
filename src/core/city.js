function ensureCityState(state){
  const base={name:'Kota Harapan',lastVisited:null,lastVisitedAt:-999,visits:{kampus_harapan:0,pasar_tradisional:0,gym_sehat:0}};
  state.city={...base,...(state.city||{})};
  state.city.visits={...base.visits,...(state.city.visits||{})};
  state.relationships=state.relationships||{};
  if(state.relationships.andi===undefined) state.relationships.andi=0;
  if(state.relationships.bu_lestari===undefined) state.relationships.bu_lestari=0;
  state.npc=state.npc||{};
  state.npc.andi={known:false,life:'mahasiswa',progress:0,...(state.npc.andi||{})};
  state.npc.bu_lestari={known:false,life:'pedagang_pasar',progress:0,...(state.npc.bu_lestari||{})};
  return state.city;
}

function cityLocationSnapshot(state){
  ensureCityState(state);
  return Object.values(CITY_LOCATIONS).map(loc=>({...loc,visits:state.city.visits[loc.id]||0}));
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
  const first=(state.city.visits[id]||0)===0;
  state.player.money-=loc.cost;
  state.time.totalHours+=loc.duration;
  state.city.lastVisited=id;
  state.city.lastVisitedAt=state.time.totalHours;
  state.city.visits[id]=(state.city.visits[id]||0)+1;
  const count=state.city.visits[id];

  if(id==='kampus_harapan'){
    state.player.fatigue=Math.min(100,state.player.fatigue+6);
    state.skills.learning=(state.skills.learning||0)+14;
    state.skills.technology=(state.skills.technology||0)+7;
    if(!state.discoveredSkills.includes('technology')) state.discoveredSkills.push('technology');
    state.npc.andi.known=true;
    state.relationships.andi=(state.relationships.andi||0)+3;
    if(first){
      addHistory(state,'Umur 18 · Pertama kali datang ke Kampus Harapan dan mengenal Andi.');
      addRecent(state,'Kampus Harapan membuka lingkungan belajar baru di luar rutinitasmu.');
    }
    if(count%3===0 && (state.skills.learning||0)>=60){
      pushCityOpportunity(state,{id:'campus_project',name:'Bantu Acara Kampus',summary:'Andi butuh bantuan setup perangkat untuk acara komunitas.',expireAt:state.time.totalHours+72,source:'Kampus Harapan'});
    }
    return 'Kamu menghabiskan beberapa jam di Kampus Harapan. Belajar terasa lebih luas ketika bertemu orang dengan arah hidup berbeda.';
  }

  if(id==='pasar_tradisional'){
    state.player.fatigue=Math.min(100,state.player.fatigue+5);
    state.skills.social=(state.skills.social||0)+10;
    state.skills.logistics=(state.skills.logistics||0)+5;
    if(!state.discoveredSkills.includes('logistics')) state.discoveredSkills.push('logistics');
    state.npc.bu_lestari.known=true;
    state.relationships.bu_lestari=(state.relationships.bu_lestari||0)+3;
    if(first){
      addHistory(state,'Umur 18 · Mulai sering melihat ritme Pasar Tradisional dan mengenal Bu Lestari.');
      addRecent(state,'Bu Lestari bilang orang yang rajin membantu biasanya cepat dikenal di pasar.');
    }
    if(count%2===0){
      pushCityOpportunity(state,{id:'market_helper',name:'Bantu Pedagang Pasar',summary:'Bu Lestari butuh bantuan angkut dan rapikan pesanan sebelum sore.',expireAt:state.time.totalHours+48,source:'Pasar Tradisional'});
    }
    return 'Kamu berkeliling Pasar Tradisional, ngobrol dengan pedagang, dan mulai memahami bagaimana barang dan orang bergerak di kota.';
  }

  state.player.fatigue=Math.max(0,state.player.fatigue-18);
  if(first){
    addHistory(state,'Umur 18 · Menemukan Gym Sehat sebagai tempat memulihkan ritme tubuh.');
    addRecent(state,'Aktivitas ringan ternyata membantu pikiranmu ikut lebih segar.');
  }
  return 'Kamu latihan ringan, mandi, dan memberi tubuh waktu untuk pulih. Kondisimu terasa lebih baik.';
}
