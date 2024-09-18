const Sequelize = require('sequelize');
const database = require('../db');

const User = database.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING(100),
    allowNull: false,
    defaultValue: 'student',
  },
});

User.sync();

module.exports = User;
