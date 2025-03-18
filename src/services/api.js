import axios from 'axios';

// Configuración base para axios
const API_URL = '/api'; // Definimos la constante API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  updatePhoto: (id, photoData) => {
    // Enviamos el objeto tal como está, ya que la API ahora acepta un array para categories
    return api.patch(`/photos/${id}`, photoData);
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
        `${API_URL}/photos/${photoId}/visibility`,
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
  uploadTakeoutZip: (zipFile, options = {}) => {
    const formData = new FormData();
    formData.append('takeoutZip', zipFile);

    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...options
    };

    return api.post('/upload/zip', formData, uploadConfig);
  }
};

// Servicios de categorías
export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Agregar al final del archivo, antes de export default api
export const statsService = {
  getSystemStats: () => api.get('/stats/system')
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

export default api;