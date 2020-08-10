
module.exports = (eleventyConfig) => {

  // A handy markdown shortcode for blocks of markdown
  // coming from our data sources
  const markdownIt = require('markdown-it');
  const md = new markdownIt({
    html: true
  });
  eleventyConfig.addFilter('markdown', (content) => {
    return md.render(content);
  });


  eleventyConfig.addPassthroughCopy("src/images");


  // Where are my things?
  return  {
    dir: {
      input: "src",
      output: "dist",
      data: "_data"
    }
  };

};
