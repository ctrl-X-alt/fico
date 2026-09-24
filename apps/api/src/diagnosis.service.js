const {runDiagnostic,validateDiagnosis}=require("@fico/core");
const {getAIProvider}=require("./ai/provider");
const {loadKnowledge,retrieve}=require("./rag");
async function buildDiagnostic(input){
  const deterministic=runDiagnostic(input);
  const provider=getAIProvider();
  if(process.env.AI_API_KEY){
    const docs=await loadKnowledge(process.env.KNOWLEDGE_ROOT||"../../knowledge");
    const query=JSON.stringify({business:input?.business,onboarding:input?.onboarding,funnel:input?.funnel});
    const sources=retrieve(docs,query,5);
    try{
      const enriched=await provider.diagnose({input,deterministic,sources});
      const checked=validateDiagnosis(enriched);
      if(checked.valid)return {...enriched,version:enriched.version||deterministic.version,knowledge_sources:sources.map(x=>x.path)};
    }catch(_e){}
  }
  return {...deterministic,knowledge_sources:[]};
}
module.exports={buildDiagnostic};