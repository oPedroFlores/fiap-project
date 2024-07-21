const request = require('supertest');
const app = require('../app');
const postModel = require('../../data models/post');

jest.mock('../../data models/post', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  const PostMock = dbMock.define('Post');

  const Sequelize = require('sequelize');
  const posts = [
    { id: 1, title: 'Post 1', body: 'Body 1', active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, title: 'Post 2', body: 'Body 2', active: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  PostMock.findAndCountAll = jest.fn().mockImplementation(() => {
    return { count: posts.length, rows: posts.map(post => PostMock.build(post)) };
  });

  // Mock findAll
  PostMock.findAll = jest.fn(async ({ where }) => {
    if (where && where[Sequelize.Op.or]) {
      const { [Sequelize.Op.or]: conditions } = where;
      const filteredPosts = posts.filter(post => {
        for (let condition of conditions) {
          for (let key of Object.keys(condition)) {
            if (key === 'title' && post.title.includes(condition.title[Sequelize.Op.like].replace(/%/g, ''))) {
              return true;
            }
            if (key === 'body' && post.body.includes(condition.body[Sequelize.Op.like].replace(/%/g, ''))) {
              return true;
            }
          }
        }
        return false;
      });
      return filteredPosts;
    }
    return posts;
  });

  // Mock findByPk
  PostMock.findByPk = jest.fn(async (id) => {
    return posts.find(post => post.id === id) || null;
  });

  // Mock create
  PostMock.create = jest.fn(async (post) => {
    const newPost = { id: posts.length + 1, ...post, createdAt: new Date(), updatedAt: new Date() };
    posts.push(newPost);
    return newPost;
  });

  // Mock destroy
  PostMock.destroy = jest.fn(async ({ where: { id } }) => {
    const index = posts.findIndex(post => post.id === id);
    if (index === -1) return 0;
    posts.splice(index, 1);
    return 1;
  });

  PostMock.update = jest.fn(async (updateData, { where: { id } }) => {
    const index = posts.findIndex(post => post.id === id);
    if (index === -1) throw new Error('Post não encontrado');
    const updatedPost = { ...posts[index], ...updateData, updatedAt: new Date() };
    posts.splice(index, 1, updatedPost);
    return [1];
  });

  return PostMock;
});

describe('postController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should get paginated posts', async () => {
      const page = 1;
      const limit = 10;
      const mockDate = new Date(2024, 6, 15).toISOString();
      const mockPosts = [
        { id: 1, title: 'Post 1', body: 'Body 1', active: true, createdAt: mockDate, updatedAt: mockDate },
        { id: 2, title: 'Post 2', body: 'Body 2', active: true, createdAt: mockDate, updatedAt: mockDate },
      ];

      postModel.findAndCountAll.mockResolvedValue({ count: mockPosts.length, rows: mockPosts });

      const response = await request(app).get(`/posts?page=${page}`);

      expect(response.status).toBe(200);
      expect(response.body.totalItems).toBe(mockPosts.length);
      expect(response.body.currentPage).toBe(page);
      expect(response.body.posts).toEqual(mockPosts);
      expect(postModel.findAndCountAll).toHaveBeenCalledWith({
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });
    });

    it('should handle errors when getting paginated posts', async () => {
      postModel.findAndCountAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/posts?page=1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('getPostsAdmin', () => {
    it('should get all posts for admin', async () => {
      const mockDate = new Date(2024, 6, 15).toISOString();
      const mockPosts = [
        { id: 1, title: 'Post 1', body: 'Body 1', active: true, mockDate, updatedAt: mockDate },
        { id: 2, title: 'Post 2', body: 'Body 2', active: true, mockDate, updatedAt: mockDate },
      ];
  
      postModel.findAll.mockResolvedValue(mockPosts);
  
      const response = await request(app).get('/posts/admin');
  
      expect(response.status).toBe(200);
      expect(response.body.posts).toEqual(mockPosts);
      expect(postModel.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
      });
    });

    it('should handle errors when getting all posts for admin', async () => {
      postModel.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/posts/admin');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('createPost', () => {
    it('should return 400 if title or body is missing', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ title: 'New Post' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O titulo e o corpo devem ser informados');
    });

    it('should return 400 if title or body exceeds max length', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          title: 'a'.repeat(101),
          body: 'New Body'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O titulo e o corpo devem ter no maximo 100 e 1000 caracteres respectivamente');
    });

    it('should create a new post', async () => {
      const newPost = { title: 'New Post', body: 'New Body', active: true };
      const mockDate = new Date(2024, 6, 15).toISOString();
      const mockCreatedPost = { id: 3, ...newPost, createdAt: mockDate, updatedAt: mockDate };

      postModel.create.mockResolvedValue(mockCreatedPost);

      const response = await request(app)
        .post('/posts')
        .send(newPost);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Post criado com sucesso');
      expect(response.body.post).toEqual(mockCreatedPost);
      expect(postModel.create).toHaveBeenCalledWith(newPost);
    });

    it('should handle errors when creating a new post', async () => {
      const newPost = { title: 'New Post', body: 'New Body', active: true };

      postModel.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/posts')
        .send(newPost);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('deletePost', () => {
    it('should delete an existing post', async () => {
      const postId = "1";
      const mockPost = { id: postId, title: 'Post 1', body: 'Body 1', active: true };

      postModel.findByPk.mockResolvedValue(mockPost);
      postModel.destroy.mockResolvedValue(1);

      const response = await request(app).delete(`/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post deletado com sucesso');
      expect(postModel.findByPk).toHaveBeenCalledWith(postId);
      expect(postModel.destroy).toHaveBeenCalledWith({ where: { id: postId } });
    });

    it('should handle error when deleting a non-existing post', async () => {
      const postId = 999;

      postModel.findByPk.mockResolvedValue(null);

      const response = await request(app).delete(`/posts/${postId}`);

      expect(response.status).toBe(404);

      const expectedMessage = 'Post não encontrado';
      const receivedMessage = response.body.message;
    
      expect(receivedMessage.normalize()).toBe(expectedMessage.normalize());
    });

    it('should handle errors when deleting a post', async () => {
      const postId = 1;

      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 1', body: 'Body 1', active: true });
      postModel.destroy.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete(`/posts/${postId}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const postId = 3;
      const mockDate = new Date(2024, 6, 15).toISOString();
      const updatedPostData = { title: 'Post 3', body: 'Updated Body', active: true };
      const mockUpdatedPost = { id: postId, ...updatedPostData, createdAt: mockDate, updatedAt: mockDate };
  
      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 3', body: 'Updated Body', active: true, createdAt: mockDate, updatedAt: mockDate, update: jest.fn().mockResolvedValue([1, [mockUpdatedPost]]) });

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post atualizado com sucesso');
      expect(response.body.post).toEqual(mockUpdatedPost);      
    });
  
    it('should handle error when updating a non-existing post', async () => {
      const postId = 999;
      const updatedPostData = { title: 'Updated Post', body: 'Updated Body', active: false };
  
      postModel.findByPk.mockResolvedValue(null);
  
      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);
  
      const expectedMessage = 'Post não encontrado';
      const receivedMessage = response.body.message;
      
      expect(response.status).toBe(404);
      expect(receivedMessage.normalize()).toBe(expectedMessage.normalize());
    });
  
    it('should handle errors when updating a post', async () => {
      const postId = 1;
      const updatedPostData = { title: 'Updated Post', body: 'Updated Body', active: false };
  
      postModel.findByPk.mockResolvedValue({ update: jest.fn().mockRejectedValue(new Error('Database error')) });
  
      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);
  
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });

    it('should return 400 if no data is sent to update', async () => {
      const postId = 1;

      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 1', body: 'Body 1', active: true });

      const response = await request(app).put(`/posts/${postId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Alguma informação deve ser enviada para ser atualizada');
    });

    it('should return 400 if active is not a boolean', async () => {
      const postId = 1;

      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 1', body: 'Body 1', active: true });

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send({ active: 'not-boolean' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Active deve ser um booleano');
    });
  });

  describe('getPostById', () => {
    it('should get a post by ID', async () => {
      const postId = "1";
      const mockPost = { id: postId, title: 'Post 1', body: 'Body 1', active: true };

      postModel.findByPk.mockResolvedValue(mockPost);

      const response = await request(app).get(`/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.post).toEqual(mockPost);
      expect(postModel.findByPk).toHaveBeenCalledWith(postId);
    });

    it('should handle error when getting a non-existing post by ID', async () => {
      const postId = 999; // ID que não existe

      postModel.findByPk.mockResolvedValue(null);

      const response = await request(app).get(`/posts/${postId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post não encontrado');
    });

    it('should handle errors when getting a post by ID', async () => {
      const postId = 1;

      postModel.findByPk.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get(`/posts/${postId}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});

