const crypto=require("node:crypto");
const MAX_ID_LENGTH=128;
function requestId(){return crypto.randomUUID();}
function safeId(value){return typeof value==="string"&&value.length>0&&value.length<=MAX_ID_LENGTH&&/^[A-Za-z0-9._:-]+$/.test(value)?value:null;}
module.exports={requestId,safeId};