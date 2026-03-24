const Diary = require('../models/Diary');

// GET /api/diary — all entries (dates + mood) for calendar dots
const getAllEntries = async (req, res) => {
  try {
    const entries = await Diary.find(
      { userId: req.user._id },
      'date mood content'
    ).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/diary/:date — single entry
const getEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const entry = await Diary.findOne({ userId: req.user._id, date });
    // return empty shell if not yet written
    res.json(entry || { date, content: '', mood: '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/diary/:date — upsert (auto-save)
const saveEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const { content, mood } = req.body;
    const entry = await Diary.findOneAndUpdate(
      { userId: req.user._id, date },
      { content, mood },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllEntries, getEntry, saveEntry };