const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/solve', protect, progressController.solveQuestion);
// router.get('/:userId', protect, progressController.getProgress); // Optional

module.exports = router;
