const Sequelize = require('sequelize');
const database = require('../db');
const emojis = require('./emojis');

const ReactionType = database.define('reactionType', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },
  emoji: {
    type: Sequelize.STRING(10),
    allowNull: false,
    unique: true,
  },
});

const initializeReactionTypes = async () => {
  try {
    await ReactionType.sync();

    await ReactionType.bulkCreate(
      emojis.map((emoji) => ({
        name: emoji.name,
        emoji: emoji.emoji,
      })),
      {
        ignoreDuplicates: true,
      },
    );

    console.log('Emojis inseridos com sucesso');
  } catch (error) {
    console.error('Erro ao inserir emojis:', error);
  }
};

initializeReactionTypes();

module.exports = ReactionType;
