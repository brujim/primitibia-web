import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build gera arquivos estáticos em dist/ — sirva-os pela Apache (ou qualquer host).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
