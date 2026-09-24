const { MongoRepository } = require("./repositories/mongo.repository");
const memory = require("./repositories/memory.repository");
let state = { kind: "memory", memory, ready: false };
async function initRepository() {
  if (state.ready) return state;
  if (process.env.MONGODB_URI) {
    const mongo = new MongoRepository(process.env.MONGODB_URI, process.env.MONGODB_DB || "fico");
    await mongo.connect();
    state = { kind: "mongo", mongo, ready: true };
  } else state.ready = true;
  return state;
}
async function closeRepository() { if (state.kind === "mongo") await state.mongo.close(); state = { kind: "memory", memory, ready: false }; }
function getRepository() { return state; }
module.exports = { initRepository, closeRepository, getRepository };