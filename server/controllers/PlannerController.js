const Planner = require('../models/Planner');

const DEFAULT_SLOTS = [
  '6 AM','7 AM','8 AM','9 AM','10 AM','11 AM',
  '12 PM','1 PM','2 PM','3 PM','4 PM','5 PM',
  '6 PM','7 PM','8 PM','9 PM','10 PM'
];

const getPlanner = async (req, res) => {
  try {
    const { date } = req.params;
    let planner = await Planner.findOne({ userId: req.user._id, date });
    if (!planner) {
      planner = await Planner.create({
        userId: req.user._id,
        date,
        slots: DEFAULT_SLOTS.map(hour => ({ hour, task: '', addedToTodo: false }))
      });
    }
    res.json(planner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const { date } = req.params;
    const { hour, task } = req.body;
    let planner = await Planner.findOne({ userId: req.user._id, date });
    if (!planner) return res.status(404).json({ message: 'Planner not found' });
    const slot = planner.slots.find(s => s.hour === hour);
    if (slot) slot.task = task;
    await planner.save();
    res.json(planner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlanner, updateSlot };