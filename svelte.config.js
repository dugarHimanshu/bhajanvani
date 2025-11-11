import adapter from '@sveltejs/adapter-static';


const dev = process.argv.includes('dev');

export default {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html"   // ✅ required for dynamic routes
    }),
    paths: {
      base: dev ? '' : '/bhajanvani'   // ✅ required for GitHub Pages
    },
    prerender: {
      crawl: true,
      entries: ['*'] // ✅ generate all static routes
    }
  }
};
