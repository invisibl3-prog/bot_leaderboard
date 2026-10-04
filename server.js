require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
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

// Serve the static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Force the server to deliver leaderboard.html when loading the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

// API Endpoint to deliver the top 100 data rows to the interface
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ elo: -1 }).limit(100); 
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
