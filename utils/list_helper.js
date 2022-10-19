const dummy = (blogs) => {
  return 1;
};

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

module.exports = { dummy, totalLikes, favoriteBlog };
