const jwt = require('jsonwebtoken');
const serverConfig = require('../serverConfig.json');
const userModels = require('../Models/userModels');

module.exports.authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Token não fornecido', success: false });
    }

    jwt.verify(token, serverConfig.jwtSalt, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: 'Token inválido ou expirado', success: false });
      }

      req.user = user;

      next();
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro no servidor',
      success: false,
      error: error.message,
    });
  }
};
const checkUserRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await userModels.findUserById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: 'Usuário não encontrado', success: false });
      }

      // Verifica se o role do usuário está presente no array de roles permitidos
      if (roles.includes(user.role)) {
        next();
      } else {
        return res
          .status(403)
          .json({ message: 'Nível de acesso inválido', success: false });
      }
    } catch (error) {
      return res.status(500).json({
        message: 'Erro no servidor',
        success: false,
        error: error.message,
      });
    }
  };
};

module.exports.onlyProfessors = checkUserRole(['professor']);

module.exports.onlyProfessorsOrAdmins = checkUserRole(['professor', 'admin']);

module.exports.onlyAdmins = checkUserRole(['admin']);
