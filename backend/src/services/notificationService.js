const admin  = require("../config/firebase");
const NotificationLog = require("../models/NotificationLog");
const User   = require("../models/User");

const sendPushNotification = async ({ userId, fcmToken, lang = "hi", project, zone, location }) => {
  if (!fcmToken || !project) return { success: false, reason: "no_token_or_project" };

  const title = project.notificationTitle?.[lang] || project.notificationTitle?.en || project.name?.[lang] || project.name?.en || "Government Project";
  const body  = project.notificationBody?.[lang]  || project.notificationBody?.en  ||
    `${project.name?.en} — ₹${((project.budget?.sanctioned||0)/1e7).toFixed(0)} Cr · ${project.completionPercentage}% complete`;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { zoneId: zone._id.toString(), projectId: project._id.toString() },
      android: { priority: "high" },
    });

    await NotificationLog.create({ user: userId, zone: zone._id, project: project._id, status: "sent", location });
    await User.findByIdAndUpdate(userId, { $inc: { totalNotificationsReceived: 1 } });

    return { success: true };
  } catch (err) {
    await NotificationLog.create({ user: userId, zone: zone._id, project: project._id, status: "failed", location });
    return { success: false, reason: err.message };
  }
};

module.exports = { sendPushNotification };