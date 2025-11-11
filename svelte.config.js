// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),

    paths: {
      base: dev ? '' : '/bhajanvani'
    },

    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores'
    }
  }
};