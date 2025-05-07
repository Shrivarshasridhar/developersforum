const mongoose = require('mongoose');
const Question = require('../models/Question');

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    // Increment views
    question.views += 1;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      authorName: req.body.author,
      isAnonymous: req.body.isAnonymous || false,
      tags: req.body.tags || []
    });
    const savedQuestion = await question.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add answer to question
exports.addAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: 'Answer content is required' });
    }

    if (!req.body.isAnonymous && !req.body.author) {
      return res.status(400).json({ message: 'Author name is required when not posting anonymously' });
    }

    const authorName = req.body.isAnonymous ? 'Anonymous' : req.body.author;

    const answer = {
      content: req.body.content,
      author: req.body.author || 'Anonymous',
      authorName: authorName,
      isAnonymous: req.body.isAnonymous || false,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date()
    };

    question.answers.push(answer);
    await question.save();
    
    // Fetch the updated question to ensure we have all the correct data
    const updatedQuestion = await Question.findById(req.params.id);
    res.status(201).json(updatedQuestion);
  } catch (error) {
    console.error('Error adding answer:', error);
    res.status(400).json({ message: error.message || 'Failed to add answer' });
  }
};

// Mark answer as accepted
exports.acceptAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only the question author can accept an answer
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }

    question.acceptedAnswer = req.params.answerId;
    question.solved = true;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};