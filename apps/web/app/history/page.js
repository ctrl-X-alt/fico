"use client";
import{useEffect,useState}from"react";import{listAnalyses,getUsage}from"../../lib/api";
function Status({s}){return <span className="status">{s==="completed"?"Completed":s==="draft"?"Draft":s}</span>}
export default function History(){
 const[items,setItems]=useState([]),[usage,setUsage]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{Promise.all([listAnalyses(),getUsage()]).then(([a,u])=>{setItems(a);setUsage(u)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <main className="shell"><nav className="nav"><div className="brand">Friction</div><div><a href="/analysis/new">New analysis</a></div></nav>
 <div className="eyebrow">Diagnostic Dossier</div><h1>History</h1>
 <div className="card dossier-head"><div><div className="eyebrow">Workspace allocation</div><strong>{usage?usage.used+"/2 analyses used this month":"—"}</strong></div><div className="muted">{usage?usage.remaining+" remaining":""}</div></div>
 {error&&<div className="card error">{error}</div>}
 {loading?<p className="muted">Loading dossier…</p>:items.length===0?<div className="card">No analyses yet.<p className="muted">Your completed and draft diagnostics will appear here.</p></div>:
 <div className="history-list">{items.map(x=><a key={x.id} className="history-row" href={x.status==="completed"?"/report/"+x.id:"/analysis/"+x.id}><div><strong>{x.input?.business?.name||"Untitled analysis"}</strong><div className="muted">{new Date(x.createdAt).toLocaleString()}</div></div><div><Status s={x.status}/><div className="muted">{x.result?.diagnosis_status||"Not run"}</div></div><span>→</span></a>)}</div>}
 </main>
}