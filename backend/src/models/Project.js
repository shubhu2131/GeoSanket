const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name:        { en: String, hi: String },
  description: { en: String, hi: String },
  projectType: { type: String, enum: ["hospital","college","bridge","road","park","water","other"] },
  leader:      { name: String, designation: String },
  budget:      { sanctioned: Number, spent: Number },
  completionPercentage: { type: Number, default: 0 },
  status:      { type: String, enum: ["planned","in_progress","completed","on_hold"], default: "in_progress" },
  scheme:      String,
  department:  String,
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  notificationTitle: { en: String, hi: String },
  notificationBody:  { en: String, hi: String },
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);