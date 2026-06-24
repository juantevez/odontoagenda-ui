import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rewriteTo = (prefix: string) => (path: string) =>
  path.replace(new RegExp(`^${prefix}`), '/api/v1');

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/iam': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: rewriteTo('/api/iam'),
      },
      '/api/patient': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: rewriteTo('/api/patient'),
      },
      '/api/professional': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: rewriteTo('/api/professional'),
      },
      '/api/scheduling': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: rewriteTo('/api/scheduling'),
      },
      '/api/coverage': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        rewrite: rewriteTo('/api/coverage'),
      },
      '/api/billing': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        rewrite: rewriteTo('/api/billing'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
