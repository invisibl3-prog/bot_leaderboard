require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Core Connection: Establishes secure cloud sync with MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Database connection error:', err));

// 2. Blueprint Mapping: Matches your partner's data variables exactly
const PlayerSchema = new mongoose.Schema({
    _id: String,
    user_id: Number,
    username: String,
    elo: Number,
    rank: String,
    subrank: String,
    wins: Number,
    losses: Number
}, { collection: "players" });

const Player = mongoose.model('Player', PlayerSchema);

// 3. UI Router: Serve frontend assets from the public folder path securely
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'leaderboard.html'));
});

// 4. Data API Endpoint: Delivers top 100 player stats ordered by ELO score
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ elo: -1 }).limit(100); 
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database record packets' });
  }
});

// Start local execution engine
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// 5. Cloud Export Engine: Mandatory module handle for Vercel deployment infrastructure
module.exports = app;
