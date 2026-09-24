const {validateAnalysisInput}=require("./validator");
const {analyzeFunnel}=require("./funnel");
const {buildHypotheses}=require("./hypotheses");
const {scoreConfidence}=require("./confidence");
function runDiagnostic(input){
  const validation=validateAnalysisInput(input);
  const funnel=analyzeFunnel(input?.funnel?.steps||[]);
  const hypotheses=buildHypotheses({funnelAnalysis:funnel,onboarding:input?.onboarding||{},screenshots:input?.screenshots||[]});
  const evidenceCompleteness=Math.min(1,(input?.funnel?.steps?.length?0.4:0)+(input?.screenshots?.length?0.2:0)+(input?.business?.name?0.1:0)+(input?.onboarding?.activation?0.2:0)+(input?.onboarding?.goal?0.1:0));
  const confidence=scoreConfidence({
    inputValid:validation.valid,
    evidenceCompleteness,
    dataQuality:validation.errors.length?0.4:0.9,
    contextClarity:input?.onboarding?.goal&&input?.onboarding?.activation?0.9:0.5,
    agreement:funnel?.largestDrop?0.7:0.5,
    contradictions:0
  });
  let status="insufficient_evidence";
  if(!validation.valid) status="data_quality_issue";
  else if(!funnel?.largestDrop) status="no_meaningful_friction_established";
  else status="meaningful_friction_signal";
  return {
    version:"1.0",
    diagnosis_status:status,
    confidence,
    validation,
    facts:funnel.facts||[],
    hypotheses,
    uncertainties:validation.warnings,
    data_quality:validation.errors,
    findings:funnel.findings||[],
    recommendations:funnel.recommendations||[],
    next_evidence:hypotheses.flatMap(h=>h.nextEvidence||[])
  };
}
module.exports={runDiagnostic};