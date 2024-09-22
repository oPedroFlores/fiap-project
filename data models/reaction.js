const Sequelize = require('sequelize');
const database = require('../db');
const User = require('./users');
const ReactionType = require('./reactionType');

const Reaction = database.define('reaction', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  reactionTypeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  reactableType: {
    type: Sequelize.ENUM('post', 'comment'),
    allowNull: false,
  },
  reactableId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

// Associations
User.hasMany(Reaction, { foreignKey: 'userId' });
Reaction.belongsTo(User, { foreignKey: 'userId' });

ReactionType.hasMany(Reaction, { foreignKey: 'reactionTypeId' });
Reaction.belongsTo(ReactionType, { foreignKey: 'reactionTypeId' });

// Polymorphic Association Setup
Reaction.addHook('beforeValidate', (reaction, options) => {
  if (!['post', 'comment'].includes(reaction.reactableType)) {
    throw new Error('Invalid reactableType');
  }
});

Reaction.sync();

module.exports = Reaction;
