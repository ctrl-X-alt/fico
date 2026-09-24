const base=process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000/api";
async function request(path,options={}){
 const response=await fetch(base+path,{...options,credentials:"include",headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})}});
 if(!response.ok){let data={};try{data=await response.json()}catch{}throw new Error(data.message||data.error||"Request failed")}
 const ct=response.headers.get("content-type")||"";
 return ct.includes("application/json")?response.json():response.blob();
}
const id=v=>encodeURIComponent(String(v));
export const createAnalysis=input=>request("/analyses",{method:"POST",body:JSON.stringify(input)});
export const getAnalysis=x=>request("/analyses/"+id(x));
export const runAnalysis=x=>request("/analyses/"+id(x)+"/run",{method:"POST"});
export const listAnalyses=()=>request("/analyses");
export const getUsage=()=>request("/usage");
export const reportUrl=x=>base+"/analyses/"+id(x)+"/report.html";
export const pdfUrl=x=>base+"/analyses/"+id(x)+"/pdf";
