import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages部署时需要设置base路径
  base: process.env.NODE_ENV === 'production' ? '/uno-ai-master/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 确保资源路径正确
    assetsDir: 'assets',
  },
}) 