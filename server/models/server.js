const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  hour: { type: String, required: true },
  task: { type: String, default: '' },
  addedToTodo: { type: Boolean, default: false }
});

const plannerSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  slots: [slotSchema]
});

module.exports = mongoose.model('Planner', plannerSchema);