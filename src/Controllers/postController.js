const postModel = require("../../data models/post");
const Sequelize = require("sequelize");

module.exports.getPosts = async (req, res) => {
  const page = 1; // Padrão para a primeira página se não fornecido
  const limit = 10; // Número de itens por página

  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await postModel.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      posts: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPostsAdmin = async (req, res) => {
  try {
    const posts = await postModel.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPost = async (req, res) => {
  const { title, body, active } = req.body;
  try {
    const post = await postModel.create({ title, body, active });
    res.status(201).json({ message: "Post criado com sucesso", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "O id deve ser informado" });
  }

  // Verificando se o post existe
  const post = await postModel.findByPk(id);
  if (!post) {
    return res.status(404).json({ message: "Post não encontrado" });
  }

  try {
    await postModel.destroy({ where: { id } });
    res.status(200).json({ message: "Post deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, body, active } = req.body;

  // Construir o objeto de atualização dinamicamente
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (body !== undefined) updateData.body = body;
  if (active !== undefined) updateData.active = active;

  try {
    // Verificar se o post existe
    const post = await postModel.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Atualizar o post apenas com os campos fornecidos
    await post.update(updateData);
    res.status(200).json({ message: "Post atualizado com sucesso", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await postModel.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPostsByKeyword = async (req, res) => {
  const { query } = req.body; // Corrigido para acessar diretamente o campo `query`
  try {
    const posts = await postModel.findAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${query}%` } },
          { body: { [Sequelize.Op.like]: `%${query}%` } },
        ],
      },
    });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
