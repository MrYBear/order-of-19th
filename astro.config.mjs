// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
// @ts-ignore - Tailwind Vite plugin types
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://orderxix.com',
  output: 'server',  
  adapter: netlify(),
  integrations: [
    mdx(), 
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
