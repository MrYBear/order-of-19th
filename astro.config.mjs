// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// @ts-ignore - Tailwind Vite plugin types
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://OrderXIX.com',
  integrations: [
    mdx(), 
    sitemap()
  ],
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
