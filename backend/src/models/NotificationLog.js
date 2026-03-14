const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  zone:    { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  status:  { type: String, enum: ["sent","failed","deduped"], default: "sent" },
  channel: { type: String, default: "fcm" },
  location:{ lat: Number, lng: Number },
  openedAt: Date,
}, { timestamps: true, expireAfterSeconds: 7776000 }); // 90 days TTL

module.exports = mongoose.model("NotificationLog", LogSchema);