const { createClient } = require("redis");

let client = null;

const getRedis = async () => {
  if (client) return client;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (e) => console.warn("Redis error:", e.message));
    await client.connect();
    console.log("✅ Redis connected");
  } catch (e) {
    console.warn("⚠️ Redis unavailable — dedup disabled");
    client = null;
  }
  return client;
};

module.exports = { getRedis };