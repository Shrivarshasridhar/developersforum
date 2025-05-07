const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Add test route
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    const state = mongoose.connection.readyState;
    res.json({
      state: dbState[state],
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: await mongoose.connection.db.listCollections().toArray()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
app.use('/api/questions', require('./routes/questions'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/community-chat', require('./routes/communityChat'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 