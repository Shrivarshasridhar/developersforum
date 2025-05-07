// routes/communityChat.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a specific community
router.get('/messages/:communityId', async (req, res) => {
  try {
    const messages = await Message.find({ 
      communityId: req.params.communityId 
    })
    .sort({ timestamp: 1 })
    .limit(100);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a new message
router.post('/sendMessage', async (req, res) => {
  try {
    const { communityId, message, username } = req.body;

    // Validate required fields
    if (!communityId || !message || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create and save new message
    const newMessage = new Message({
      communityId,
      message: message.trim(),
      username,
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

module.exports = router;