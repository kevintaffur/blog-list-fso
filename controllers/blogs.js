const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const {
    title,
    author,
    url,
    likes,
  } = request.body;

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
  });
  const result = await blog.save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await Blog.findByIdAndRemove(id);
  response.status(204).end();
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
