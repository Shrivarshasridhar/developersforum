const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true,
    default: function() {
      return this.isAnonymous ? 'Anonymous' : this.author;
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // Enable auto-generation of _id for answers

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true,
    default: function() {
      return this.isAnonymous ? 'Anonymous' : this.author;
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  answers: [answerSchema],
  solved: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure answers get their own IDs
answerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

// Add method to find answer by ID
questionSchema.methods.findAnswerById = function(answerId) {
  return this.answers.find(answer => answer._id.toString() === answerId.toString());
};

module.exports = mongoose.model('Question', questionSchema);