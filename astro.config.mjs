// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://leni.page',
  integrations: [
    react(),
    mdx({
      shikiConfig: {
        theme: 'rose-pine-moon',
        // langs: ['c', 'rust', 'python', 'java', 'bash', 'asm', 'cpp', 'go', 'yaml', 'json', 'typescript', 'javascript'],
        wrap: false,
      },
    }),
    sitemap()
  ],

  vite: {
    build: {
        cssCodeSplit: false,
    },
    plugins: [tailwindcss()]
  },
});
