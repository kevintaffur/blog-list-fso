const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const config = require('../utils/config');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const {
    title,
    author,
    url,
    likes,
  } = request.body;
  const { token } = request;

  const decodedToken = jwt.verify(token, config.SECRET);

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user.id,
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(blog.id);
  await user.save();
  return response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const { token } = request;

  const decodedToken = jwt.verify(token, config.SECRET);

  const blog = await Blog.findById(id);

  if (!blog) {
    return response.status(404).json({
      error: 'Blog not found',
    });
  }

  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(400).json({
      error: 'This blog belongs to another user',
    });
  }

  await Blog.findByIdAndRemove(id);
  return response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params;

  const newBlog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, { new: true, runValidators: true, content: 'query' });
  response.json(updatedBlog);
});

module.exports = blogsRouter;
