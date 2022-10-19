const lodash = require('lodash/core');

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const fn = (acc, blog) => acc + blog.likes;
  return blogs.length === 0 ? 0 : blogs.reduce(fn, 0);
};

const favoriteBlog = (blogs) => {
  let favorite = blogs[0];
  blogs.forEach((blog) => {
    if (blog.likes > favorite.likes) {
      favorite = blog;
    }
  });
  return blogs.length === 0 ? {} : {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  const authors = lodash.reduce(blogs, (acc, value) => {
    if (acc.length === 0) {
      acc.push({
        author: value.author,
        blogs: 1,
      });
    }
    acc.forEach((auth) => {
      if (auth.author === value.author) {
        // eslint-disable-next-line no-param-reassign
        auth.blogs += 1;
      } else {
        acc.push({
          author: value.author,
          blogs: 1,
        });
      }
    });
    return acc;
  }, []);

  let author = authors[0];
  authors.forEach((auth) => {
    if (auth.blogs > author.blogs) {
      author = auth;
    }
  });
  return author;
};

const mostLikes = (blogs) => {
  const authors = lodash.reduce(blogs, (acc, value) => {
    if (acc.length === 0) {
      acc.push({
        author: value.author,
        likes: value.likes,
      });
    }
    acc.forEach((auth) => {
      if (auth.author === value.author) {
        // eslint-disable-next-line no-param-reassign
        auth.likes += value.likes;
      } else {
        acc.push({
          author: value.author,
          likes: value.likes,
        });
      }
    });
    return acc;
  }, []);

  let author = authors[0];
  authors.forEach((auth) => {
    if (auth.likes > author.likes) {
      author = auth;
    }
  });
  return author;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
