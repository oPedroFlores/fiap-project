const express = require('express');
const cors = require('cors');
const postRoutes = require('./Routers/postsRouters');
const userRoutes = require('./Routers/userRouters');
const reactionRoutes = require('./Routers/reactionRouter');
const commentRoutes = require('./Routers/commentRouter');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const sequelize = require('../db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(postRoutes);
app.use(userRoutes);
app.use(reactionRoutes);
app.use(commentRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

sequelize
  .sync()
  .then(() => {
    console.log('Server connected to database!');
  })
  .catch((err) => {
    console.log('Error connecting to database: ', err);
  });

module.exports = app;
