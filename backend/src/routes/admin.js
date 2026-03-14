const router = require("express").Router();
const User   = require("../models/User");
const Zone   = require("../models/Zone");
const { protect, adminOnly, asyncHandler } = require("../middleware/auth");
const { sendPushNotification } = require("../services/notificationService");
const { getRedis } = require("../config/redis");

router.get("/users", protect, adminOnly, asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.json({ success: true, users });
}));

router.post("/notify/manual", protect, adminOnly, asyncHandler(async (req, res) => {
  const { userId, zoneId } = req.body;
  const user = await User.findById(userId);
  const zone = await Zone.findById(zoneId).populate("project");
  if (!user || !zone) return res.status(404).json({ success: false, error: "User or zone not found" });
  const result = await sendPushNotification({ userId, fcmToken: user.fcmToken, lang: user.language, project: zone.project, zone, location: {} });
  res.json({ success: true, result });
}));

router.delete("/dedup/clear", protect, adminOnly, asyncHandler(async (req, res) => {
  const { userId, zoneId } = req.body;
  const r = await getRedis();
  if (r) await r.del(`notif:${userId}:${zoneId}`);
  res.json({ success: true, message: "Dedup cleared" });
}));

module.exports = router;