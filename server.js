require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    // Automatically runs our dashboard cleanup script
    clearTestData();
  })
  .catch(err => console.error('Database connection error:', err));

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

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'leaderboard.html'));
});

// Data API Endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ elo: -1 }).limit(100); 
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database record packets' });
  }
});

// CLEANUP TOOL: Erases the dummy player profile directly from the cloud
async function clearTestData() {
  try {
    const deleted = await Player.deleteOne({ username: "BetaTester" });
    if (deleted.deletedCount > 0) {
      console.log("Cleanup active: 'BetaTester' placeholder profile successfully deleted from MongoDB!");
    }
  } catch (err) {
    console.error("Cleanup script hit an error:", err);
  }
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server running dynamically');
  });
}

module.exports = app;
