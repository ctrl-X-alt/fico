function getUser(req) {
  const id = req.headers["x-user-id"];
  if (process.env.NODE_ENV === "production" && !id) return null;
  return id || "local-user";
}
function requireAuth(req, res, next) {
  const userId = getUser(req);
  if (!userId) return res.status(401).json({ error: "authentication_required" });
  req.userId = String(userId);
  next();
}
module.exports = { getUser, requireAuth };