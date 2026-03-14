const Zone = require("../models/Zone");

const findZonesNearPoint = async (lat, lng, radiusMeters = 1000) => {
  return Zone.find({
    isActive: true,
    centerPoint: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  }).populate("project");
};

const isPointInZone = (lat, lng, zone) => {
  if (!zone.centerPoint?.coordinates) return false;
  const [zLng, zLat] = zone.centerPoint.coordinates;
  const R = 6371000;
  const dLat = ((lat - zLat) * Math.PI) / 180;
  const dLng = ((lng - zLng) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(zLat*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.sin(dLng/2)**2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return dist <= zone.radiusMeters;
};

module.exports = { findZonesNearPoint, isPointInZone };