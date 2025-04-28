import axios from 'axios';

// URL completa para producción, ruta relativa para desarrollo
const API_BASE_URL = import.meta.env.PROD
  ? 'https://photomap-back.onrender.com' // URL completa en producción
  : '/api'; // Ruta relativa en desarrollo (usará el proxy de Vite)

// Configuración base para axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 segundos de timeout para todas las peticiones
});

// Interceptor para depurar el envío del token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("Enviando petición a:", config.url);

    if (token) {
      console.log("Token encontrado, añadiendo a cabeceras");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No se encontró token en localStorage");
    }

    return config;
  },
  (error) => {
    console.error("Error en interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log("Respuesta exitosa:", response.status);
    return response;
  },
  (error) => {
    console.error("Error en respuesta:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  updatePreferredLanguage: (languageCode) => api.patch('/users/language', { preferredLanguage: languageCode }),
  updateProfile: (profileData) => api.patch('/users/profile', profileData),
  changePassword: (passwordData) => api.patch('/users/password', passwordData),
  updateProfilePhoto: (photoFile) => {
    const formData = new FormData();
    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    }
    return api.patch('/users/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteProfilePhoto: () => api.delete('/users/profile-photo'),
  getCurrentUser: () => api.get('/users/me'),
};

// Servicios de fotos
export const photoService = {
  // Usamos el cliente api configurado con interceptores en lugar de axios directo
  getPhotos: async (filters = {}) => {
    console.log('🔥 getPhotos llamado con filtros:', filters);

    // Crear copia directa de los filtros para preservar los valores
    const searchBody = {
      ...filters
    };

    // Modificar solo lo que necesitamos cambiar para ubicaciones
    if (filters.country) {
      searchBody.countryId = filters.country;
      delete searchBody.country;
    }
    if (filters.region) {
      searchBody.regionId = filters.region;
      delete searchBody.region;
    }
    if (filters.county) {
      searchBody.countyId = filters.county;
      delete searchBody.county;
    }
    if (filters.city) {
      searchBody.cityId = filters.city;
      delete searchBody.city;
    }

    // Filtros básicos (mantener estas líneas)
    if (filters.searchTerm) searchBody.search = filters.searchTerm;
    if (filters.category) searchBody.categories = [filters.category];
    if (filters.isPublic !== undefined) searchBody.isPublic = filters.isPublic;

    // Filtros de fecha
    if (filters.startDate) searchBody.startDate = filters.startDate;
    if (filters.endDate) searchBody.endDate = filters.endDate;

    // Búsqueda por coordenadas
    if (filters.lat) searchBody.lat = parseFloat(filters.lat);
    if (filters.lng) searchBody.lng = parseFloat(filters.lng);
    if (filters.distance) searchBody.distance = parseFloat(filters.distance);

    // Paginación y ordenación
    if (filters.sortBy) searchBody.sortBy = filters.sortBy;
    if (filters.sortDirection) searchBody.sortDirection = filters.sortDirection;
    if (filters.page) searchBody.page = parseInt(filters.page);
    if (filters.limit) searchBody.limit = parseInt(filters.limit);

    // Logs para depuración
    console.log('📦 Objeto final enviado al servidor:', searchBody);
    return api.post('/photos/search', searchBody);
  },

  getPhoto: async (photoId) => {
    return api.get(`/photos/${photoId}`);
  },
  uploadPhoto: (formData, options = {}) => {
    // Asegurarse de no enviar Content-Type para que el navegador establezca el boundary correcto
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...options
    };

    return api.post('/photos', formData, uploadConfig);
  },

  // Nuevo método para subir múltiples fotos en una sola petición
  uploadMultiplePhotos: (files, data = {}, options = {}) => {
    const formData = new FormData();

    // Añadir cada archivo al FormData con el mismo nombre "photos"
    files.forEach(file => {
      formData.append('photos', file);
    });

    // Añadir isPublic si está definido
    if (data.isPublic !== undefined) {
      formData.append('isPublic', data.isPublic);
    }

    // Añadir etiquetas si están definidas
    if (data.labels && data.labels.length > 0) {
      const labelIds = data.labels.map(label => label._id || label.id).join(',');
      formData.append('labels', labelIds);
    }

    // Añadir título y descripción si están definidos
    if (data.title) {
      formData.append('title', data.title);
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    // Configuración para la petición
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000, // Timeout de 5 minutos para cargas grandes
      ...options
    };

    return api.post('/photos/multiple', formData, uploadConfig);
  },
  updatePhoto: (id, photoData) => {
    // La API ahora espera labels en vez de categories
    return api.patch(`/photos/${id}`, photoData);
  },
  updatePhotoTransform: (id, cssTransformData) => {
    // Extraemos el flag edited y el resto de las transformaciones
    const { edited, ...cssTransform } = cssTransformData;

    // Si edited es false, solo enviamos el flag
    if (edited === false) {
      return api.patch(`/photos/${id}/css-transform`, { edited });
    }

    // Si no, enviamos todo (incluyendo el flag y las transformaciones)
    return api.patch(`/photos/${id}/css-transform`, { cssTransform, edited });
  },
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  deleteAllPhotos: () => api.delete('/photos/delete-all-photos'),
  getPhotoNavigation: async (photoId) => {
    // Obtenemos fotos adyacentes basadas en ID
    return api.post('/photos/search', { adjacentTo: photoId });
  },
  updateBatchVisibility: (data) => api.patch('/photos/batch/visibility', data),
  updatePhotoVisibility: async (photoId, isPublic) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.patch(
        `${API_BASE_URL}/photos/${photoId}/visibility`,
        { isPublic },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error en updatePhotoVisibility:', error);
      throw error;
    }
  },
  deleteBatchPhotos: async (photoIds) => {
    return await api.delete('/photos/batch', {
      data: { photoIds }
    });
  },
  uploadPhotoZip: (zipFile, options = {}) => {
    const formData = new FormData();
    formData.append('photoZip', zipFile);

    // Añadir parámetro de visibilidad si está en options.data
    if (options.data && options.data.isPublic !== undefined) {
      formData.append('isPublic', options.data.isPublic);
    }

    // Añadir etiquetas si están en options.data
    if (options.data && options.data.labels && options.data.labels.length > 0) {
      // Convertir array de etiquetas a formato JSON string
      const labelIds = options.data.labels.map(label => label._id || label.id);
      formData.append('labels', JSON.stringify(labelIds));
    }

    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000, // Aumentar timeout a 5 minutos para archivos grandes
      ...options
    };

    return api.post('/upload/zip', formData, uploadConfig);
  },
  getPhotoCalendar: async (month, year, excludeUnknowns = false) => {
    let url = `/photos/calendar?month=${month}&year=${year}`;

    // Añadir el parámetro excludeUnknowns si es true
    if (excludeUnknowns) {
      url += '&excludeUnknowns=true';
    }

    return await api.get(url);
  },
  getPhotosOnThisDay: (params = {}) => {
    const { day, month } = params;
    let url = '/photos/on-this-day';

    // Añadir parámetros si existen
    if (day !== undefined || month !== undefined) {
      url += '?';
      const queryParams = [];

      if (month !== undefined) queryParams.push(`month=${month}`);
      if (day !== undefined) queryParams.push(`day=${day}`);

      url += queryParams.join('&');
    }

    return api.get(url);
  },
};

// Servicios de categorías
export const categoryService = {
  getCategories: () => api.get(`/categories?_t=${Date.now()}`),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Agregar al final del archivo, antes de export default api
export const statsService = {
  getUserStats: () => api.get('/stats/me')
};

export const adminService = {
  processGeocoding: (options = {}) => {
    return api.post('/admin/trigger-geocoding', options);
  }
};

// Agregar un servicio específico para ubicaciones
export const locationService = {
  getCountries: () => api.get('/location/countries'),
  getRegions: (countryId) => api.get(countryId ? `/location/regions?countryId=${countryId}` : '/location/regions'),
  getCounties: (regionId) => api.get(regionId ? `/location/counties?regionId=${regionId}` : '/location/counties'),
  getCities: (countyId) => api.get(countyId ? `/location/cities?countyId=${countyId}` : '/location/cities')
};

// Agregar el servicio de etiquetas
export const labelService = {
  getLabels: (categoryId) => {
    const url = categoryId ? `/labels?categoryId=${categoryId}` : '/labels';
    return api.get(url);
  },
  getLabel: (id) => api.get(`/labels/${id}`),
  createLabel: (labelData) => api.post('/labels', labelData),
  updateLabel: (id, labelData) => api.patch(`/labels/${id}`, labelData),
  deleteLabel: (id) => api.delete(`/labels/${id}`)
};

// Agregar este servicio para mapas públicos
export const publicMapService = {
  getPublicMap: async (shareId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public-maps/share/${shareId}`);
      return response;
    } catch (error) {
      console.error('Error al obtener el mapa público:', error);
      throw error;
    }
  },
  getPublicMapPhotos: async (shareId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public-maps/share/${shareId}/photos`, {
        params: {
          excludeUnknowns: true
        }
      });
      return response;
    } catch (error) {
      console.error('Error al obtener las fotos del mapa público:', error);
      throw error;
    }
  },
  // Nuevos métodos para obtener mapas por ID (privados)
  getMapById: async (mapId) => {
    return await api.get(`/public-maps/${mapId}`);
  },
  getMapPhotosById: async (mapId) => {
    return await api.get(`/public-maps/${mapId}/photos`, {
      params: {
        excludeUnknowns: true
      }
    });
  },
  getUserMaps: async () => {
    return await api.get('/public-maps/user');
  },
  createMap: async (mapData) => {
    return await api.post('/public-maps', mapData);
  },
  deleteMap: async (mapId) => {
    return await api.delete(`/public-maps/${mapId}`);
  },
  updateMapVisibility: async (mapId, isPublic) => {
    // Usamos el endpoint genérico de actualización pero solo enviamos el campo isPublic
    return await api.put(`/public-maps/${mapId}`, { isPublic });
  },
};

export default api;