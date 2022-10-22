const jwt = require('jsonwebtoken');
const logger = require('./logger');
const config = require('./config');
const User = require('../models/user');

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:', request.path);
  logger.info('Body:', request.body);
  logger.info('------------------');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message,
    });
  }

  if (error.name === 'MongoServerError') {
    return response.status(400).json({
      error: error.message,
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: error.message,
    });
  }

  return next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  let token = '';
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7);
  } else {
    token = null;
  }

  request.token = token;
  next();
};

const userExtractor = async (request, response, next) => {
  const { token } = request;
  const decodedToken = jwt.verify(token, config.SECRET);

  const user = await User.findById(decodedToken.id);

  request.user = user;
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
