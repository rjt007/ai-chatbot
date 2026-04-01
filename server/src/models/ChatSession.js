const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: null,
  },
  textColor: {
    type: String,
    default: null,
  },
  rule: {
    type: String,
    enum: ['city-temperature', 'decimal-number', 'urgency-tone', null],
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [messageSchema],
    title: {
      type: String,
      default: 'New Chat',
    },
  },
  {
    timestamps: true,
  }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = { ChatSession };
