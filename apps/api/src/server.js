const express=require("express"),cors=require("cors"),{initRepository}=require("./repository"),router=require("./routes"),{sendError}=require("./errors"),{requestId}=require("./security");
const app=express();app.disable("x-powered-by");app.set("trust proxy",1);const origins=(process.env.WEB_ORIGIN||"").split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(o,cb)=>{if(!o||origins.includes(o))return cb(null,true);return cb(new Error("cors_origin_denied"));},credentials:true}));
app.use(express.json({limit:process.env.JSON_BODY_LIMIT||"2mb",strict:true}));
app.use((req,res,next)=>{res.setHeader("X-Request-Id",requestId());res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Referrer-Policy","no-referrer");res.setHeader("X-Frame-Options","DENY");res.setHeader("Permissions-Policy","camera=(),microphone=(),geolocation=()");next()});
app.use("/api",router);app.use((err,_req,res,_next)=>{sendError(res,err)});
async function start(){await initRepository();const port=Number(process.env.PORT||4000);return app.listen(port,()=>{})}if(require.main===module)start().catch(e=>{process.exit(1)});module.exports=app;module.exports.start=start;