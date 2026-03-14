const router  = require("express").Router();
const Zone    = require("../models/Zone");
const { protect, adminOnly, asyncHandler } = require("../middleware/auth");

router.get("/",    asyncHandler(async (req, res) => {
  const zones = await Zone.find({ isActive: true }).populate("project");
  res.json({ success: true, zones });
}));

router.post("/",   protect, adminOnly, asyncHandler(async (req, res) => {
  const { name, projectId, zoneType, center, radiusMeters, dwellTimeSeconds, address } = req.body;
  const zone = await Zone.create({
    name, zoneType, address,
    radiusMeters:     radiusMeters     || 300,
    dwellTimeSeconds: dwellTimeSeconds || 300,
    project:      projectId,
    centerPoint:  { type: "Point", coordinates: [center.lng, center.lat] },
  });
  res.json({ success: true, zone });
}));

router.put("/:id",  protect, adminOnly, asyncHandler(async (req, res) => {
  const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, zone });
}));

router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  await Zone.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
}));

module.exports = router;