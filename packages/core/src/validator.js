function isNumber(v){return typeof v==="number"&&Number.isFinite(v)&&v>=0}
function validateAnalysisInput(input){
  const errors=[],warnings=[];
  if(!input||typeof input!=="object") return {valid:false,errors:["input must be an object"],warnings:[]};
  if(!input.business?.name) warnings.push("business name is missing");
  if(!input.onboarding?.activation) errors.push("activation definition is required");
  const steps=input.funnel?.steps;
  if(Array.isArray(steps)){
    for(let i=0;i<steps.length;i++){const s=steps[i];if(!s?.name)errors.push("funnel step "+(i+1)+" is missing a name");if(!isNumber(s?.users))errors.push("funnel step "+(i+1)+" users must be a non-negative number");if(i>0&&isNumber(steps[i-1]?.users)&&isNumber(s?.users)&&s.users>steps[i-1].users)errors.push("funnel step "+(i+1)+" has more users than previous step")}
  } else if(steps!==undefined) errors.push("funnel.steps must be an array");
  if(input.funnel?.measurementWindow&&input.funnel?.previousMeasurementWindow&&input.funnel.measurementWindow!==input.funnel.previousMeasurementWindow)warnings.push("measurement windows differ");
  if(input.funnel?.activationStep&&Array.isArray(steps)&&!steps.some(s=>s.name===input.funnel.activationStep))warnings.push("activationStep is not present in funnel steps");
  return {valid:errors.length===0,errors,warnings};
}
module.exports={validateAnalysisInput};