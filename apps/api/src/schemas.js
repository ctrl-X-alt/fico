function normalizeInput(body={}){
  const input={business:body.business||{},users:body.users||{},onboarding:body.onboarding||{},funnel:body.funnel||{},screenshots:Array.isArray(body.screenshots)?body.screenshots:[],context:body.context||{},constraints:body.constraints||{}};
  return input;
}
function validateCreate(input){
  const errors=[];
  if(!input.onboarding.activation)errors.push("onboarding.activation is required");
  if(input.funnel.steps!==undefined&&!Array.isArray(input.funnel.steps))errors.push("funnel.steps must be an array");
  return errors;
}
module.exports={normalizeInput,validateCreate};