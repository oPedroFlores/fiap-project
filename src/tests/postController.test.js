const request = require('supertest');
const app = require('../app');
const postModel = require('../../data models/post');

jest.mock('../../data models/post', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  const PostMock = dbMock.define('Post');
  PostMock.findAndCountAll = jest.fn().mockImplementation(() => {
    return { count: 2, rows: [PostMock.build({ id: 1 }), PostMock.build({ id: 2 })] };
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
      const mockPosts = [
        { id: 1, title: 'Post 1', body: 'Body 1', active: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, title: 'Post 2', body: 'Body 2', active: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      postModel.findAll.mockResolvedValue(mockPosts);

      const response = await request(app).get('/admin/posts');

      expect(response.status).toBe(200);
      expect(response.body.posts).toEqual(mockPosts);
      expect(postModel.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
      });
    });

    it('should handle errors when getting all posts for admin', async () => {
      postModel.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/admin/posts');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPost = { title: 'New Post', body: 'New Body', active: true };
      const mockCreatedPost = { id: 3, ...newPost, createdAt: new Date(), updatedAt: new Date() };

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
      const postId = 1;
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
      const postId = 999; // ID que não existe

      postModel.findByPk.mockResolvedValue(null);

      const response = await request(app).delete(`/posts/${postId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post não encontrado');
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
      const postId = 1;
      const updatedPostData = { title: 'Updated Post', body: 'Updated Body', active: false };
      const mockUpdatedPost = { id: postId, ...updatedPostData, createdAt: new Date(), updatedAt: new Date() };

      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 1', body: 'Body 1', active: true });
      postModel.update.mockResolvedValue([1, [mockUpdatedPost]]);

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post atualizado com sucesso');
      expect(response.body.post).toEqual(mockUpdatedPost);
      expect(postModel.update).toHaveBeenCalledWith(updatedPostData);
    });

    it('should handle error when updating a non-existing post', async () => {
      const postId = 999; // ID que não existe
      const updatedPostData = { title: 'Updated Post', body: 'Updated Body', active: false };

      postModel.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post não encontrado');
    });

    it('should handle errors when updating a post', async () => {
      const postId = 1;
      const updatedPostData = { title: 'Updated Post', body: 'Updated Body', active: false };

      postModel.findByPk.mockResolvedValue({ id: postId, title: 'Post 1', body: 'Body 1', active: true });
      postModel.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updatedPostData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('getPostById', () => {
    it('should get a post by ID', async () => {
      const postId = 1;
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

  describe('deactivatePost', () => {
    it('should deactivate an existing post', async () => {
      const postId = 1;
      const mockPost = { id: postId, title: 'Post 1', body: 'Body 1', active: true };
      const mockUpdatedPost = { ...mockPost, active: false };

      postModel.findByPk.mockResolvedValue(mockPost);
      postModel.update.mockResolvedValue([1, [mockUpdatedPost]]);

      const response = await request(app).patch(`/posts/${postId}/deactivate`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post desativado com sucesso');
      expect(response.body.post).toEqual(mockUpdatedPost);
      expect(postModel.findByPk).toHaveBeenCalledWith(postId);
      expect(postModel.update).toHaveBeenCalledWith({ active: false });
    });

    it('should handle error when deactivating a non-existing post', async () => {
      const postId = 999; // ID que não existe

      postModel.findByPk.mockResolvedValue(null);

      const response = await request(app).patch(`/posts/${postId}/deactivate`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post não encontrado');
    });

    it('should handle errors when deactivating a post', async () => {
      const postId = 1;
      const mockPost = { id: postId, title: 'Post 1', body: 'Body 1', active: true };

      postModel.findByPk.mockResolvedValue(mockPost);
      postModel.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app).patch(`/posts/${postId}/deactivate`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});
