const express = require("express");
const router = express.Router();
const postController = require("../Controllers/postController");
const postMiddleware = require("../Middlewares/postMiddleware");

router.get("/posts/admin", postController.getPostsAdmin);
router.get("/posts", postController.getPosts);

// Procurar por palavra chave
router.get("/posts/search", postController.getPostsByKeyword);

router.get(
  "/posts/:id",
  postMiddleware.verifyPostId,
  postController.getPostById
);

router.post("/posts", postMiddleware.createPost, postController.createPost);

router.put("/posts/:id", postMiddleware.updatePost, postController.updatePost);

router.delete(
  "/posts/:id",
  postMiddleware.deletePost,
  postController.deletePost
);

module.exports = router;
