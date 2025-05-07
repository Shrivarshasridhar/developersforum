const express = require('express');
const router = express.Router();
const { 
  createRegistration,
  getRegistrationsByEvent 
} = require('../controllers/registrationController');

router.post('/', createRegistration);
router.get('/event/:eventId', getRegistrationsByEvent);

module.exports = router; 