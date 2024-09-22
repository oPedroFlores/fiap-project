const emojis = require('../../data models/emojis');
const postModel = require('../../data models/post');
const Comment = require('../../data models/comment');
const ensureReactionData = async (req, res, next) => {
  const { postId, commentId, emoji } = req.body;
  if (postId && commentId) {
    return res.status(400).json({
      message: 'Post e comentário não podem ser passados ao mesmo tempo',
      success: false,
    });
  }
  if (!postId && !commentId) {
    return res
      .status(400)
      .json({ message: 'Post ou comentário deve ser passado', success: false });
  }
  if (!emoji) {
    return res
      .status(400)
      .json({ message: 'Emoji deve ser passado', success: false });
  }

  // Verificando se o emoji está na lista possível
  if (!emojis.map((e) => e.name.toLowerCase()).includes(emoji.toLowerCase())) {
    return res
      .status(400)
      .json({ message: 'Emoji não está na lista', success: false });
  }

  // Verificando se o post existe
  if (postId) {
    const post = await postModel.findByPk(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: 'Post não encontrado', success: false });
    }
  }

  // Verificando se o comentário existe
  if (commentId) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ message: 'Comentário não encontrado', success: false });
    }
  }

  req.body.emojiType = postId ? 'post' : 'comment';

  next();
};
module.exports = { ensureReactionData };
