const serverConfig = require('../serverConfig.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModels = require('../Models/userModels');
module.exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    //* Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    //* Criação do usuário
    const user = await userModels.userRegister({
      name,
      email,
      password: hashedPassword,
    });
    const { name: userName, email: userEmail, role } = user; // Desestrutura corretamente os campos

    //* Criação do token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      serverConfig.jwtSalt,
      { expiresIn: '1h' },
    );

    //* Retorna o usuário e o token
    return res.status(201).json({
      user: { name: userName, email: userEmail, role },
      token,
      success: true,
      message: 'Usário criado com sucesso',
    });
  } catch (error) {
    //* Tratamento de erros
    console.error(error);
    return res.status(500).json({
      message: 'Erro no servidor',
      success: false,
      error: error.message,
    });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModels.findUserByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Usário não encontrado', success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Senha inválida', success: false });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Desestrutura corretamente os campos
      serverConfig.jwtSalt,
      { expiresIn: '1h' },
    );
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      success: true,
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro no servidor',
      success: false,
      error: error.message,
    });
  }
};

module.exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userModels.findUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Usário não encontrado', success: false });
    }

    const updatedUser = await userModels.updateUserRole(id, role.toLowerCase());
    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: 'Erro ao alterar permissão', success: false });
    }

    return res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role },
      success: true,
      message: 'Permissão alterada com sucesso',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro no servidor',
      success: false,
      error: error.message,
    });
  }
};

module.exports.autoLogin = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userModels.findUserByEmail(email);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Desestrutura corretamente os campos
      serverConfig.jwtSalt,
      { expiresIn: '1h' },
    );
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      success: true,
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro no servidor',
      success: false,
      error: error.message,
    });
  }
};
