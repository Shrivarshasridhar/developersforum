const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  getEvent 
} = require('../controllers/eventController');

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEvent);

module.exports = router; 