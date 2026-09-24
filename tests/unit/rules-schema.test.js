const test=require("node:test"),assert=require("node:assert/strict"),{validateDiagnosis}=require("../../packages/core/src/rules");
const base={diagnosis_status:"potential_friction",confidence:{score:72,band:"moderate"},facts:[],hypotheses:[],uncertainties:[],data_quality:[],findings:[],recommendations:[],next_evidence:[]};
test("rejects malformed top level",()=>assert.equal(validateDiagnosis({}).valid,false));
test("rejects unknown evidence refs",()=>assert.equal(validateDiagnosis({...base,recommendations:[{title:"x",evidence_refs:["secret"]}]},["funnel"]).valid,false));
test("accepts known evidence refs",()=>assert.equal(validateDiagnosis({...base,recommendations:[{title:"x",evidence_refs:["funnel"]}]},["funnel"]).valid,true));