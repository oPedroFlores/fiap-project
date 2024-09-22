const Reaction = require('../../data models/reaction');
const ReactionType = require('../../data models/reactionType');

const Comment = require('../../data models/comment');
const Post = require('../../data models/post');
const { getAllReactionsCount } = require('../Models/reactionsModels');

module.exports.createReaction = async (req, res) => {
  try {
    const { emojiType, emoji } = req.body;
    const id = emojiType === 'post' ? req.body.postId : req.body.commentId;
    const userId = req.user.id;

    // Passo 1: Validar os dados recebidos
    if (!emojiType || !emoji || !id) {
      return res
        .status(400)
        .json({ message: 'Dados incompletos', success: false });
    }

    // Verificar se o emojiType é válido
    if (!['post', 'comment'].includes(emojiType)) {
      return res.status(400).json({ message: 'Tipo inválido', success: false });
    }

    let reactable;
    if (emojiType === 'post') {
      reactable = await Post.findByPk(id);
    } else {
      reactable = await Comment.findByPk(id);
    }

    if (!reactable) {
      return res
        .status(404)
        .json({ message: 'Conteúdo não encontrado', success: false });
    }

    // Obter o ID do tipo de reação com base no emoji
    const reactionType = await ReactionType.findOne({ where: { name: emoji } });
    if (!reactionType) {
      return res
        .status(400)
        .json({ message: 'Tipo de reação não encontrado', success: false });
    }

    // Verificar se já existe uma reação do usuário nesse conteúdo
    const existingReaction = await Reaction.findOne({
      where: {
        userId: userId,
        reactableType: emojiType,
        reactableId: id,
      },
    });

    if (existingReaction) {
      if (existingReaction.reactionTypeId === reactionType.id) {
        // Se for igual, remove a reação existente
        await existingReaction.destroy();

        // Após remover, obtenha a nova contagem de reações
        const newReactions = await getAllReactionsCount(id, emojiType);

        return res.status(200).json({
          message: 'Reação removida com sucesso',
          success: true,
          reactions: newReactions,
        });
      } else {
        // Se não for igual, atualiza a reação
        existingReaction.reactionTypeId = reactionType.id;
        await existingReaction.save();

        // Após atualizar, obtenha a nova contagem de reações
        const newReactions = await getAllReactionsCount(id, emojiType);

        return res.status(200).json({
          message: 'Reação atualizada com sucesso',
          success: true,
          reactions: newReactions,
        });
      }
    } else {
      // Criar uma nova reação
      await Reaction.create({
        userId: userId,
        reactionTypeId: reactionType.id,
        reactableType: emojiType,
        reactableId: id,
      });

      // Após criar, obtenha a nova contagem de reações
      const newReactions = await getAllReactionsCount(id, emojiType);

      return res.status(201).json({
        message: 'Reação criada com sucesso',
        success: true,
        reactions: newReactions,
      });
    }
  } catch (error) {
    console.error('Erro ao criar reação:', error);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', success: false });
  }
};
