const postModel = require('../../data models/post');
const Sequelize = require('sequelize');
const usersModel = require('../../data models/users');
const {
  getPostCommentsById,
  getPostCommentsCountById,
} = require('../Models/commentsModels');
const { getUserByToken } = require('../Models/userModels');
const {
  getUserReactionByIdAndType,
  getAllReactionsCount,
} = require('../Models/reactionsModels');

module.exports.getPosts = async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;

  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await postModel.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: usersModel,
          attributes: ['name'], // Altere para o atributo correto que contém o nome do usuário
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    const postsWithComments = await Promise.all(
      rows.map(async (post) => {
        const totalComments = await getPostCommentsCountById(post.id);
        return {
          ...post.toJSON(), // Converte o post para um objeto simples
          totalComments, // Adiciona o total de comentários
        };
      }),
    );

    res.status(200).json({
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      posts: postsWithComments,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};

module.exports.getPostsAdmin = async (req, res) => {
  try {
    const posts = await postModel.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: usersModel,
          attributes: ['name'], // Altere para o atributo correto que contém o nome do usuário
        },
      ],
    });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};

module.exports.createPost = async (req, res) => {
  const userId = req.user.id;
  const { title, body, active } = req.body;
  try {
    const post = await postModel.create({ title, body, active, userId });
    res.status(201).json({ message: 'Post criado com sucesso', post });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: 'O id deve ser informado', success: false });
  }

  // Verificando se o post existe
  const post = await postModel.findByPk(id);
  if (!post) {
    return res
      .status(404)
      .json({ message: 'Post não encontrado', success: false });
  }

  // Verificar se o post é deste usuário
  const userId = req.user.id;
  const postUserId = post.userId;
  if (postUserId !== userId) {
    return res.status(403).json({
      message: 'Este post não pertence a este usuário',
      success: false,
    });
  }

  try {
    await postModel.destroy({ where: { id } });
    res
      .status(200)
      .json({ message: 'Post deletado com sucesso', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, body, active } = req.body;
  const userId = req.user.id;
  // Construir o objeto de atualização dinamicamente
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (body !== undefined) updateData.body = body;
  if (active !== undefined) updateData.active = active;

  try {
    // Verificar se o post existe
    const post = await postModel.findByPk(id);
    if (!post) {
      return res
        .status(404)
        .json({ message: 'Post não encontrado', success: false });
    }

    // Verificar se o post é deste usuário
    const postUserId = post.userId;
    if (postUserId !== userId) {
      return res.status(403).json({
        message: 'Este post não pertence a este usuário',
        success: false,
      });
    }

    // Atualizar o post apenas com os campos fornecidos
    await post.update(updateData);
    res
      .status(200)
      .json({ message: 'Post atualizado com sucesso', post, success: true });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};

module.exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await postModel.findByPk(id, {
      include: [
        {
          model: usersModel,
          attributes: ['name'], // Altere para o atributo correto que contém o nome do usuário
        },
      ],
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: 'Post não encontrado', success: false });
    }

    // Pegar os comentários do post
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    let userId;
    if (token) {
      const user = await getUserByToken(authHeader);
      userId = user.id;
    }
    const comments = await getPostCommentsById(id, userId);
    // Pegar a reação atual do usuário no post
    let activeReaction = null;
    if (req.headers.authorization) {
      try {
        const user = await getUserByToken(req.headers.authorization);
        const userId = user.id;
        const reaction = await getUserReactionByIdAndType(
          post.id,
          'post',
          userId,
        );
        reaction &&
          (activeReaction = {
            id: reaction.reactionTypeId,
            name: reaction.reactionType.name,
          });
      } catch (error) {
        console.error(error);
      }
    }
    const postWithReactions = {
      ...post.toJSON(),
      reactions: await getAllReactionsCount(post.id, 'post'),
    };
    res.status(200).json({
      post: postWithReactions,
      comments,
      activeReaction: activeReaction,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erro no servidor',
      success: false,
    });
  }
};

module.exports.getPostsByKeyword = async (req, res) => {
  const { query, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  console.log('Query: ' + query);
  try {
    const { count, rows } = await postModel.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${query}%` } },
          { body: { [Sequelize.Op.like]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: usersModel,
          attributes: ['name'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    const postsWithComments = await Promise.all(
      rows.map(async (post) => {
        const totalComments = await getPostCommentsCountById(post.id);
        return {
          ...post.toJSON(), // Converte o post para um objeto simples
          totalComments, // Adiciona o total de comentários
        };
      }),
    );

    res.status(200).json({
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      posts: postsWithComments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
