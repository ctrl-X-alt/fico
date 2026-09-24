const {runDiagnostic,validateDiagnosis}=require("@fico/core");
const {getAIProvider}=require("./ai/provider");
const {loadKnowledge,retrieve}=require("./rag");
async function buildDiagnostic(input){
 const deterministic=runDiagnostic(input),provider=getAIProvider();
 const docs=await loadKnowledge(process.env.KNOWLEDGE_ROOT||"../../knowledge");
 const sources=retrieve(docs,JSON.stringify(input||{}),8);
 if(!process.env.AI_API_KEY)return{...deterministic,engine:"deterministic",knowledge_sources:sources.map(x=>x.path),screenshot_analysis:input?.screenshotAnalysis||[]};
 const out=await provider.diagnose({input,deterministic,sources:sources.map(x=>({path:x.path,text:x.text})),screenshotAnalysis:input?.screenshotAnalysis||[]});
 const check=validateDiagnosis(out);if(!check.valid)throw Object.assign(new Error("invalid_ai_diagnosis"),{code:"invalid_ai_diagnosis",details:check.errors});
 return{...out,engine:"ai",version:out.version||deterministic.version,knowledge_sources:sources.map(x=>x.path),screenshot_analysis:input?.screenshotAnalysis||[]};
}
async function analyzeScreenshots(_input,screenshots){
 const provider=getAIProvider(),out=[];
 for(const s of screenshots||[]){
  if(!process.env.AI_API_KEY){out.push({id:s.id,name:s.name,status:"unreviewed",facts:[],limitations:["Vision provider not configured."]});continue}
  if(!s.dataUrl){out.push({id:s.id,name:s.name,status:"unreviewed",facts:[],limitations:["Screenshot binary is unavailable to the vision provider."]});continue}
  try{out.push(await provider.analyzeImage(s))}catch(e){out.push({id:s.id,name:s.name,status:"failed",facts:[],limitations:["Screenshot analysis failed."]})}
 }
 return out;
}
module.exports={buildDiagnostic,analyzeScreenshots};