// routes/aiRoutes.js
// AI analysis API endpoints

const express = require("express");
const router = express.Router();
const { analyzeComplaint, quickAnalyze } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// @route  POST /api/ai/analyze        → Analyze a saved complaint by ID
router.post("/analyze", protect, analyzeComplaint);

// @route  POST /api/ai/quick-analyze  → Analyze on-the-fly (no DB save)
router.post("/quick-analyze", protect, quickAnalyze);

module.exports = router;
