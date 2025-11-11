import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

export default {
  kit: {
    adapter: adapter({
      fallback: 'index.html' // ✅ Needed for dynamic routes
    }),
    paths: {
      base: dev ? '' : '/bhajanvani' // ✅ Correct for GitHub Pages repo
    },
    prerender: {
      crawl: true,
      entries: ['*'],
      handleMissingId: 'warn'   // ✅ IMPORTANT: prevents dynamic-route build failures
    }
  }
};