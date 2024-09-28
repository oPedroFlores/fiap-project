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

// ADMIN

// PUT user data

router.put(
  '/admin/user/:id',
  authMiddleware.authToken,
  authMiddleware.onlyAdmins,
  userMiddleware.ensureDataToUpdateUser,
  userController.updateUsers,
);

router.get(
  '/admin/users',
  authMiddleware.authToken,
  authMiddleware.onlyAdmins,
  userController.getUsersByPage,
);

module.exports = router;
