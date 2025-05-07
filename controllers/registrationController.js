// registrationController.js
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const mongoose = require('mongoose');

exports.createRegistration = async (req, res) => {
  console.log('Starting registration process...');
  console.log('Request body:', req.body);

  try {
    // Validate MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      throw new Error('Database connection not established');
    }

    // Validate required fields
    const { name, email, phone, eventId } = req.body;
    
    if (!name || !email || !phone || !eventId) {
      console.error('Missing required fields:', { name, email, phone, eventId });
      return res.status(400).json({
        message: 'Missing required fields',
        details: { name, email, phone, eventId }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Invalid phone number format'
      });
    }

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      console.error('Invalid eventId format:', eventId);
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    console.log('Found event:', event);

    if (!event) {
      console.error('Event not found for ID:', eventId);
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      eventId,
      email: email.toLowerCase()
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: 'You have already registered for this event'
      });
    }

    // Create new registration document
    const registration = new Registration({
      eventId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      organization: req.body.organization?.trim() || '',
      requirements: req.body.requirements?.trim() || ''
    });

    console.log('Attempting to save registration:', registration);

    // Save the registration
    const savedRegistration = await registration.save();
    console.log('Registration saved successfully:', savedRegistration);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: savedRegistration
    });

  } catch (error) {
    console.error('Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Send appropriate error response
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: 'Event not found'
      });
    }

    const registrations = await Registration.find({ eventId })
      .select('-__v')  // Exclude version key
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message 
    });
  }
};

// Add pagination to get registrations
exports.getRegistrationsWithPagination = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid event ID format'
      });
    }

    const totalRegistrations = await Registration.countDocuments({ eventId });
    const registrations = await Registration.find({ eventId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: registrations.length,
      total: totalRegistrations,
      totalPages: Math.ceil(totalRegistrations / limit),
      currentPage: page,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};