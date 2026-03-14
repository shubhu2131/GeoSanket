const router = require("express").Router();
const { protect, asyncHandler } = require("../middleware/auth");
const { findZonesNearPoint }    = require("../services/geoService");
const { checkDedup, setDedup, getCachedZones, setCachedZones, getDwellStart, setDwellStart } = require("../services/redisService");
const { sendPushNotification }  = require("../services/notificationService");

// POST /api/location/ping
router.post("/ping", protect, asyncHandler(async (req, res) => {
  const { lat, lng, zoneId, enteredZone } = req.body;
  const userId   = req.user._id;
  const fcmToken = req.user.fcmToken;
  const lang     = req.user.language || "hi";
  const results  = [];

  // Direct zone entry from OS geofencing
  if (zoneId && enteredZone) {
    const Zone = require("../models/Zone");
    const zone = await Zone.findById(zoneId).populate("project");
    if (zone && zone.project) {
      const duped = await checkDedup(userId, zoneId);
      if (!duped) {
        const r = await sendPushNotification({ userId, fcmToken, lang, project: zone.project, zone, location: { lat, lng } });
        if (r.success) await setDedup(userId, zoneId);
        results.push({ zoneId, status: r.success ? "notified" : r.reason });
      } else {
        results.push({ zoneId, status: "deduped" });
      }
    }
    return res.json({ success: true, notifications: results });
  }

  // Coordinate-based ping (Socket.io fallback)
  if (!lat || !lng) return res.status(400).json({ success: false, error: "lat/lng required" });

  let zones = await getCachedZones(lat, lng);
  if (!zones) {
    zones = await findZonesNearPoint(lat, lng);
    await setCachedZones(lat, lng, zones);
  }

  for (const zone of zones) {
    if (!zone.project) continue;
    const duped = await checkDedup(userId, zone._id);
    if (duped) { results.push({ zoneId: zone._id, status: "deduped" }); continue; }

    // Dwell time check
    const dwellStart = await getDwellStart(userId, zone._id);
    if (!dwellStart) { await setDwellStart(userId, zone._id); results.push({ zoneId: zone._id, status: "dwell_started" }); continue; }
    const dwellSecs = (Date.now() - parseInt(dwellStart)) / 1000;
    if (dwellSecs < zone.dwellTimeSeconds) { results.push({ zoneId: zone._id, status: `dwelling_${Math.floor(dwellSecs)}s` }); continue; }

    const r = await sendPushNotification({ userId, fcmToken, lang, project: zone.project, zone, location: { lat, lng } });
    if (r.success) await setDedup(userId, zone._id);
    results.push({ zoneId: zone._id, status: r.success ? "notified" : r.reason });
  }

  res.json({ success: true, notifications: results, zonesChecked: zones.length });
}));

// GET /api/location/nearby
router.get("/nearby", protect, asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const zones = await findZonesNearPoint(parseFloat(lat), parseFloat(lng));
  res.json({ success: true, zones });
}));

module.exports = router;