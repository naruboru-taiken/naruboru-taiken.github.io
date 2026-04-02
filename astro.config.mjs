import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://naruboru-taiken.github.io',
  output: 'static',
  integrations: [
    sitemap({
      // OGP画像URLはサイトマップから除外
      filter: (page) => !page.includes('/ogp'),
    }),
  ],
});
