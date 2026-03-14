const mongoose = require("mongoose");

const ZoneSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  zoneType:   { type: String, enum: ["hospital","college","bridge","road","park","other"], default: "other" },
  centerPoint:{ type: { type: String, enum: ["Point"], default: "Point" }, coordinates: [Number] },
  boundary:   { type: { type: String, enum: ["Polygon"] }, coordinates: [[[Number]]] },
  radiusMeters:     { type: Number, default: 300 },
  dwellTimeSeconds: { type: Number, default: 300 },
  project:    { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  address:    String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

ZoneSchema.index({ centerPoint: "2dsphere" });
ZoneSchema.index({ boundary:    "2dsphere" });

module.exports = mongoose.model("Zone", ZoneSchema);