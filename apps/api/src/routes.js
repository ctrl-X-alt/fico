const express = require("express");
const crypto = require("node:crypto");
const { runDiagnostic, validateDiagnosis, validateAnalysisInput } = require("@fico/core");
const { analyses: memoryAnalyses, usage: memoryUsage } = require("./repositories/memory.repository");
const { checkAndConsumeMemory, monthKey } = require("./usage");
const { renderReport } = require("./report.service");
const { requireAuth } = require("./auth");
const { getRepository } = require("./repository");
const router = express.Router();
const repo = () => getRepository();
const memoryGet = (id, ownerId) => { const a = memoryAnalyses.get(id); return a && a.ownerId === ownerId ? a : null; };
async function createStore(item) { if (repo().kind === "mongo") return repo().mongo.createAnalysis(item); memoryAnalyses.set(item.id, item); return item; }
async function getStore(id, ownerId) { return repo().kind === "mongo" ? repo().mongo.getAnalysis(id, ownerId) : memoryGet(id, ownerId); }
async function listStore(ownerId) { return repo().kind === "mongo" ? repo().mongo.listAnalyses(ownerId) : [...memoryAnalyses.values()].filter(x => x.ownerId === ownerId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
async function updateStore(id, ownerId, patch) {
  if (repo().kind === "mongo") return repo().mongo.updateAnalysis(id, ownerId, patch);
  const a = memoryGet(id, ownerId); if (!a) return null; Object.assign(a, patch); memoryAnalyses.set(id, a); return a;
}
async function consumeUsage(userId, limit = 2) {
  const period = monthKey();
  if (repo().kind === "mongo") return repo().mongo.consumeUsage(userId, period, limit);
  return checkAndConsumeMemory(memoryUsage, userId, limit);
}
router.use(requireAuth);
router.get("/health", (_req, res) => res.json({ ok: true, service: "fico-api" }));
router.post("/analyses", async (req,res,next) => {
  try {
    const input = req.body || {}; const validation = validateAnalysisInput(input);
    if (!validation.valid) return res.status(422).json({ error: "invalid_analysis_input", details: validation.errors });
    const item = { id: crypto.randomUUID(), status: "draft", input, createdAt: new Date().toISOString(), ownerId: req.userId };
    await createStore(item); res.status(201).json(item);
  } catch (e) { next(e); }
});
router.get("/analyses", async (req,res,next) => { try { res.json(await listStore(req.userId)); } catch(e) { next(e); } });
router.get("/analyses/:id", async (req,res,next) => { try { const a = await getStore(req.params.id, req.userId); if(!a) return res.status(404).json({error:"analysis_not_found"}); res.json(a); } catch(e) { next(e); } });
router.post("/analyses/:id/run", async (req,res,next) => {
  try {
    const a = await getStore(req.params.id, req.userId);
    if (!a) return res.status(404).json({error:"analysis_not_found"});
    if (a.status === "completed") return res.status(409).json({error:"analysis_already_completed"});
    const quota = await consumeUsage(req.userId, 2);
    if (!quota.allowed) return res.status(429).json({error:"monthly_limit_reached",limit:2,used:quota.used});
    const result = runDiagnostic(a.input);
    const check = validateDiagnosis(result);
    if (!check.valid) return res.status(422).json({error:"invalid_diagnosis_output",details:check.errors});
    const updated = await updateStore(a.id, req.userId, {status:"completed",result,completedAt:new Date().toISOString(),usage:quota});
    res.json(updated || {...a,status:"completed",result,usage:quota});
  } catch(e) { next(e); }
});
router.get("/usage", async (req,res,next) => {
  try {
    const period = monthKey();
    if (repo().kind === "mongo") {
      const current = await repo().mongo.usage().findOne({userId:req.userId,period});
      const used = current?.used || 0;
      return res.json({limit:2,used,remaining:Math.max(0,2-used),period});
    }
    const used = memoryUsage.get(req.userId+"::"+period) || 0;
    res.json({limit:2,used,remaining:Math.max(0,2-used),period});
  } catch(e) { next(e); }
});
router.get("/analyses/:id/report.html", async (req,res,next) => {
  try {
    const a = await getStore(req.params.id, req.userId);
    if (!a) return res.status(404).json({error:"analysis_not_found"});
    if (!a.result) return res.status(409).json({error:"analysis_not_completed"});
    res.type("html").send(await renderReport(a));
  } catch(e) { next(e); }
});
module.exports = router;