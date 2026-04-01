/**
 * Chat Routes
 *
 * POST /api/chat/message   — Send a message and get a styled philosopher response
 * GET  /api/chat/sessions  — Get user's chat sessions
 * GET  /api/chat/sessions/:id — Get a specific chat session
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { classifyInput } = require('../services/inputClassifier.service');
const { computeMessageStyle } = require('../services/colorEngine.service');
const { getPhilosopherResponse, getUrgencyScore } = require('../services/llm.service');
const { ChatSession } = require('../models/ChatSession');

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

/**
 * POST /api/chat/message
 * Body: { message, sessionId? }
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required.',
      });
    }

    // Step 1: Classify input
    const classified = classifyInput(message.trim());

    // Step 2: Get philosopher response from LLM
    const philosopherResponse = await getPhilosopherResponse(message.trim());

    // Step 3: If general text, get urgency score from LLM
    if (classified.type === 'general-text') {
      classified.urgencyScore = await getUrgencyScore(message.trim());
    }

    // Step 4: Compute message style (background color + accessible text color)
    const style = computeMessageStyle(classified);

    // Step 5: Build metadata
    const metadata = {
      classifiedType: classified.type,
      ...(classified.city && { city: classified.city }),
      ...(classified.temperature !== undefined && { temperature: classified.temperature }),
      ...(classified.decimalDigits !== undefined && { decimalDigits: classified.decimalDigits }),
      ...(classified.urgencyScore !== undefined && { urgencyScore: classified.urgencyScore }),
    };

    // Step 6: Persist to chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        userId: req.user.id,
      });
    }

    if (!session) {
      session = new ChatSession({
        userId: req.user.id,
        title: message.trim().substring(0, 50),
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message.trim(),
    });

    // Add assistant response with styling
    session.messages.push({
      role: 'assistant',
      content: philosopherResponse,
      backgroundColor: style.backgroundColor,
      textColor: style.textColor,
      rule: style.rule,
      metadata,
    });

    await session.save();

    // Step 7: Return response
    res.json({
      success: true,
      data: {
        sessionId: session._id,
        response: philosopherResponse,
        backgroundColor: style.backgroundColor,
        textColor: style.textColor,
        rule: style.rule,
        metadata,
      },
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your message.',
    });
  }
});

/**
 * GET /api/chat/sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat sessions.',
    });
  }
});

/**
 * GET /api/chat/sessions/:id
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found.',
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat session.',
    });
  }
});

module.exports = router;
