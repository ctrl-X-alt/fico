const { MongoClient } = require("mongodb");

class MongoRepository {
  constructor(uri, dbName = "fico") {
    this.uri = uri; this.dbName = dbName; this.client = null; this.db = null;
  }
  async connect() {
    if (this.db) return this.db;
    this.client = new MongoClient(this.uri, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000)
    });
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    await Promise.all([
      this.analyses().createIndex({ ownerId: 1, createdAt: -1 }),
      this.analyses().createIndex({ ownerId: 1, id: 1 }, { unique: true }),
      this.users().createIndex({ id: 1 }, { unique: true }),
      this.users().createIndex({ email: 1 }, { unique: true, sparse: true }),
      this.usage().createIndex({ userId: 1, period: 1 }, { unique: true }),
      this.analyses().createIndex({ status: 1, leaseExpiresAt: 1 })
    ]);
    return this.db;
  }
  async close() { if (this.client) await this.client.close(); this.client = null; this.db = null; }
  analyses() { return this.db.collection("analyses"); }
  users() { return this.db.collection("users"); }
  usage() { return this.db.collection("usage"); }
  async createAnalysis(item) { await this.analyses().insertOne({ ...item, _id: item.id }); return item; }
  async getAnalysis(id, ownerId) { return this.analyses().findOne({ _id: id, ownerId }, { projection: { _id: 0 } }); }
  async listAnalyses(ownerId) { return this.analyses().find({ ownerId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(); }
  async updateAnalysis(id, ownerId, patch) {
    return this.analyses().findOneAndUpdate(
      { _id: id, ownerId }, { $set: patch },
      { returnDocument: "after", projection: { _id: 0 } }
    );
  }
  async reserveUsage(userId, period, limit = 2) {
    const now = new Date().toISOString();
    const existing = await this.usage().findOneAndUpdate(
      { userId, period, $expr: { $lt: [{ $add: [{ $ifNull: ["$used", 0] }, { $ifNull: ["$reserved", 0] }] }, limit] } },
      { $inc: { reserved: 1 }, $set: { updatedAt: now, limit } },
      { returnDocument: "after", projection: { _id: 0 } }
    );
    if (existing) return { allowed: true, used: existing.used || 0, reserved: existing.reserved || 0, limit, remaining: Math.max(0, limit - (existing.used || 0) - (existing.reserved || 0)), period };
    try {
      await this.usage().insertOne({ userId, period, used: 0, reserved: 1, limit, createdAt: now, updatedAt: now });
      return { allowed: true, used: 0, reserved: 1, limit, remaining: limit - 1, period };
    } catch (e) {
      if (e?.code !== 11000) throw e;
    }
    const current = await this.usage().findOne({ userId, period }, { projection: { _id: 0 } });
    const used = current?.used || 0, reserved = current?.reserved || 0;
    return { allowed: false, used, reserved, limit, remaining: Math.max(0, limit - used - reserved), period };
  }
  async finalizeUsage(userId, periodOrReservation, success) {
    const period = typeof periodOrReservation === "string" ? periodOrReservation : periodOrReservation.period;
    const now = new Date().toISOString();
    const update = success ? { $inc: { reserved: -1, used: 1 } } : { $inc: { reserved: -1 } };
    const r = await this.usage().findOneAndUpdate({ userId, period, reserved: { $gt: 0 } }, { ...update, $set: { updatedAt: now } }, { returnDocument: "after", projection: { _id: 0 } });
    return { allowed: true, used: r?.used || 0, reserved: r?.reserved || 0, limit: r?.limit || 2, remaining: Math.max(0, (r?.limit || 2) - (r?.used || 0) - (r?.reserved || 0)), period };
  }}
module.exports = { MongoRepository };