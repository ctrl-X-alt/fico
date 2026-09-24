const base=process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000/api";
async function request(path,options){const r=await fetch(base+path,{headers:{"Content-Type":"application/json",...(options?.headers||{})},...options});if(!r.ok){let d={};try{d=await r.json()}catch{}throw new Error(d.message||d.error||"Request failed")}return r.json()}
export const createAnalysis=input=>request("/analyses",{method:"POST",body:JSON.stringify(input)});
export const getAnalysis=id=>request("/analyses/"+id);
export const runAnalysis=id=>request("/analyses/"+id+"/run",{method:"POST"});
export const listAnalyses=()=>request("/analyses");