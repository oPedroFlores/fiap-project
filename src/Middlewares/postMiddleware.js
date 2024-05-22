const postModel = require("../../data models/post");
module.exports.createPost = async (req, res, next) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res
      .status(400)
      .json({ message: "O titulo e o corpo devem ser informados" });
  }
  if (title.length > 100 || body.length > 1000) {
    return res.status(400).json({
      message:
        "O titulo e o corpo devem ter no maximo 100 e 1000 caracteres respectivamente",
    });
  }
  next();
};

module.exports.deletePost = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "O id deve ser informado" });
  }

  // Verificando se o post existe
  const post = await postModel.findByPk(id);
  if (!post) {
    return res.status(404).json({ message: "Post não encontrado" });
  }
  next();
};

module.exports.updatePost = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "O id deve ser informado" });
  }
  //   Verificando se o post existe
  const post = await postModel.findByPk(id);
  if (!post) {
    return res.status(404).json({ message: "Post não encontrado" });
  }
  //   Verificando se algum dado foi enviado para ser alterado
  if (
    req.body.title === undefined &&
    req.body.body === undefined &&
    req.body.active === undefined
  ) {
    return res.status(400).json({
      message: "Alguma informação deve ser enviada para ser atualizada",
    });
  }

  //   Verificando se o active foi enviado como booleano
  if (req.body.active && typeof req.body.active !== "boolean") {
    return res.status(400).json({ message: "Active deve ser um booleano" });
  }
  next();
};

module.exports.verifyPostId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "O id deve ser informado" });
  }
  next();
};
