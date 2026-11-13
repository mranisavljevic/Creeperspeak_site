import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Mirror Firebase Hosting: unknown paths get dist/404.html with a 404 status.
const notFoundPage = {
  name: 'not-found-page',
  configurePreviewServer(server) {
    return () => {
      server.middlewares.use((req, res) => {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(readFileSync(resolve(__dirname, 'dist/404.html')));
      });
    };
  },
};

export default defineConfig({
  base: './',
  plugins: [notFoundPage],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        music: resolve(__dirname, 'music.html'),
        contact: resolve(__dirname, 'contact.html'),
        lookmom: resolve(__dirname, 'lookmom.html'),
        404: resolve(__dirname, '404.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globalSetup: ['tests/unit/global-setup.js'],
  },
});
