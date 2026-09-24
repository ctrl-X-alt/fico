function monthKey(d = new Date()) { return d.toISOString().slice(0, 7); }
function checkAndConsumeMemory(usage, userId, limit = 2, now = new Date()) {
  const key = userId + "::" + monthKey(now);
  const used = usage.get(key) || 0;
  if (used >= limit) return { allowed: false, used, limit, remaining: 0, period: monthKey(now) };
  const next = used + 1; usage.set(key, next);
  return { allowed: true, used: next, limit, remaining: limit - next, period: monthKey(now) };
}
module.exports = { monthKey, checkAndConsumeMemory };