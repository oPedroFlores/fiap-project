const express = require('express');
const router = express.Router();
const postController = require('../Controllers/postController');
const postMiddleware = require('../Middlewares/postMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');

router.get('/posts/admin', postController.getPostsAdmin);
router.get('/posts', postController.getPosts);

// Procurar por palavra chave
router.get('/posts/search', postController.getPostsByKeyword);

router.get(
  '/posts/:id',
  postMiddleware.verifyPostId,
  postController.getPostById,
);

// Admin

router.post(
  '/posts',
  authMiddleware.authToken,
  authMiddleware.onlyProfessors,
  postMiddleware.createPost,
  postController.createPost,
);

router.put(
  '/posts/:id',
  authMiddleware.authToken,
  authMiddleware.onlyProfessors,
  postMiddleware.updatePost,
  postController.updatePost,
);

router.delete(
  '/posts/:id',
  authMiddleware.authToken,
  authMiddleware.onlyProfessors,
  postMiddleware.deletePost,
  postController.deletePost,
);

module.exports = router;
