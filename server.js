require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Core Connection: Establishes secure cloud sync with MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    // Fire the data connection tester once connected
    injectTestPlayer();
  })
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

// 5. Automated Data Flow Tester Component
async function injectTestPlayer() {
  try {
    const total = await Player.countDocuments();
    // If the database has 0 players, insert a test placeholder profile instantly
    if (total === 0) {
      console.log("Database is completely empty. Injecting a cloud test player profile...");
      await Player.create({
        _id: "test_account_99",
        user_id: 1234567,
        username: "BetaTester",
        elo: 1250,
        rank: "Gold",
        subrank: "III",
        wins: 15,
        losses: 5
      });
      console.log("Cloud check passed: Test profile successfully registered!");
    } else {
      console.log(`Database sync active. Found ${total} live accounts stored inside cluster.`);
    }
  } catch (err) {
    console.error("Cloud check blocked:", err);
  }
}

// Start local execution engine
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// 6. Cloud Export Engine: Mandatory module handle for Vercel deployment infrastructure
module.exports = app;
