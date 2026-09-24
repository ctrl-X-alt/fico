const crypto=require("node:crypto");
const RUNNING=new Map();
const TTL=Math.max(30000,Number(process.env.ANALYSIS_LOCK_TTL_MS||120000));
function token(){return crypto.randomUUID()}
function beginMemory(id){const now=Date.now(),at=RUNNING.get(id);if(at&&now-at.startedAt<TTL)return null;const leaseId=token();RUNNING.set(id,{startedAt:now,leaseId});return{leaseId,expiresAt:new Date(now+TTL).toISOString()}}
function endMemory(id,leaseId){const cur=RUNNING.get(id);if(!cur||(leaseId&&cur.leaseId!==leaseId))return false;RUNNING.delete(id);return true}
function begin(id,repo){return repo?.kind==="mongo"?repo.mongo.acquireLease(id,TTL):beginMemory(id)}
function end(id,leaseId,repo){return repo?.kind==="mongo"?repo.mongo.releaseLease(id,leaseId):endMemory(id,leaseId)}
module.exports={begin,end,beginMemory,endMemory,TTL};