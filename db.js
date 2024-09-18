const Sequelize = require('sequelize');
const config = require('./src/serverConfig.json');
console.log(
  'Creating new sequelize instance at:',
  config.database.dataBaseSchema,
);
const sequelize = new Sequelize(
  config.database.dataBaseSchema,
  config.database.username,
  config.database.password,
  config.database.options,
);

module.exports = sequelize;
