function scoreConfidence({inputValid=true,evidenceCompleteness=0.5,dataQuality=1,contextClarity=0.7,agreement=0.5,contradictions=0}){
  let score=20+Math.max(0,Math.min(1,evidenceCompleteness))*30+Math.max(0,Math.min(1,dataQuality))*20+Math.max(0,Math.min(1,contextClarity))*15+Math.max(0,Math.min(1,agreement))*15-(Math.max(0,contradictions)*15);
  if(!inputValid) score-=25;
  score=Math.round(Math.max(0,Math.min(100,score)));
  return {score,band:score>=80?"high":score>=60?"moderate":score>=40?"limited":"low",factors:{evidenceCompleteness,dataQuality,contextClarity,agreement,contradictions,inputValid}};
}
module.exports={scoreConfidence};