import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: 'Slime Docs',
      customCss: ['./src/styles/global.css', './src/styles/theme.css'],
      components: {
        Hero: './src/components/SlimeHero.astro',
        Pagination: './src/components/SlimePagination.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
          ],
        },
        {
          label: 'Core Features',
          items: [
            { label: 'Rules', link: '/rules/' },
            { label: 'Dynamic Values', link: '/dynamic-values/' },
            { label: 'Images', link: '/images/' },
            { label: 'Post-Actions', link: '/post-actions/' },
            { label: 'Floating Action Button', link: '/floating-action-button/' },
            { label: 'Collections', link: '/collections/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Privacy and Storage', link: '/privacy-and-storage/' },
            { label: 'Troubleshooting', link: '/troubleshooting/' },
          ],
        },
      ],
    }),
  ],
});
