module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addCollection("post", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  // カテゴリごとの記事一覧を作る
  eleventyConfig.addCollection("categories", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("posts/*.md");
    const categories = {};
    posts.forEach(post => {
      const cat = post.data.category || "未分類";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(post);
    });
    return categories;
  });

  return {
    pathPrefix: "/blog/"
  };
};