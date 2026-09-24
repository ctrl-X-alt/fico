function buildHypotheses({funnelAnalysis,onboarding={},screenshots=[]}){
  const out=[];
  if(funnelAnalysis?.largestDrop){
    const d=funnelAnalysis.largestDrop;
    const optional=onboarding.steps?.find(s=>s.name===d.to);
    if(optional?.optional) out.push({
      id:"optional-step",status:"plausible",
      title:"An optional step may be contributing to abandonment",
      evidenceFor:["Largest observed loss occurs at "+d.to,"The step is marked optional"],
      evidenceAgainst:[],
      missingEvidence:["Segmented conversion by users who need this step"],
      nextEvidence:["Compare completion and activation rates with and without the step"]
    });
  }
  if(!screenshots.length) out.push({
    id:"screenshot-gap",status:"unknown",title:"Interface evidence is missing",
    evidenceFor:[],evidenceAgainst:[],missingEvidence:["Relevant onboarding screenshots"],
    nextEvidence:["Capture the onboarding path through activation"]
  });
  return out;
}
module.exports={buildHypotheses};