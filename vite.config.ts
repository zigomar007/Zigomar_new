import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/zeno-stream': {
        target: 'https://stream.zeno.fm',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zeno-stream/, ''),
        secure: true,
        headers: {
          'Origin': 'https://stream.zeno.fm'
        }
      },
      '/zeno-api': {
        target: 'https://api.zeno.fm',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zeno-api/, ''),
        secure: true,
        headers: {
          'Origin': 'https://api.zeno.fm'
        }
      }
    }
  }
});