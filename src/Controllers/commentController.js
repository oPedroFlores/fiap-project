const Comment = require('../../data models/comment');
const { getPostCommentsById } = require('../Models/commentsModels');
const { getUserByToken } = require('../Models/userModels');
module.exports.createComment = async (req, res) => {
  const { postId } = req.body;
  const body = req.body.text;
  const userId = req.user.id;
  try {
    const comment = await Comment.create({ postId, body, userId });
    const allComments = await getPostCommentsById(postId);
    res.status(201).json({
      message: 'Comentário criado com sucesso',
      comments: allComments,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

module.exports.getPostCommentsById = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const post = Number(req.query.post);

  if (!post) {
    return res.status(400).json({
      message: 'O id do post deve ser informado',
      success: false,
    });
  }

  const authHeader = req.headers['authorization'];

  let userId = null;
  if (authHeader) {
    const user = await getUserByToken(authHeader);
    userId = user.id;
  }

  const allComments = await getPostCommentsById(post, userId, page);

  return res.json({
    page,
    post,
    comments: allComments,
  });
};

module.exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const comment = await Comment.findByPk(id);

    await comment.destroy();
    return res.status(200).json({
      message: 'Comentário excluído com sucesso',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};
