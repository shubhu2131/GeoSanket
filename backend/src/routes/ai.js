// backend/src/routes/ai.js
const router = require("express").Router();
const { protect, adminOnly, asyncHandler } = require("../middleware/auth");

const AI_URL = (process.env.AI_SERVICE_URL || "").replace(/\/$/, "");

// POST /api/ai/extract  { text }  → structured project fields
router.post("/extract", protect, adminOnly, asyncHandler(async (req, res) => {
  const text = (req.body.text || "").trim();
  if (text.length < 20) return res.status(400).json({ success: false, error: "Provide at least 20 characters of text" });
  if (!AI_URL) return res.status(503).json({ success: false, error: "AI_SERVICE_URL is not configured on the backend" });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 70000); // Render free tier cold start can take ~50s
  try {
    const r = await fetch(`${AI_URL}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("[AI] service error", r.status, detail);
      return res.status(502).json({ success: false, error: `AI service returned ${r.status}` });
    }
    res.json({ success: true, ...(await r.json()) });
  } catch (e) {
    console.error("[AI] request failed:", e.message);
    res.status(504).json({ success: false, error: e.name === "AbortError" ? "AI service timed out (cold start?) — retry once" : `AI service unreachable: ${e.message}` });
  } finally {
    clearTimeout(timer);
  }
}));

module.exports = router;
