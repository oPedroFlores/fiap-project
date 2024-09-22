const Comment = require('../../data models/comment');
const User = require('../../data models/users');
const {
  getAllReactionsCount,
  getUserReactionByIdAndType,
} = require('../Models/reactionsModels');
module.exports.getPostCommentsById = async (postId, userId, page = 1) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  // Obter os comentários paginados e a contagem total
  const comments = await Comment.findAndCountAll({
    where: { postId: postId },
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset,
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
  });

  // Pegar reações dos comentários
  const commentsWithReactions = await Promise.all(
    comments.rows.map(async (comment) => {
      const reactions = await getAllReactionsCount(comment.id, 'comment');
      // Pegar atual reação deste comentário deste usuário
      let activeReaction = null;
      if (userId) {
        activeReaction = await getUserReactionByIdAndType(
          comment.id,
          'comment',
          userId,
        );
      }
      return {
        ...comment.toJSON(),
        reactions,
        activeReaction,
      };
    }),
  );

  // Retornar os comentários com reações e a contagem total
  return {
    rows: commentsWithReactions, // Comentários paginados com reações
    count: comments.count, // Contagem total de comentários
  };
};

module.exports.getPostCommentsCountById = async (postId) => {
  const comments = await Comment.findAndCountAll({
    where: { postId: postId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
  });
  return comments;
};
