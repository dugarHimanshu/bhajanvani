import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

export default {
  kit: {
    adapter: adapter({
      fallback: 'index.html'      // ✅ Required for GitHub Pages routing
    }),
    paths: {
      base: dev ? '' : '/bhajanvani'   // ✅ Required since repo == bhajanvani
    },
    prerender: {
      entries: ['*'],
      handleMissingId: 'warn',
      handleHttpError: 'ignore'
    }
  }
};