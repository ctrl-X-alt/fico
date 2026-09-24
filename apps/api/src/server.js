const express = require("express");
const cors = require("cors");
const { initRepository } = require("./repository");
const router = require("./routes");
const app = express();
app.disable("x-powered-by");
const origins = (process.env.WEB_ORIGIN || "").split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : false, credentials: true }));
app.use(express.json({limit:process.env.JSON_BODY_LIMIT||"2mb"}));
app.use("/api", router);
app.use((err,_req,res,_next)=>{ console.error(err); const status=Number(err.statusCode||500); res.status(status).json({error:status>=500?"internal_error":"request_error"}); });
async function start(){ await initRepository(); const port=Number(process.env.PORT||4000); return app.listen(port,()=>console.log("Friction API listening on "+port)); }
if(require.main===module) start().catch(e=>{console.error(e);process.exit(1);});
module.exports=app; module.exports.start=start;