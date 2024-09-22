const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/authMiddleware');
const reactionMiddleware = require('../Middlewares/reactionMiddleware');
const reactionController = require('../Controllers/reactionController');

router.post(
  '/reaction',
  authMiddleware.authToken,
  reactionMiddleware.ensureReactionData,
  reactionController.createReaction,
);

module.exports = router;
