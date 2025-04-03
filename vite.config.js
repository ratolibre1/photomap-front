import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // URL del backend según el ambiente
  // En desarrollo se usa localhost por defecto, en producción DEBE estar en .env
  const backendUrl = mode === 'production'
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:4567'

  // Validar que tenemos la URL en producción
  if (mode === 'production' && !backendUrl) {
    console.warn('⚠️ ADVERTENCIA: No se encontró VITE_API_URL en variables de entorno para producción')
  }

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
