// comment.js
const Sequelize = require('sequelize');
const database = require('../db');
const User = require('./users');
const Post = require('./post');

const Comment = database.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  postId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    },
  },
});

// Associations
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

Comment.sync();

module.exports = Comment;
