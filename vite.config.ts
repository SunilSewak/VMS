import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-router-dom': path.resolve(__dirname, './src/lib/shims/react-router-dom.tsx'),
      '@tanstack/react-query': path.resolve(__dirname, './src/lib/shims/react-query.tsx'),
      'react-hook-form': path.resolve(__dirname, './src/lib/shims/react-hook-form.tsx'),
      'zod': path.resolve(__dirname, './src/lib/shims/zod.ts')
    }
  }
});
