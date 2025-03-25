import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

console.log('🌎 Iniciando configuración de i18n...');

// Limpiar cualquier configuración previa de idioma
localStorage.removeItem('i18nextLng');

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es-CL',
    supportedLngs: ['es-CL', 'en'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'photos', 'map', 'categories', 'upload', 'labels'],
    debug: true, // Activar logs de debug

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Forzar español chileno
    lng: 'es-CL',
  }).then(() => {
    // Asegurar que el idioma sea español chileno
    i18n.changeLanguage('es-CL');

    console.log('✅ i18n inicializado correctamente');
    console.log('🗣️ Idioma actual:', i18n.language);
    console.log('📦 Namespaces cargados:', i18n.options.ns);
    console.log('🌍 Idiomas soportados:', i18n.options.supportedLngs);
  }).catch(error => {
    console.error('❌ Error inicializando i18n:', error);
  });

export default i18n; 