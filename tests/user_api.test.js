const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

const users = [
  {
    username: 'thisIsANewUsername',
    password: 'thisisasupersecurepassword',
    name: 'this is my name',
  },
  {
    username: 'username2',
    password: 'password2',
    name: 'user 2',
  },
];

beforeEach(async () => {
  await User.deleteMany({});

  const userObjects = users.map((user) => new User(user));
  const promiseArray = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
});

describe('addition of a new user', () => {
  test('invalid users are not created and returns suitable status code and error message', async () => {
    let newUser = {
      username: 'testusername',
      password: '12',
      name: 'test name',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    newUser = {
      username: 'aa',
      password: 'securepassword',
      name: 'test name 2',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    newUser = {
      password: 'securepassword',
      name: 'test name 3',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    newUser = {
      username: 'testusername',
      name: 'test name 4',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    newUser = {
      username: 'thisIsANewUsername',
      password: 'securepassword',
      name: 'test name 5',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
