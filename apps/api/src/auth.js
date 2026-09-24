const crypto = require("node:crypto");

function getUser(req) {
  const id = req.headers["x-user-id"];
  if (process.env.NODE_ENV === "production" && !id) return null;
  return id ? String(id).slice(0, 128) : "local-user";
}
function requireAuth(req, res, next) {
  const userId = getUser(req);
  if (!userId) return res.status(401).json({ error: "authentication_required" });
  req.userId = userId;
  next();
}
function signLocalToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body+"."+sig;
}
module.exports = { getUser, requireAuth, signLocalToken };