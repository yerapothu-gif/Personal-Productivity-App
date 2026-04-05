const express = require('express');
const router  = express.Router();
const { getAllEntries, getEntry, saveEntry } = require('../controllers/Diarycontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/',      protect, getAllEntries); // all entries (for calendar dots)
router.get('/:date', protect, getEntry);      // single entry by date
router.put('/:date', protect, saveEntry);     // upsert / auto-save

module.exports = router;