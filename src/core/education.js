function ensureEducationState(state){
  state.education=state.education||{};
  state.education.certifications=Array.isArray(state.education.certifications)?state.education.certifications:[];
  state.education.completedAt=state.education.completedAt||{};
  return state.education;
}

function hasCertification(state,id){
  return ensureEducationState(state).certifications.includes(id);
}

function certificationSnapshot(state){
  ensureEducationState(state);
  return listContent('certifications').filter(cert=>contentEnabled(state,'certifications',cert.id)).map(cert=>({
    ...cert,
    completed:hasCertification(state,cert.id),
    eligible:meetsRequirements(state,cert.unlockRequirements||[]),
    jobOpen:meetsRequirements(state,cert.jobUnlockRequirements||[])
  }));
}

function syncEducationOpportunities(state){
  ensureEducationState(state);
  for(const cert of listContent('certifications')){
    const trainingEnabled=contentEnabled(state,'opportunities',cert.opportunityId);
    const trainingEligible=!hasCertification(state,cert.id)&&meetsRequirements(state,cert.unlockRequirements||[]);
    const trainingActive=state.opportunities.some(op=>op.id===cert.opportunityId);
    if(trainingEnabled&&trainingEligible&&!trainingActive){
      addOpportunity(state,{id:cert.opportunityId,name:cert.name,summary:`${cert.duration}j · Rp${Math.round(cert.cost/1000)}rb · buka jalur spesialis`});
    }
    if((!trainingEnabled||!trainingEligible)&&trainingActive) removeOpportunity(state,cert.opportunityId);

    const jobEnabled=contentEnabled(state,'opportunities',cert.jobOpportunityId);
    const jobEligible=hasCertification(state,cert.id)&&meetsRequirements(state,cert.jobUnlockRequirements||[]);
    const jobActive=state.opportunities.some(op=>op.id===cert.jobOpportunityId);
    if(jobEnabled&&jobEligible&&!jobActive){
      const job=JOBS[cert.jobId];
      addOpportunity(state,{id:cert.jobOpportunityId,name:job?.name||'Posisi Spesialis',summary:`${job?.workplace||'Tempat kerja'} · Rp${Math.round((job?.salary||0)/1000)}rb/hari · butuh sertifikasi`});
    }
    if((!jobEnabled||!jobEligible)&&jobActive) removeOpportunity(state,cert.jobOpportunityId);
  }
}
