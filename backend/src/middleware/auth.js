const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, error: "Not authorised" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) return res.status(401).json({ success: false, error: "User not found" });
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Admins only" });
  next();
};

module.exports = { protect, adminOnly, asyncHandler };