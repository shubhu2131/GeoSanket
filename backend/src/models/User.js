const mongoose = require("mongoose");
const jwt      = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  deviceId:   { type: String, unique: true, sparse: true },
  name:       { type: String, default: "Citizen" },
  phone:      { type: String, unique: true, sparse: true },
  password:   String,
  role:       { type: String, enum: ["citizen","admin"], default: "citizen" },
  fcmToken:   String,
  language:   { type: String, default: "hi" },
  isAnonymous:{ type: Boolean, default: false },
  totalNotificationsReceived: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.methods.getSignedJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = mongoose.model("User", UserSchema);