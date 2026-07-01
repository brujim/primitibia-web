import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A API é chamada via caminho relativo /api. Em dev, o Vite proxeia /api pro VPS
// (evita CORS e mixed-content). Em produção, o mesmo é feito pelo vercel.json.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://167.148.161.150/website/backend/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
