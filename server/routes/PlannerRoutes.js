const express = require('express');
const router = express.Router();
const { getPlanner, updateSlot } = require('../controllers/PlannerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:date', protect, getPlanner);
router.put('/:date', protect, updateSlot);

module.exports = router;