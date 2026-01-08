import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { build } from 'vite';

// Plugin to copy manifest.json to dist
function copyManifest() {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      );
    },
  };
}

// Plugin to build content script as IIFE (no ES modules)
// Content scripts can't use ES modules in Chrome extensions
function buildContentScript() {
  return {
    name: 'build-content-script',
    async closeBundle() {
      await build({
        configFile: false,
        build: {
          outDir: 'dist/src',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/content/content-script.ts'),
            name: 'SlimeContentScript',
            formats: ['iife'],
            fileName: () => 'content-script.js',
          },
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
          },
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    copyManifest(),
    buildContentScript(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'src/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
