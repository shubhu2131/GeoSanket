require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const Zone     = require("../models/Zone");
const Project  = require("../models/Project");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — seeding...");

  await Promise.all([User.deleteMany(), Zone.deleteMany(), Project.deleteMany()]);

  // Projects
  const p1 = await Project.create({ name: { en: "AIIMS Trauma Centre Expansion", hi: "एम्स ट्रॉमा सेंटर विस्तार" }, description: { en: "Expanded trauma centre with 200 new beds", hi: "200 नए बिस्तरों के साथ ट्रॉमा सेंटर का विस्तार" }, projectType: "hospital", leader: { name: "Arvind Kejriwal", designation: "Chief Minister, Delhi" }, budget: { sanctioned: 85000000, spent: 72000000 }, completionPercentage: 95, status: "completed", isVerified: true, scheme: "PMAY Health", department: "Health & Family Welfare", notificationTitle: { en: "AIIMS Trauma Centre", hi: "एम्स ट्रॉमा सेंटर" }, notificationBody: { en: "₹85Cr trauma centre — 4800+ free surgeries done here", hi: "₹85Cr ट्रॉमा सेंटर — यहाँ 4800+ निःशुल्क ऑपरेशन हुए" } });
  const p2 = await Project.create({ name: { en: "Signature Bridge", hi: "सिग्नेचर ब्रिज" }, description: { en: "Delhi's iconic cable-stayed bridge over Yamuna", hi: "यमुना पर दिल्ली का प्रतिष्ठित केबल ब्रिज" }, projectType: "bridge", leader: { name: "Arvind Kejriwal", designation: "Chief Minister, Delhi" }, budget: { sanctioned: 16000000000, spent: 15800000000 }, completionPercentage: 100, status: "completed", isVerified: true, scheme: "Delhi Infrastructure", department: "PWD Delhi", notificationTitle: { en: "Signature Bridge", hi: "सिग्नेचर ब्रिज" }, notificationBody: { en: "₹1600Cr iconic bridge — symbol of modern Delhi", hi: "₹1600Cr का प्रतिष्ठित पुल — आधुनिक दिल्ली का प्रतीक" } });
  const p3 = await Project.create({ name: { en: "Delhi University Metro Station", hi: "दिल्ली विश्वविद्यालय मेट्रो" }, description: { en: "Yellow line metro serving DU North Campus", hi: "डीयू नॉर्थ कैम्पस की मेट्रो सेवा" }, projectType: "college", leader: { name: "Manish Sisodia", designation: "Former Dy CM, Delhi" }, budget: { sanctioned: 5000000000, spent: 4800000000 }, completionPercentage: 100, status: "completed", isVerified: true, scheme: "DMRC Phase 2", department: "Delhi Metro Rail Corporation", notificationTitle: { en: "DU Metro Station", hi: "डीयू मेट्रो स्टेशन" }, notificationBody: { en: "DMRC Yellow Line — 3L+ students benefit daily", hi: "डीएमआरसी पीली लाइन — रोज़ 3 लाख+ छात्र लाभान्वित" } });

  // Zones
  await Zone.create({ name: "AIIMS Main Gate Zone", zoneType: "hospital", centerPoint: { type: "Point", coordinates: [77.2090, 28.5672] }, radiusMeters: 300, dwellTimeSeconds: 120, project: p1._id, address: "AIIMS, Ansari Nagar, New Delhi", isActive: true });
  await Zone.create({ name: "Signature Bridge Zone", zoneType: "bridge", centerPoint: { type: "Point", coordinates: [77.2263, 28.7073] }, radiusMeters: 400, dwellTimeSeconds: 120, project: p2._id, address: "Signature Bridge, Wazirabad, Delhi", isActive: true });
  await Zone.create({ name: "DU North Campus Metro Zone", zoneType: "college", centerPoint: { type: "Point", coordinates: [77.2073, 28.6880] }, radiusMeters: 500, dwellTimeSeconds: 120, project: p3._id, address: "Delhi University Metro, North Campus", isActive: true });

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  await User.create({ name: "GeoSanket Admin", phone: "9999999999", password: adminHash, role: "admin" });

  // Citizen user
  const citizenHash = await bcrypt.hash("citizen123", 10);
  await User.create({ name: "Test Citizen", phone: "9876543210", password: citizenHash, role: "citizen" });

  console.log("✅ Seeded: 3 projects, 3 zones, 2 users");
  console.log("   Admin:   9999999999 / admin123");
  console.log("   Citizen: 9876543210 / citizen123");
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });