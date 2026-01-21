import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src/client',
      '@shared': '/src/shared',
    },
  },
  server: {
    // 开发模式下不使用独立端口，使用中间件模式
    // 这样 Express 可以统一处理所有请求
    hmr: false, // 完全禁用 HMR
    watch: null, // 完全禁用文件监听
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
  },
  // 优化依赖预构建
  optimizeDeps: {
    exclude: [],
  },
});
