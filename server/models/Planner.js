const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  hour: { type: String, required: true },
  task: { type: String, default: '' },
  addedToTodo: { type: Boolean, default: false }
});

const plannerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  slots: [slotSchema]
}, { timestamps: true });

module.exports = mongoose.model('Planner', plannerSchema);