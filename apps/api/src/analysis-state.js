const RUNNING=new Set();
function begin(id){if(RUNNING.has(id))return false;RUNNING.add(id);return true}
function end(id){RUNNING.delete(id)}
module.exports={begin,end};