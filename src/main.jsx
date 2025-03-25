import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'
import './i18n'

// Esperar a que i18n se inicialice antes de renderizar la app
import i18next from 'i18next'

i18next.on('initialized', () => {
  console.log('🌍 i18n inicializado, idioma:', i18next.language);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
) 