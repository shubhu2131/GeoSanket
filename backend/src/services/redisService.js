const { getRedis } = require("../config/redis");

const DEDUP_TTL    = 86400; // 24 hours
const CACHE_TTL    = 300;   // 5 minutes
const DWELL_TTL    = 3600;  // 1 hour

const checkDedup = async (userId, zoneId) => {
  const r = await getRedis();
  if (!r) return false;
  const key = `notif:${userId}:${zoneId}`;
  return !!(await r.get(key));
};

const setDedup = async (userId, zoneId) => {
  const r = await getRedis();
  if (!r) return;
  await r.setEx(`notif:${userId}:${zoneId}`, DEDUP_TTL, "1");
};

const getCachedZones = async (lat, lng) => {
  const r = await getRedis();
  if (!r) return null;
  const key = `zones:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const cached = await r.get(key);
  return cached ? JSON.parse(cached) : null;
};

const setCachedZones = async (lat, lng, zones) => {
  const r = await getRedis();
  if (!r) return;
  const key = `zones:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  await r.setEx(key, CACHE_TTL, JSON.stringify(zones));
};

const getDwellStart = async (userId, zoneId) => {
  const r = await getRedis();
  if (!r) return null;
  return r.get(`dwell:${userId}:${zoneId}`);
};

const setDwellStart = async (userId, zoneId) => {
  const r = await getRedis();
  if (!r) return;
  await r.setEx(`dwell:${userId}:${zoneId}`, DWELL_TTL, Date.now().toString());
};

module.exports = { checkDedup, setDedup, getCachedZones, setCachedZones, getDwellStart, setDwellStart };