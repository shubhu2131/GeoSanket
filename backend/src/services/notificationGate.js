// In-memory store for demo — replace with Redis in production
const notificationStore = {};
const MAX_NOTIFICATIONS = 3;

const getNotificationVariant = (project, count) => {
  const costCr = (project.cost_inr / 10000000).toFixed(0);

  if (count === 1) return {
    title: project.name,
    body:  `Built with ₹${costCr} Cr · Completed ${project.completion_year} · ${project.impact_summary?.headline}`,
    type:  'introduction'
  };

  if (count === 2) return {
    title: `More about ${project.name}`,
    body:  `${project.impact_summary?.detail || project.impact_summary?.headline} · Tap for full details`,
    type:  'followup'
  };

  if (count === 3) return {
    title: `Did you know? — ${project.name}`,
    body:  `${project.impact_summary?.headline} · Authority: ${project.responsible_authority || 'Govt of India'}`,
    type:  'final'
  };

  return null;
};

const checkNotificationGate = async (deviceId, fenceId, project) => {
  const key     = `${deviceId}:${fenceId}`;
  const current = String(project.content_version);
  let   record  = notificationStore[key] || { count: 0, version: null };

  // Version changed — reset counter
  if (record.version !== null && record.version !== current) {
    record = { count: 0, version: current };
  }

  // Max reached
  if (record.count >= MAX_NOTIFICATIONS) {
    return {
      shouldNotify: false,
      reason:       `max_reached — sent ${record.count} times`
    };
  }

  // Send notification
  record.count   += 1;
  record.version  = current;
  notificationStore[key] = record;

  return {
    shouldNotify: true,
    notification: getNotificationVariant(project, record.count),
    meta: {
      notificationCount: record.count,
      maxNotifications:  MAX_NOTIFICATIONS,
      isFinal:           record.count === MAX_NOTIFICATIONS
    }
  };
};

module.exports = { checkNotificationGate };
```
> Click **"Commit new file"**

---

**File 4 — backend/.env.example**

Click **"Add file" → "Create new file"** → type `backend/.env.example`

Paste:
```
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FCM_SERVER_KEY=your-fcm-key
