const Users = require('../../data models/users');

module.exports.isEmailRegistered = async (email) => {
  try {
    const user = await Users.findOne({ where: { email } });
    return user !== null;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.userRegister = async (user) => {
  const { name, email, password } = user;
  try {
    const user = await Users.create({ name, email, password });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.findUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({ where: { email } });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.findUserById = async (id) => {
  try {
    const user = await Users.findOne({ where: { id } });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.updateUserRole = async (id, role) => {
  try {
    const user = await Users.update({ role }, { where: { id } });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};
