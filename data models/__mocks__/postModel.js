const mockDate = new Date(2024, 6, 15).toISOString();
const posts = [
    { id: 1, title: 'Post 1', body: 'Body 1', active: true, createdAt: mockDate, updatedAt: mockDate },
    { id: 2, title: 'Post 2', body: 'Body 2', active: true, createdAt: mockDate, updatedAt: mockDate },
  ];
  
  const compareDates = (a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  };

  module.exports = {
    findAndCountAll: jest.fn(async ({ limit, offset, order }) => {
      return {
        count: posts.length,
        rows: posts.slice(offset, offset + limit).sort(compareDates),
      };
    }),

    findAll: jest.fn(async ({ where }) => {
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
      }),

    findByPk: jest.fn(async (id) => {
      return posts.find(post => post.id === id) || null;
    }),

    create: jest.fn(async (post) => {
      const newPost = { id: posts.length + 1, ...post, createdAt: new Date(), updatedAt: new Date() };
      posts.push(newPost);
      return newPost;
    }),

    destroy: jest.fn(async ({ where: { id } }) => {
      const index = posts.findIndex(post => post.id === id);
      if (index === -1) return 0;
      posts.splice(index, 1);
      return 1;
    }),

    update: jest.fn(async function (data) {
      const index = posts.findIndex(post => post.id === this.id);
      if (index === -1) throw new Error('Post não encontrado');
      const updatedPost = { ...posts[index], ...data, updatedAt: new Date() };
      posts[index] = updatedPost;
      return [1, [updatedPost]];
    }),
  };