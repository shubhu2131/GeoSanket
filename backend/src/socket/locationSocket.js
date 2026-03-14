const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");
const User       = require("../models/User");
const { findZonesNearPoint }   = require("../services/geoService");
const { checkDedup, setDedup, getCachedZones, setCachedZones, getDwellStart, setDwellStart } = require("../services/redisService");
const { sendPushNotification } = require("../services/notificationService");

let io;
let adminNamespace;

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  // ── /location namespace — mobile app ──────────────────────────────────────
  const locationNS = io.of("/location");
  locationNS.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      next();
    } catch { next(new Error("Auth failed")); }
  });

  locationNS.on("connection", (socket) => {
    console.log("Mobile connected:", socket.user?.deviceId || socket.user?._id);

    socket.on("location:update", async ({ lat, lng }) => {
      const userId   = socket.user._id;
      const fcmToken = socket.user.fcmToken;
      const lang     = socket.user.language || "hi";

      let zones = await getCachedZones(lat, lng);
      if (!zones) { zones = await findZonesNearPoint(lat, lng); await setCachedZones(lat, lng, zones); }

      for (const zone of zones) {
        if (!zone.project) continue;
        const duped = await checkDedup(userId, zone._id);
        if (duped) continue;

        const dwellStart = await getDwellStart(userId, zone._id);
        if (!dwellStart) { await setDwellStart(userId, zone._id); socket.emit("zone:entered", { zoneId: zone._id, zoneName: zone.name }); continue; }
        const dwellSecs = (Date.now() - parseInt(dwellStart)) / 1000;
        if (dwellSecs < zone.dwellTimeSeconds) { socket.emit("zone:dwelling", { zoneId: zone._id, dwellSeconds: Math.floor(dwellSecs) }); continue; }

        const result = await sendPushNotification({ userId, fcmToken, lang, project: zone.project, zone, location: { lat, lng } });
        if (result.success) {
          await setDedup(userId, zone._id);
          socket.emit("notification:sent", { zoneId: zone._id, projectId: zone.project._id });
          if (adminNamespace) adminNamespace.emit("live:notification", { userId, zoneName: zone.name, projectName: zone.project?.name?.en, location: { lat, lng }, timestamp: new Date() });
        }
      }
      socket.emit("location:ack", { zonesNearby: zones.length, lat, lng });
    });
  });

  // ── /admin namespace — dashboard ──────────────────────────────────────────
  adminNamespace = io.of("/admin");
  adminNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user?.role !== "admin") return next(new Error("Not admin"));
      socket.user = user;
      next();
    } catch { next(new Error("Auth failed")); }
  });
  adminNamespace.on("connection", (socket) => {
    console.log("Admin dashboard connected:", socket.user?.name);
  });
};

module.exports = { initSocket };