const {runDiagnostic,validateDiagnosis}=require("@fico/core");
const {getAIProvider}=require("./ai/provider");
const {loadKnowledge,retrieve}=require("./rag");
async function buildDiagnostic(input){
  const deterministic=runDiagnostic(input), provider=getAIProvider();
  if(!process.env.AI_API_KEY)return {...deterministic,engine:"deterministic"};
  const docs=await loadKnowledge(process.env.KNOWLEDGE_ROOT||"../../knowledge");
  const query=JSON.stringify({business:input?.business,users:input?.users,onboarding:input?.onboarding,funnel:input?.funnel,context:input?.context,constraints:input?.constraints});
  const sources=retrieve(docs,query,8);
  const enriched=await provider.diagnose({input,deterministic,sources:sources.map(x=>({path:x.path,text:x.text}))});
  const checked=validateDiagnosis(enriched);
  if(!checked.valid){const e=new Error("invalid_ai_diagnosis");e.code="invalid_ai_diagnosis";e.details=checked.errors;throw e}
  return {...enriched,version:enriched.version||deterministic.version,engine:"ai",knowledge_sources:sources.map(x=>x.path)};
}
async function analyzeScreenshots(input,screenshots){
  const provider=getAIProvider(), out=[];
  for(const screenshot of screenshots||[]){
    if(!process.env.AI_API_KEY){out.push({id:screenshot.id,name:screenshot.name,status:"unreviewed",facts:[],limitations:["Vision provider not configured."]});continue}
    try{out.push(await provider.analyzeImage({screenshot,input,system:"Analyze only visible UI evidence. Return observable facts, not inferred intent or causality."}))}
    catch(e){out.push({id:screenshot.id,name:screenshot.name,status:"unreviewed",facts:[],limitations:["Screenshot analysis failed."]})}
  }
  return out;
}
module.exports={buildDiagnostic,analyzeScreenshots};