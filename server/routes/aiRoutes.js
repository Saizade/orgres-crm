const express = require('express');
const router = express.Router();
const { generateEmail, customerInsights, meetingSummary, aiChat, leadScoring } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate-email', generateEmail);
router.post('/customer-insights', customerInsights);
router.post('/meeting-summary', meetingSummary);
router.post('/chat', aiChat);
router.post('/lead-scoring', leadScoring);

module.exports = router;