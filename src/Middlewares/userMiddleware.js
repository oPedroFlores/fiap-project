const userModels = require("../Models/userModels");

module.exports.ensureDataToRegister = async (req, res, next) => {
  const requiredFields = ["name", "email", "password"];
  const missedFields = requiredFields.filter((field) => !req.body[field]);

  //* Verificando se este email já foi cadastrado
  const isEmailRegistered = await userModels.isEmailRegistered(req.body.email);
  if (isEmailRegistered) {
    return res.status(400).json({
      message: "Este email ja foi cadastrado",
      success: false,
    });
  }

  if (missedFields.length > 0) {
    return res.status(400).json({
      message: "Preencha todos os campos",
      success: false,
      missedFields,
    });
  }

  //* Verificar se os campos excedem o tamanho máximo
  const fieldsWithMaxLength = [
    { field: "name", maxLength: 100 },
    { field: "email", maxLength: 100 },
    { field: "password", maxLength: 36 },
  ];

  const exceededFields = fieldsWithMaxLength
    .filter(({ field, maxLength }) => req.body[field].length > maxLength)
    .map(({ field, maxLength }) => ({
      field,
      maxLength,
      actualLength: req.body[field].length,
      message: `${capitalize(
        field
      )} deve ter no máximo ${maxLength} caracteres.`,
    }));

  if (exceededFields.length > 0) {
    return res.status(400).json({
      message: "Alguns campos excederam o tamanho máximo permitido.",
      success: false,
      exceededFields,
    });
  }

  next();
};

module.exports.ensureDataToLogin = async (req, res, next) => {
  const requiredFields = ["email", "password"];
  const missedFields = requiredFields.filter((field) => !req.body[field]);
  if (missedFields.length > 0) {
    return res.status(400).json({
      message: "Preencha todos os campos",
      success: false,
      missedFields,
    });
  }
  next();
};

module.exports.ensureDataToChangeRole = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: "O id deve ser informado na URL!", success: false });
  }
  const { role } = req.body;
  if (
    !role ||
    (role.toLowerCase() !== "professor" && role.toLowerCase() !== "student")
  ) {
    return res.status(400).json({
      message: 'O role deve ser informado e deve ser "professor" ou "student"!',
      success: false,
    });
  }
  next();
};

//! Função auxiliar para capitalizar a primeira letra de uma string
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports.ensureDataToUpdateUser = async (req, res, next) => {
  const { name, email, role, password } = req.body;

  if (!name && !email && !role && !password) {
    return res.status(400).json({
      message: "Preencha pelo menos um campo para atualizar o usuário",
      success: false,
    });
  }

  const roleOptions = ["admin", "professor", "student"];
  if (role && !roleOptions.includes(role)) {
    return res.status(400).json({
      message:
        "O role deve ser informado e deve ser 'admin', 'professor' ou 'student'!",
      success: false,
    });
  }

  // Verificando se o email já existe
  if (email) {
    const isEmailRegistered = await userModels.isEmailRegistered(email);
    if (isEmailRegistered) {
      return res.status(400).json({
        message: "Este email já está cadastrado",
        success: false,
      });
    }
  }

  next();
};
