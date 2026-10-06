import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const projectEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || projectEnv.VITE_API_PROXY_TARGET || 'http://localhost:5185';
  const recaptchaSiteKey = process.env.VITE_RECAPTCHA_SITE_KEY || projectEnv.VITE_RECAPTCHA_SITE_KEY || projectEnv.RECAPTCHA_SITE_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(recaptchaSiteKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
