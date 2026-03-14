const router  = require("express").Router();
const Project = require("../models/Project");
const { protect, adminOnly, asyncHandler } = require("../middleware/auth");

router.get("/",     asyncHandler(async (req, res) => {
  const projects = await Project.find({ isActive: true });
  res.json({ success: true, projects });
}));

router.post("/",    protect, adminOnly, asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.json({ success: true, project });
}));

router.put("/:id",  protect, adminOnly, asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, project });
}));

router.put("/:id/verify", protect, adminOnly, asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  res.json({ success: true, project });
}));

router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  await Project.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
}));

module.exports = router;