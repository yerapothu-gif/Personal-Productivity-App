const express = require('express');
const cors = require('cors');
const authRoutes   = require('./routes/authRoutes');
const plannerRoutes = require('./routes/PlannerRoutes');
const diaryRoutes  = require('./routes/Diaryroutes');   // ← NEW

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/diary',   diaryRoutes);   // ← NEW

app.get('/', (req, res) => res.send('PPA API running 🌸'));

module.exports = app;