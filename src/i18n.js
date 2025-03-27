import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

console.log('🌎 Iniciando configuración de i18n...');

// Ya no limpiamos la configuración previa de idioma para respetar preferencias
// localStorage.removeItem('i18nextLng');

// Función para obtener el idioma preferido del usuario (si hay sesión)
const getUserPreferredLanguage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.preferredLanguage) {
        console.log(`📣 Idioma preferido del usuario: ${user.preferredLanguage}`);
        return user.preferredLanguage;
      }
    }
    return null;
  } catch (e) {
    console.error('Error al leer preferencia de idioma:', e);
    return null;
  }
};

// Verificar si hay un idioma preferido guardado
const preferredLanguage = getUserPreferredLanguage();

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'photos', 'map', 'categories', 'upload', 'labels', 'dashboard', 'admin', 'profile', 'onthisday'],
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

    // Usar idioma preferido del usuario si existe, sino español chileno
    lng: preferredLanguage || 'es'
  }).then(() => {
    // Ya no forzamos español, respetamos la configuración
    console.log('✅ i18n inicializado correctamente');
    console.log('🗣️ Idioma actual:', i18n.language);
    console.log('📦 Namespaces cargados:', i18n.options.ns);
    console.log('🌍 Idiomas soportados:', i18n.options.supportedLngs);
  }).catch(error => {
    console.error('❌ Error inicializando i18n:', error);
  });

export default i18n; 