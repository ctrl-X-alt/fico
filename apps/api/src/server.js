const express=require("express");
const cors=require("cors");
const router=require("./routes");
const app=express();
app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use("/api",router);
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:"internal_error"});});
if(require.main===module){const port=process.env.PORT||4000;app.listen(port,()=>console.log("Friction API listening on "+port));}
module.exports=app;