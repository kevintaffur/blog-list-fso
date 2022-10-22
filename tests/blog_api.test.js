const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const blogObjects = helper.blogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe('when there is initially some blog posts saved', () => {
  test('blogs are returned as json', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    await api
      .get('/api/blogs')
      .set('Authorization', token)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  }, 100000);

  test('all blog posts are returned', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const response = await api
      .get('/api/blogs')
      .set('Authorization', token);
    expect(response.body).toHaveLength(helper.blogs.length);
  });

  test('blog has an unique identifier property named id', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const response = await api
      .get('/api/blogs')
      .set('Authorization', token);
    expect(response.body[0].id).toBeDefined();
  });
});

describe('addition of a new blog post', () => {
  test('a valid blog post can be added', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const newBlog = {
      title: 'This is a test',
      author: 'Kevin T.',
      url: 'http://example.com/example.html',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await helper.blogsInDB();
    const titles = response.map((r) => r.title);

    expect(response).toHaveLength(helper.blogs.length + 1);
    expect(titles).toContain('This is a test');
  });

  test('missing likes property from request will default to the value 0', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const newBlog = {
      title: 'This is a test',
      author: 'Kevin T.',
      url: 'http://example.com/example.html',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await helper.blogsInDB();
    const added = response.find((blog) => blog.title === newBlog.title);

    expect(added.likes).toBe(0);
  });

  test('title or url missing from request, the backend responds with 400 Bad Request', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    let newBlog = {
      author: 'Kevin T.',
      url: 'http://example.com/example.html',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    newBlog = {
      title: 'This is a test',
      author: 'Kevin T.',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('adding a blog fails if a token is not provided', async () => {
    const newBlog = {
      title: 'This is a test',
      author: 'Kevin T.',
      url: 'http://example.com/example.html',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

describe('deletion of a blog post', () => {
  test('success with status 204', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const newBlog = {
      title: 'This is a test',
      author: 'Kevin T.',
      url: 'http://example.com/example.html',
      likes: 5,
    };

    const blogAdded = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsBefore = await helper.blogsInDB();
    const titlesBefore = blogsBefore.map((blog) => blog.title);

    expect(blogsBefore).toHaveLength(helper.blogs.length + 1);
    expect(titlesBefore).toContain(newBlog.title);

    const { id } = blogAdded.body;
    const blogToDelete = await Blog.findById(id);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', token)
      .expect(204);

    const blogsAfter = await helper.blogsInDB();
    const titlesAfter = blogsAfter.map((blog) => blog.title);

    expect(blogsAfter).toHaveLength(helper.blogs.length);
    expect(titlesAfter).not.toContain(blogToDelete.title);
  });
});

describe('updating information of a blog post', () => {
  test('update likes count', async () => {
    const loggedUser = await helper.login(api);
    const token = `bearer ${loggedUser.body.token}`;

    const blogs = await helper.blogsInDB();
    const blogToUpdate = blogs[0];

    const updatedBlog = {
      ...blogToUpdate,
      likes: 5,
    };

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .send(updatedBlog)
      .set('Authorization', token)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsUpdated = await helper.blogsInDB();
    const updatedInfo = blogsUpdated[0];
    expect(updatedInfo.likes).toBe(5);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
