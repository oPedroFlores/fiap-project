const Users = require("../../data models/users");
const jwt = require("jsonwebtoken");
const serverConfig = require("../serverConfig.json");

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

module.exports.getUserByToken = async (token) => {
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, serverConfig.jwtSalt);
    const user = await Users.findOne({ where: { id: decoded.id } });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.updateUser = async (id, updatedFields) => {
  return await Users.update(updatedFields, { where: { id } });
};

module.exports.getUsersByPage = async (limit, offset, page) => {
  try {
    const { count, rows } = await Users.findAndCountAll({
      limit: Number(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });
    const totalUsers = Math.ceil(count / limit);

    return {
      totalItems: count,
      totalUsers: totalUsers,
      currentPage: Number(page),
      limit: Number(limit),
      users: rows,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
