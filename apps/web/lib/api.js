const base=process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000/api";
async function request(path,options={}){const response=await fetch(base+path,{...options,credentials:"include",headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})}});if(!response.ok){let data={};try{data=await response.json()}catch{}throw new Error(data.message||data.error||"Request failed")}return response.json();}
export const createAnalysis=input=>request("/analyses",{method:"POST",body:JSON.stringify(input)});
export const getAnalysis=id=>request("/analyses/"+encodeURIComponent(id));
export const runAnalysis=id=>request("/analyses/"+encodeURIComponent(id)+"/run",{method:"POST"});
export const listAnalyses=()=>request("/analyses");
export const getUsage=()=>request("/usage");