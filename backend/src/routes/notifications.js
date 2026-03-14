const router = require("express").Router();
const NotificationLog = require("../models/NotificationLog");
const { protect, asyncHandler } = require("../middleware/auth");

router.get("/", protect, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const notifications = await NotificationLog.find({ user: req.user._id })
    .populate("zone project").sort("-createdAt").limit(limit);
  res.json({ success: true, notifications });
}));

module.exports = router;