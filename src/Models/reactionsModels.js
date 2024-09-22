const Reaction = require('../../data models/reaction');
const ReactionType = require('../../data models/reactionType');
const Sequelize = require('sequelize');

module.exports.getUserReactionByIdAndType = async (id, type, userId) => {
  const reaction = await Reaction.findOne({
    where: { reactableId: id, reactableType: type, userId: userId },
    include: {
      model: ReactionType,
      attributes: ['name', 'emoji'],
    },
  });
  return reaction;
};

module.exports.getAllReactionsCount = async (id, type) => {
  const reactionCounts = await Reaction.findAll({
    where: { reactableId: id, reactableType: type },
    attributes: [
      'reactionTypeId',
      [Sequelize.fn('COUNT', Sequelize.col('reactionTypeId')), 'count'],
    ],
    group: ['reactionTypeId'],
    include: [
      {
        model: ReactionType,
        attributes: ['name', 'emoji'],
      },
    ],
  });
  // Converter as instâncias em objetos simples
  const reactionsData = reactionCounts.map((reaction) =>
    reaction.get({ plain: true }),
  );

  return reactionsData;
};
