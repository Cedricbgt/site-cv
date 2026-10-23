import { defineConfig } from 'vite';

// En CI, BASE_PATH vaut "/<nom-du-repo>/" pour GitHub Pages (voir .github/workflows/deploy.yml).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
});
