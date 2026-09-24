class HttpError extends Error{constructor(status,code,message,details){super(message);this.status=status;this.code=code;this.details=details}}
function sendError(res,err){const status=err.status||500;res.status(status).json({error:err.code||"internal_error",message:status>=500?"Internal server error":err.message,details:status>=500?undefined:err.details})}
module.exports={HttpError,sendError};