import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // ...
  integrations: [],

  site: 'https://cjbohlman.github.io',

  vite: {
    plugins: [tailwindcss()],
  },
});