const ALLOWED_STATUS=new Set(["meaningful_friction_signal","potential_friction","normal_or_expected_behavior","insufficient_evidence","data_quality_issue","measurement_window_issue","segmentation_required","evidence_conflict","technical_cause_possible","intentional_qualification_possible","delayed_activation_possible","no_meaningful_friction_established"]);
const CAUSAL_WORDS=/\b(causes?|caused|proves?|definitely|certainly|users are confused|users hate|clearly broken)\b/i;
function sanitizeText(text){return typeof text==="string"?text.replace(/\s+/g," ").trim():""}
function validateDiagnosis(result){
 const errors=[]; if(!ALLOWED_STATUS.has(result?.diagnosis_status))errors.push("invalid diagnosis_status");
 if(typeof result?.confidence?.score!=="number"||result.confidence.score<0||result.confidence.score>100)errors.push("confidence.score must be 0..100");
 for(const group of ["facts","hypotheses","uncertainties","findings","recommendations","next_evidence"]) if(!Array.isArray(result?.[group]))errors.push(group+" must be an array");
 const text=JSON.stringify(result?.findings||[])+JSON.stringify(result?.recommendations||[]); if(CAUSAL_WORDS.test(text))errors.push("causal language requires evidence-linked rewrite");
 return {valid:errors.length===0,errors};
}
module.exports={ALLOWED_STATUS,validateDiagnosis,sanitizeText};