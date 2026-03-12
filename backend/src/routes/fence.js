const express = require('express');
const router  = express.Router();
const { checkNotificationGate } = require('../services/notificationGate');

// ─────────────────────────────────────────
// GET /api/v1/nearby-projects
// Called by existing govt apps (UMANG, Aarogya Setu)
// ─────────────────────────────────────────
router.get('/v1/nearby-projects', async (req, res) => {
  const { lat, lng, lang = 'en', app_id = 'standalone' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: 'lat and lng are required'
    });
  }

  // Mock project data — replace with MongoDB query
  const mockProjects = [
    {
      id:                    'proj-001',
      fence_id:              'fence-001',
      name:                  'Rajiv Gandhi Govt General Hospital',
      category:              'hospital',
      cost_inr:              820000000,
      completion_year:       2023,
      responsible_authority: 'Tamil Nadu Health Department',
      content_version:       1,
      distance_meters:       180,
      impact_summary: {
        headline: '4,800+ free surgeries performed annually',
        detail:   'Serves 400 patients monthly · Free for BPL cardholders'
      }
    }
  ];

  // Check notification gate for each project
  const results = [];
  for (const project of mockProjects) {
    const gate = await checkNotificationGate(
      req.headers['x-device-id'] || 'demo-device',
      project.fence_id,
      project
    );

    if (gate.shouldNotify) {
      results.push({
        title:            project.name,
        body:             gate.notification.body,
        project_id:       project.id,
        distance_meters:  project.distance_meters,
        should_notify:    true,
        notification_count: gate.meta.notificationCount
      });
    }
  }

  res.json({
    projects:  results,
    location:  { lat, lng },
    language:  lang,
    app_id:    app_id,
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────
// POST /api/fence-entry
// Called by mobile app on geo-fence entry
// ─────────────────────────────────────────
router.post('/fence-entry', async (req, res) => {
  const { fenceId, deviceId, enteredAt } = req.body;

  if (!fenceId || !deviceId) {
    return res.status(400).json({
      error: 'fenceId and deviceId are required'
    });
  }

  // Mock project lookup — replace with MongoDB query
  const project = {
    id:              'proj-001',
    name:            'Rajiv Gandhi Govt General Hospital',
    cost_inr:        820000000,
    completion_year: 2023,
    content_version: 1,
    impact_summary:  { headline: '4,800+ free surgeries performed annually' }
  };

  const gate = await checkNotificationGate(deviceId, fenceId, project);

  if (!gate.shouldNotify) {
    return res.json({
      shouldNotify: false,
      reason:       gate.reason
    });
  }

  return res.json({
    shouldNotify:  true,
    notification:  gate.notification,
    meta:          gate.meta
  });
});

module.exports = router;
