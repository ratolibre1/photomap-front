import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // URL del backend según el ambiente
  const backendUrl = mode === 'production'
    ? 'https://photomap-back.onrender.com' // URL fija para producción 
    : 'http://localhost:4567'        // URL para desarrollo

  console.log(`Usando backend URL: ${backendUrl} (modo: ${mode})`)

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
