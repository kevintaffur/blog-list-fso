const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const fn = (acc, blog) => acc + blog.likes;
  return blogs.length === 0 ? 0 : blogs.reduce(fn, 0);
};

module.exports = { dummy, totalLikes };
