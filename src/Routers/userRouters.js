const express = require('express');
const router = express.Router();
const userMiddleware = require('../Middlewares/userMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');
const userController = require('../Controllers/userController');

//* Cadastro de usuários

router.post(
  '/users/register',
  userMiddleware.ensureDataToRegister,
  userController.registerUser,
);

//* Login de usuários

router.post(
  '/users/login',
  userMiddleware.ensureDataToLogin,
  userController.loginUser,
);

//* Trocar role do usuário

router.put(
  '/users/role/:id',
  userMiddleware.ensureDataToChangeRole,
  userController.changeUserRole,
);

//* Login com jwt

router.post('/users/auth', authMiddleware.authToken, userController.autoLogin);

module.exports = router;
