import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许局域网访问
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        // 确保 Service Worker 不被打包
        manualChunks: undefined,
      },
    },
  },
})




