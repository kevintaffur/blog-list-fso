const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.blogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);

test('all blog posts are returned', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.blogs.length);
});

test('blog has an unique identifier property named id', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body[0].id).toBeDefined();
});

test('a valid blog post can be added', async () => {
  const newBlog = {
    title: 'This is a test',
    author: 'Kevin T.',
    url: 'http://example.com/example.html',
    likes: 5,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await helper.blogsInDB();
  const titles = response.map((r) => r.title);

  expect(response).toHaveLength(helper.blogs.length + 1);
  expect(titles).toContain('This is a test');
});

afterAll(() => {
  mongoose.connection.close();
});
