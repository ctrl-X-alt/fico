const { MongoClient } = require("mongodb");

class MongoRepository {
  constructor(uri, dbName = "fico") { this.uri = uri; this.dbName = dbName; this.client = null; this.db = null; }
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
      this.usage().createIndex({ userId: 1, period: 1 }, { unique: true })
    ]);
    return this.db;
  }
  async close() { if (this.client) await this.client.close(); this.client = null; this.db = null; }
  analyses() { return this.db.collection("analyses"); }
  users() { return this.db.collection("users"); }
  usage() { return this.db.collection("usage"); }
  async createAnalysis(item) { await this.analyses().insertOne({ ...item, _id: item.id }); return item; }
  async getAnalysis(id, ownerId) { return this.analyses().findOne({ _id: id, ownerId }); }
  async listAnalyses(ownerId) { return this.analyses().find({ ownerId }).sort({ createdAt: -1 }).toArray(); }
  async updateAnalysis(id, ownerId, patch) {
    const result = await this.analyses().findOneAndUpdate({ _id: id, ownerId }, { $set: patch }, { returnDocument: "after" });
    return result.value;
  }
  async consumeUsage(userId, period, limit = 2) {
    const filter = { userId, period, $or: [{ used: { $lt: limit } }, { used: { $exists: false } }] };
    const now = new Date().toISOString();
    const result = await this.usage().findOneAndUpdate(
      filter,
      { $inc: { used: 1 }, $set: { updatedAt: now }, $setOnInsert: { userId, period, limit, createdAt: now } },
      { upsert: true, returnDocument: "after" }
    );
    if (result.value) {
      const used = result.value.used;
      return { allowed: used <= limit, used, limit, remaining: Math.max(0, limit - used), period };
    }
    const current = await this.usage().findOne({ userId, period });
    const used = current?.used || 0;
    return { allowed: false, used, limit, remaining: Math.max(0, limit - used), period };
  }
}
module.exports = { MongoRepository };