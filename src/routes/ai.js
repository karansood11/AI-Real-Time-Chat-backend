'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const geminiService = require('../classes/GeminiService');
const userStore = require('../classes/UserStore');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    req.userId = decoded.sub || decoded.id || decoded.userId;
    req.userName = decoded.name;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/ai/suggest-reply
router.post('/suggest-reply', authMiddleware, async (req, res) => {
  if (!userStore.isPremium(req.userId)) {
    return res.status(403).json({ error: 'Premium required' });
  }

  const socketManager = req.app.get('socketManager');
  const messages = socketManager ? socketManager.getMessages() : [];

  if (messages.length === 0) {
    return res.json({ suggestion: 'Hello everyone!' });
  }

  try {
    const suggestion = await geminiService.suggestReply(messages, req.userName);
    res.json({ suggestion });
  } catch (err) {
    console.error('suggest-reply error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

module.exports = router;
