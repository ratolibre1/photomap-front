// Configuración global de la aplicación

// URL base de la API
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.photomap.example.com/api' // URL de producción (cambiar cuando esté disponible)
  : 'http://localhost:3000/api'; // URL de desarrollo

// Configuración de carga de archivos
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB en bytes
  acceptedImageFormats: ['.jpg', '.jpeg', '.png', '.gif'],
  maxZipSize: 100 * 1024 * 1024, // 100MB para archivos ZIP
};

// Otras configuraciones globales
export const APP_VERSION = '1.0.0';
export const DEFAULT_PAGE_SIZE = 20; 