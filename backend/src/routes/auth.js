const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User   = require("../models/User");
const { protect, asyncHandler } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", asyncHandler(async (req, res) => {
  const { name, phone, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, password: hash, role: role || "citizen" });
  res.json({ success: true, token: user.getSignedJWT(), user: { id: user._id, name, role: user.role } });
}));

// POST /api/auth/register-device  (anonymous)
router.post("/register-device", asyncHandler(async (req, res) => {
  const { deviceId, fcmToken, language } = req.body;
  let user = await User.findOne({ deviceId });
  if (!user) {
    user = await User.create({ deviceId, fcmToken, language: language || "hi", isAnonymous: true });
  } else {
    user.fcmToken = fcmToken || user.fcmToken;
    await user.save();
  }
  res.json({ success: true, token: user.getSignedJWT(), userId: user._id });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  res.json({ success: true, token: user.getSignedJWT(), user: { id: user._id, name: user.name, role: user.role } });
}));

// GET /api/auth/me
router.get("/me", protect, asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
}));

module.exports = router;