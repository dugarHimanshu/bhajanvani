import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

export default {
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    paths: {
      base: dev ? '' : '/bhajanvani'
    },
    prerender: {
      handleHttpError: 'ignore',
      handleMissingId: 'ignore',
      entries: [] // ✅ Do NOT prerender anything
    }
  }
};