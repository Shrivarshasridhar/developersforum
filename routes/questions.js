const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestion,
  createQuestion,
  addAnswer,
  acceptAnswer
} = require('../controllers/questionController');

// Question routes
router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', createQuestion);

// Answer routes
router.post('/:id/answers', addAnswer);
router.post('/:questionId/answers/:answerId/accept', acceptAnswer);

module.exports = router;