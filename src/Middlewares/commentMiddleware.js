const postModel = require('../../data models/post');
const commentModel = require('../../data models/comment');
module.exports.ensureCommentData = async (req, res, next) => {
  const { postId } = req.body;
  const body = req.body.text;
  if (!postId || !body) {
    return res
      .status(400)
      .json({ message: 'O id do post e o text devem ser informados' });
  }

  // Verificar se o post existe
  const post = await postModel.findByPk(postId);
  if (!post) {
    return res
      .status(404)
      .json({ message: 'Post não encontrado', success: false });
  }

  // Verificar se o post é ativo
  if (!post.active) {
    return res.status(400).json({ message: 'Post inativo', success: false });
  }

  // Verificar se o comentário tem mais de 400 caracteres
  if (body.length > 400) {
    return res
      .status(400)
      .json({ message: 'Comentário deve ter menos de 400 caracteres' });
  }

  next();
};

module.exports.verifyCommentId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'O id deve ser informado' });
  }

  // Verificando se comentário existe
  const comment = await commentModel.findByPk(id);
  if (!comment) {
    return res
      .status(404)
      .json({ message: 'Comentário não encontrado', success: false });
  }

  if (comment.userId !== req.user.id) {
    return res.status(403).json({
      message: 'Comentário não pertence a este usuário',
      success: false,
    });
  }

  next();
};
