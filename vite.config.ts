import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/analyze-rag': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/chatbot': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});