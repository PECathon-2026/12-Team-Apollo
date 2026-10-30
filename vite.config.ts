import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files based on the current mode
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = env.PORT || process.env.PORT || '5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${serverPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
