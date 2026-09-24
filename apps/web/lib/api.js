const base=process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000/api";
async function request(path,options={}){const token=typeof window!=="undefined"?localStorage.getItem("friction_auth_token"):null;const headers={...(options.body instanceof FormData?{}:options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})};if(token)headers.Authorization="Bearer "+token;const r=await fetch(base+path,{...options,credentials:"include",headers});if(!r.ok){let d={};try{d=await r.json()}catch{}throw new Error(d.error||"Request failed")}const ct=r.headers.get("content-type")||"";return ct.includes("application/json")?r.json():r.blob()}
const id=v=>encodeURIComponent(String(v));
export const createAnalysis=i=>request("/analyses",{method:"POST",body:JSON.stringify(i)});
export const getAnalysis=i=>request("/analyses/"+id(i));
export const runAnalysis=i=>request("/analyses/"+id(i)+"/run",{method:"POST"});
export const listAnalyses=()=>request("/analyses");
export const getUsage=()=>request("/usage");
export const uploadScreenshots=(i,files)=>{const f=new FormData();for(const x of files)f.append("screenshots",x,x.name);return request("/analyses/"+id(i)+"/screenshots",{method:"POST",body:f})};
export const deleteScreenshot=(i,s)=>request("/analyses/"+id(i)+"/screenshots/"+id(s),{method:"DELETE"});
export const authStart=()=>base+"/auth/google/start";
export const authMe=()=>request("/auth/me");
export const pdfUrl=i=>base+"/analyses/"+id(i)+"/pdf";