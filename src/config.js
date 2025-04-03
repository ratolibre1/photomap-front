// Configuración global de la aplicación

// URL base de la API para llamadas directas (sin pasar por el proxy de Vite)
// En desarrollo usamos localhost, en producción la URL completa del backend
export const API_URL = import.meta.env.PROD
  ? 'https://photomap-back.onrender.com' // URL completa en producción 
  : '/api'; // Ruta relativa en desarrollo (usará el proxy de Vite)

// Configuración de carga de archivos
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB en bytes
  acceptedImageFormats: ['.jpg', '.jpeg', '.png', '.gif'],
  maxZipSize: 100 * 1024 * 1024, // 100MB para archivos ZIP
};

// Otras configuraciones globales
export const APP_VERSION = '1.0.0';
export const DEFAULT_PAGE_SIZE = 20; 