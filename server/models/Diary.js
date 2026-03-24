const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: String, required: true }, // YYYY-MM-DD
  content:{ type: String, default: '' },
  mood:   { type: String, default: '' },   // emoji string
}, { timestamps: true });

// one entry per user per day
diarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Diary', diarySchema);