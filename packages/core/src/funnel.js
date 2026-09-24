function analyzeFunnel(funnel=[]){
  const steps=funnel.map((s,i)=>{
    const before=Number(s?.users),after=i<funnel.length-1?Number(funnel[i+1]?.users):before;
    const valid=Number.isFinite(before)&&Number.isFinite(after)&&before>=0&&after>=0&&after<=before;
    const lost=valid?before-after:null,dropoff=valid&&before>0?lost/before:null;
    return {...s,before,after,lost,dropoff,valid};
  });
  const validSteps=steps.filter(s=>s.valid&&s.before>0),largest=validSteps.reduce((acc,s)=>!acc||(s.dropoff??-1)>(acc.dropoff??-1)?s:acc,null);
  const first=validSteps[0],last=validSteps[validSteps.length-1],overall=first&&last?{from:first.name,to:last.name,before:first.before,after:last.after,conversion:first.before?last.after/first.before:null}:null;
  return {valid:steps.every(s=>s.valid),steps,largestDrop:largest?{step:largest.name,before:largest.before,after:largest.after,lost:largest.lost,rate:largest.dropoff}:null,overall,facts:largest?["Observed transition loss at "+largest.name+" is "+Math.round(largest.dropoff*100)+"%."]:[],warnings:steps.filter(s=>!s.valid).map(s=>"Invalid count at \""+s.name+"\"."),findings:largest?[{title:"Largest measured transition loss: "+Math.round(largest.dropoff*100)+"%",type:"observed_funnel_change",step:largest.name,before:largest.before,after:largest.after}]:[],recommendations:largest?[{title:"Validate the largest transition before redesigning it",action:"Segment conversion by user type, path, and activation outcome.",validation:"Compare the same measurement window and population."}]:[]};
}
module.exports={analyzeFunnel};