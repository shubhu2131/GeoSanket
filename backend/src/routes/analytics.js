const router = require("express").Router();
const NotificationLog = require("../models/NotificationLog");
const User    = require("../models/User");
const Zone    = require("../models/Zone");
const { protect, adminOnly, asyncHandler } = require("../middleware/auth");

router.get("/overview", protect, adminOnly, asyncHandler(async (req, res) => {
  const [totalUsers, totalZones, totalNotifications, todayNotifications] = await Promise.all([
    User.countDocuments(),
    Zone.countDocuments({ isActive: true }),
    NotificationLog.countDocuments({ status: "sent" }),
    NotificationLog.countDocuments({ status: "sent", createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
  ]);
  const failed = await NotificationLog.countDocuments({ status: "failed" });
  const total  = totalNotifications + failed;
  res.json({ success: true, stats: { totalUsers, totalZones, totalNotifications, todayNotifications, deliveryRate: total ? `${((totalNotifications/total)*100).toFixed(1)}%` : "0%" } });
}));

router.get("/timeline", protect, adminOnly, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const from = new Date(Date.now() - days * 86400000);
  const timeline = await NotificationLog.aggregate([
    { $match: { status: "sent", createdAt: { $gte: from } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, timeline });
}));

router.get("/heatmap", protect, adminOnly, asyncHandler(async (req, res) => {
  const logs = await NotificationLog.find({ status: "sent", "location.lat": { $exists: true } }).select("location");
  const heatmapData = logs.map(l => [l.location.lat, l.location.lng, 1]);
  res.json({ success: true, heatmapData });
}));

router.get("/by-zone", protect, adminOnly, asyncHandler(async (req, res) => {
  const stats = await NotificationLog.aggregate([
    { $match: { status: "sent" } },
    { $group: { _id: "$zone", totalNotifications: { $sum: 1 }, uniqueUserCount: { $addToSet: "$user" } } },
    { $lookup: { from: "zones", localField: "_id", foreignField: "_id", as: "zoneData" } },
    { $project: { zoneName: { $arrayElemAt: ["$zoneData.name", 0] }, zoneType: { $arrayElemAt: ["$zoneData.zoneType", 0] }, totalNotifications: 1, uniqueUserCount: { $size: "$uniqueUserCount" } } },
    { $sort: { totalNotifications: -1 } },
  ]);
  res.json({ success: true, stats });
}));

module.exports = router;