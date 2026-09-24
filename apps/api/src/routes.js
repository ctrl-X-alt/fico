const express=require("express"),crypto=require("node:crypto");
const {validateAnalysisInput,validateDiagnosis}=require("@fico/core");
const {analyses:memoryAnalyses,usage:memoryUsage}=require("./repositories/memory.repository");
const {checkAndConsumeMemory,monthKey}=require("./usage");
const {renderReport}=require("./report.service");
const {requireAuth}=require("./auth");
const {getRepository}=require("./repository");
const {buildDiagnostic}=require("./diagnosis.service");
const {safeId}=require("./security");
const router=express.Router(),repo=()=>getRepository();
const memoryGet=(id,ownerId)=>{const a=memoryAnalyses.get(id);return a&&a.ownerId===ownerId?a:null};
async function createStore(item){if(repo().kind==="mongo")return repo().mongo.createAnalysis(item);memoryAnalyses.set(item.id,item);return item}
async function getStore(id,ownerId){return repo().kind==="mongo"?repo().mongo.getAnalysis(id,ownerId):memoryGet(id,ownerId)}
async function listStore(ownerId){return repo().kind==="mongo"?repo().mongo.listAnalyses(ownerId):[...memoryAnalyses.values()].filter(x=>x.ownerId===ownerId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}
async function updateStore(id,ownerId,patch){if(repo().kind==="mongo")return repo().mongo.updateAnalysis(id,ownerId,patch);const a=memoryGet(id,ownerId);if(!a)return null;Object.assign(a,patch);return a}
async function usageStore(userId){const period=monthKey();if(repo().kind==="mongo"){const c=await repo().mongo.usage().findOne({userId,period});return{limit:2,used:c?.used||0,remaining:Math.max(0,2-(c?.used||0)),period}}const used=memoryUsage.get(userId+"::"+period)||0;return{limit:2,used,remaining:Math.max(0,2-used),period}}
async function consumeUsage(userId,limit=2){const period=monthKey();return repo().kind==="mongo"?repo().mongo.consumeUsage(userId,period,limit):checkAndConsumeMemory(memoryUsage,userId,limit)}
router.get("/health",(_q,r)=>r.json({ok:true,service:"fico-api"}));
router.use(requireAuth);
router.post("/analyses",async(q,r,next)=>{try{const input=q.body||{},v=validateAnalysisInput(input);if(!v.valid)return r.status(422).json({error:"invalid_analysis_input",details:v.errors});const item={id:crypto.randomUUID(),status:"draft",input,createdAt:new Date().toISOString(),ownerId:q.userId};await createStore(item);r.status(201).json(item)}catch(e){next(e)}});
router.get("/analyses",async(q,r,n)=>{try{r.json(await listStore(q.userId))}catch(e){n(e)}});
router.get("/usage",async(q,r,n)=>{try{r.json(await usageStore(q.userId))}catch(e){n(e)}});
router.get("/analyses/:id",async(q,r,n)=>{try{const id=safeId(q.params.id);if(!id)return r.status(400).json({error:"invalid_analysis_id"});const a=await getStore(id,q.userId);if(!a)return r.status(404).json({error:"analysis_not_found"});r.json(a)}catch(e){n(e)}});
router.post("/analyses/:id/run",async(q,r,n)=>{try{const id=safeId(q.params.id);if(!id)return r.status(400).json({error:"invalid_analysis_id"});const a=await getStore(id,q.userId);if(!a)return r.status(404).json({error:"analysis_not_found"});if(a.status==="completed")return r.status(409).json({error:"analysis_already_completed"});const quota=await consumeUsage(q.userId,2);if(!quota.allowed)return r.status(429).json({error:"monthly_limit_reached",limit:2,used:quota.used});let result;try{result=await buildDiagnostic(a.input)}catch(e){return r.status(502).json({error:"diagnosis_failed",message:e.code||"provider_error"})}const check=validateDiagnosis(result);if(!check.valid)return r.status(422).json({error:"invalid_diagnosis_output",details:check.errors});const updated=await updateStore(a.id,q.userId,{status:"completed",result,completedAt:new Date().toISOString(),usage:quota});r.json(updated||{...a,status:"completed",result,usage:quota})}catch(e){n(e)}});
router.get("/analyses/:id/report.html",async(q,r,n)=>{try{const id=safeId(q.params.id);if(!id)return r.status(400).json({error:"invalid_analysis_id"});const a=await getStore(id,q.userId);if(!a)return r.status(404).json({error:"analysis_not_found"});if(!a.result)return r.status(409).json({error:"analysis_not_completed"});r.type("html").set("Content-Disposition",'inline; filename="friction-report.html"').send(await renderReport(a))}catch(e){n(e)}});
module.exports=router;