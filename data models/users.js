const Sequelize = require('sequelize');
const database = require('../db');
const bcrypt = require('bcrypt');

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
    unique: true,
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
    type: Sequelize.ENUM('student', 'professor', 'admin'),
    allowNull: false,
    defaultValue: 'student',
  },
});

const initializeAdminUser = async () => {
  try {
    await User.sync();

    const adminExists = await User.findOne({
      where: { email: 'admin@gmail.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);

      await User.create({
        name: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        active: true,
      });

      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

initializeAdminUser();

module.exports = User;
