const express = require('express');
const router = express.Router();

const authMiddleware = require('../Middlewares/authMiddleware');
const commentController = require('../Controllers/commentController');
const commentMiddleware = require('../Middlewares/commentMiddleware');

router.post(
  '/comment',
  authMiddleware.authToken,
  commentMiddleware.ensureCommentData,
  commentController.createComment,
);

router.get('/comment', commentController.getPostCommentsById);

router.delete(
  '/comment/:id',
  authMiddleware.authToken,
  commentMiddleware.verifyCommentId,
  commentController.deleteComment,
);

module.exports = router;
