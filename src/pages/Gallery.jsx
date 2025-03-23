import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Dropdown, Spinner, Alert, Container, Pagination, Badge, Modal, Toast, ToastContainer, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { photoService, categoryService } from '../services/api';
import axios from 'axios';
import { API_URL } from '../config';
import { useLabels } from '../context/LabelContext';

// Datos de prueba como respaldo
const MOCK_PHOTOS = [
  {
    id: 1,
    title: 'Playa Las Condes',
    thumbnail: 'https://picsum.photos/id/1015/300/200',
    location: 'Las Condes, Chile',
    date: '2023-06-15',
    tags: ['playa', 'verano', 'vacaciones']
  },
  {
    id: 2,
    title: 'Parque Costanera',
    thumbnail: 'https://picsum.photos/id/1023/300/200',
    location: 'Viña del Mar, Chile',
    date: '2023-07-22',
    tags: ['parque', 'naturaleza']
  },
  {
    id: 3,
    title: 'Atardecer en Valparaíso',
    thumbnail: 'https://picsum.photos/id/1029/300/200',
    location: 'Valparaíso, Chile',
    date: '2023-08-05',
    tags: ['atardecer', 'paisaje']
  },
  {
    id: 4,
    title: 'Cerro Santa Lucía',
    thumbnail: 'https://picsum.photos/id/1036/300/200',
    location: 'Santiago, Chile',
    date: '2023-05-10',
    tags: ['cerro', 'arquitectura', 'historia']
  },
  {
    id: 5,
    title: 'Lago Villarrica',
    thumbnail: 'https://picsum.photos/id/1039/300/200',
    location: 'Pucón, Chile',
    date: '2023-09-18',
    tags: ['lago', 'naturaleza', 'sur']
  },
  {
    id: 6,
    title: 'Desierto de Atacama',
    thumbnail: 'https://picsum.photos/id/1043/300/200',
    location: 'San Pedro de Atacama, Chile',
    date: '2023-04-02',
    tags: ['desierto', 'paisaje', 'norte']
  }
];

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [pagination, setPagination] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Valor predeterminado
  const [sortDirection, setSortDirection] = useState('desc'); // desc (descendente) por defecto
  const [changingVisibility, setChangingVisibility] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [locationFilter, setLocationFilter] = useState({ country: '', region: '', city: '' });
  const [geoSearch, setGeoSearch] = useState({ lat: '', lng: '', distance: 10000 });
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'public', 'private'
  const [categories, setCategories] = useState([]);

  // Añadir este hook para acceder al contexto de etiquetas
  const { refreshData: refreshLabels } = useLabels();

  // Mover fetchPhotos fuera del useEffect para que sea accesible globalmente
  const fetchPhotos = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Preparar filtros base (no relacionados con ubicación)
      const searchFilters = {
        searchTerm,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        page: page,
        limit: pageSize,
        sortDirection: sortDirection,
        category: selectedTag,
        sortBy: sortBy,
        // Solo incluir isPublic si no es 'all'
        ...(visibilityFilter !== 'all' && {
          isPublic: visibilityFilter === 'public'
        }),
        lat: geoSearch.lat,
        lng: geoSearch.lng,
        distance: geoSearch.distance
      };

      // Agregar solo el filtro de ubicación más específico
      if (locationFilter.city) {
        searchFilters.cityId = locationFilter.city;
      } else if (locationFilter.region) {
        searchFilters.regionId = locationFilter.region;
      } else if (locationFilter.country) {
        searchFilters.countryId = locationFilter.country;
      }

      console.log('Enviando filtros:', searchFilters);
      const response = await photoService.getPhotos(searchFilters);

      console.log(`Respuesta recibida para página ${page}:`, response.data);
      // Extraer fotos y paginación
      const { photos: fetchedPhotos, pagination = null } = response.data.data;

      // Actualizar el constructor de paginación por defecto
      const paginationInfo = pagination || {
        total: fetchedPhotos?.length || 0,
        page: page,
        limit: pageSize,
        pages: 1
      };

      // Añadir estos logs en la función fetchPhotos justo después de recibir la respuesta
      console.log("Estructura completa de la respuesta:", response.data);
      console.log("Datos de paginación recibidos:", response.data.data.pagination);

      // Siempre reemplazar las fotos (paginación atómica)
      setPhotos(fetchedPhotos || []);
      setCurrentPage(page);
      setPagination(paginationInfo);
    } catch (err) {
      console.error('Error al cargar las fotos:', err.response || err);
      setError('No pudimos cargar las fotos 😕');
      if (page === 1 && photos.length === 0) {
        setPhotos(MOCK_PHOTOS); // Solo usar datos de prueba si no hay fotos
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar fotos desde el API cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPhotos(1); // Reiniciar a página 1 cuando cambian los filtros
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTag, sortBy, sortDirection, pageSize]);

  // Cargar categorías al iniciar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        console.log('Categorías cargadas:', response.data);
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    loadCategories();
  }, []);

  // Extraer categorías únicas para filtros
  const allCategories = Array.from(
    new Set(photos.flatMap(photo => photo.categories || []))
  ).sort();

  // Formatear datos para mostrar en la galería
  const displayPhotos = photos.map(photo => ({
    id: photo._id,
    title: photo.title || 'Sin título',
    description: photo.description || 'Sin descripción',
    thumbnail: photo.thumbnailUrl,
    imageUrl: photo.originalUrl,
    location: getLocationName(photo.location),
    date: photo.timestamp ? new Date(photo.timestamp) : null,
    tags: photo.categories || [],
    isPublic: photo.isPublic
  }));

  // Función para obtener una ubicación legible
  function getLocationName(location) {
    if (!location || !location.coordinates) return 'Ubicación desconocida';

    // Formato simple de coordenadas, esto podría conectarse a una API de geocodificación
    const [long, lat] = location.coordinates;
    return `${lat.toFixed(5)}, ${long.toFixed(5)}`;
  }

  // Filtrado y ordenación
  const filteredPhotos = displayPhotos
    .filter(photo => {
      if (searchTerm && !photo.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !photo.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (selectedTag && !photo.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'timestamp') {
        comparison = a.date - b.date;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'location') {
        comparison = a.location.localeCompare(b.location);
      }

      // Invertir el resultado si la dirección es descendente
      return sortDirection === 'desc' ? -comparison : comparison;
    });

  // Función para manejar errores de carga de imágenes
  const handleImageError = (photoId) => {
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
    console.log(`Error al cargar la imagen para la foto ${photoId}`);
  };

  // Función para cambiar visibilidad
  const togglePhotoVisibility = async (photoId, makePublic) => {
    try {
      setChangingVisibility(true);
      console.log(`🔄 Iniciando cambio de visibilidad de ${photoId} a ${makePublic ? 'pública' : 'privada'}`);

      // Usar la función de batch pero con un solo ID
      console.log('📤 Enviando petición a la API...');
      const response = await photoService.updateBatchVisibility({
        photoIds: [photoId],
        isPublic: makePublic
      });

      console.log('📥 Respuesta del servidor:', response);
      console.log('📥 Código de estado:', response.status);
      console.log('📥 Datos de respuesta:', response.data);

      // Actualizar la UI después del cambio exitoso
      setPhotos(prevPhotos => {
        console.log('🔄 Actualizando estado local de fotos');
        return prevPhotos.map(photo => {
          if (photo._id === photoId) {
            return { ...photo, isPublic: makePublic };
          }
          return photo;
        });
      });

      // Actualizar el contexto de etiquetas para reflejar el cambio en los contadores publicPhotoCount
      console.log('🔄 Llamando a refreshLabels para actualizar contadores...');
      await refreshLabels();
      console.log('✅ Actualización de etiquetas completada');

    } catch (err) {
      console.error('❌ Error detallado al cambiar visibilidad:', err);
      console.error('❌ Mensaje de error:', err.message);
      console.error('❌ Respuesta del servidor si existe:', err.response?.data);
      alert(`No se pudo cambiar la visibilidad de la foto. ${err.message || 'Intenta nuevamente más tarde.'}`);
    } finally {
      setChangingVisibility(false);
    }
  };

  // Agregar estas funciones para manejar selecciones y acciones en lote
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // Si estamos saliendo del modo selección, limpiar selecciones
      setSelectedPhotos([]);
      setShowBatchActions(false);
    }
  };

  const togglePhotoSelection = (photoId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }

    // Mostrar barra de acciones si hay elementos seleccionados
    if (!selectedPhotos.includes(photoId)) {
      setShowBatchActions(true);
    } else if (selectedPhotos.length === 1 && selectedPhotos.includes(photoId)) {
      setShowBatchActions(false);
    }
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.length === photos.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedPhotos([]);
      setShowBatchActions(false);
    } else {
      // Seleccionar todas
      setSelectedPhotos(photos.map(photo => photo._id));
      setShowBatchActions(true);
    }
  };

  const batchUpdateVisibility = async (makePublic) => {
    if (selectedPhotos.length === 0) return;

    try {
      setChangingVisibility(true);

      // Usar la función existente para actualizar en lote
      await photoService.updateBatchVisibility({
        photoIds: selectedPhotos,
        isPublic: makePublic
      });

      // Actualizar el estado local
      setPhotos(photos.map(photo => {
        if (selectedPhotos.includes(photo._id)) {
          return { ...photo, isPublic: makePublic };
        }
        return photo;
      }));

      // Actualizar el contexto de etiquetas para reflejar los cambios en los contadores
      await refreshLabels();

      // Limpiar selección después del cambio
      setSelectedPhotos([]);
      setSelectMode(false);
      setShowBatchActions(false);

    } catch (err) {
      console.error('Error al cambiar visibilidad en lote:', err);
      alert('Hubo un error al actualizar la visibilidad de las fotos seleccionadas');
    } finally {
      setChangingVisibility(false);
    }
  };

  // Añadir esta función para detectar el brillo de la imagen
  const determineImageBrightness = (photoId) => {
    // Por ahora simplemente alternar basado en índice par/impar para demostración
    // En producción, podrías usar canvas para analizar el brillo real
    return photos.findIndex(photo => photo._id === photoId) % 2 === 0
      ? 'light-bg'
      : 'dark-bg';
  };

  // Función para eliminar fotos en batch
  const handleBatchDelete = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      setDeleting(true);

      // Llamar al endpoint de eliminación en batch
      await photoService.deleteBatchPhotos(selectedPhotos);

      // Actualizar la UI después de la eliminación exitosa
      setPhotos(photos.filter(photo => !selectedPhotos.includes(photo._id)));
      setSelectedPhotos([]);
      setShowBatchActions(false);
      setShowDeleteModal(false);

      // Mostrar toast de éxito en lugar de alert
      setToastVariant('success');
      setToastMessage(`${selectedPhotos.length} foto${selectedPhotos.length !== 1 ? 's' : ''} eliminada${selectedPhotos.length !== 1 ? 's' : ''} correctamente.`);
      setShowToast(true);

      // Si se han eliminado todas las fotos de la página actual, volver a la página 1
      if (photos.length === selectedPhotos.length) {
        fetchPhotos(1);
      } else {
        fetchPhotos(currentPage);
      }
    } catch (err) {
      console.error('Error al eliminar fotos:', err);
      // Mostrar toast de error en lugar de alert
      setToastVariant('danger');
      setToastMessage(`No se pudieron eliminar las fotos. ${err.message || 'Intenta nuevamente más tarde.'}`);
      setShowToast(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Galería de Fotos</h1>

        <div className="d-flex align-items-center">
          <Button
            variant={selectMode ? 'outline-primary' : 'outline-secondary'}
            size="sm"
            className="me-2"
            onClick={toggleSelectMode}
          >
            <i className="bi bi-check-square me-1"></i>
            {selectMode ? 'Cancelar selección' : 'Seleccionar varias'}
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros básicos */}
      <div className="d-flex flex-wrap gap-2 mb-4 align-items-end">
        <div className="search-bar flex-grow-1 me-2" style={{ minWidth: '250px', maxWidth: '400px' }}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </Button>
              )}
            </div>
          </Form.Group>
        </div>

        <div className="category-filter" style={{ minWidth: '200px' }}>
          <Form.Group>
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        <div className="sort-filter d-flex" style={{ minWidth: '200px' }}>
          <Form.Group className="w-100">
            <Form.Label>Ordenar por</Form.Label>
            <div className="d-flex">
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="me-2"
              >
                <option value="timestamp">Fecha</option>
                <option value="title">Título</option>
                <option value="location">Ubicación</option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                title={`Ordenar ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
              >
                <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
              </Button>
            </div>
          </Form.Group>
        </div>

        <div className="ms-auto d-flex align-items-end">
          <Button
            variant="link"
            className="text-decoration-none"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? '✨ Filtros simples' : '✨ Filtros avanzados'}
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('');
              setSortBy('timestamp');
              setSortDirection('desc');
            }}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Limpiar
          </Button>
        </div>
      </div>

      {/* Filtros avanzados - versión limpia y simple */}
      {showAdvancedFilters && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h6 className="mb-3 text-muted">Filtros avanzados</h6>

            <Row className="mb-3">
              {/* Filtros de fecha */}
              <Col md={6} lg={3} className="mb-3 mb-lg-0">
                <Form.Group>
                  <Form.Label>Rango de fechas</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="date"
                        placeholder="Desde"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="date"
                        placeholder="Hasta"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>

              {/* Filtro de visibilidad */}
              <Col md={6} lg={3} className="mb-3 mb-lg-0">
                <Form.Group>
                  <Form.Label>Visibilidad</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Todas"
                      name="visibilityFilter"
                      id="visibility-all"
                      checked={visibilityFilter === 'all'}
                      onChange={() => setVisibilityFilter('all')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Públicas"
                      name="visibilityFilter"
                      id="visibility-public"
                      checked={visibilityFilter === 'public'}
                      onChange={() => setVisibilityFilter('public')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Privadas"
                      name="visibilityFilter"
                      id="visibility-private"
                      checked={visibilityFilter === 'private'}
                      onChange={() => setVisibilityFilter('private')}
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Filtros de ubicación */}
              <Col md={6} lg={3} className="mb-3 mb-lg-0">
                <Form.Group>
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="País"
                    value={locationFilter.country}
                    onChange={(e) => setLocationFilter({ ...locationFilter, country: e.target.value })}
                    className="mb-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Región"
                    value={locationFilter.region}
                    onChange={(e) => setLocationFilter({ ...locationFilter, region: e.target.value })}
                    className="mb-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Ciudad"
                    value={locationFilter.city}
                    onChange={(e) => setLocationFilter({ ...locationFilter, city: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Búsqueda por coordenadas */}
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Búsqueda por radio</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Latitud"
                    value={geoSearch.lat}
                    onChange={(e) => setGeoSearch({ ...geoSearch, lat: e.target.value })}
                    className="mb-2"
                  />
                  <Form.Control
                    type="number"
                    placeholder="Longitud"
                    value={geoSearch.lng}
                    onChange={(e) => setGeoSearch({ ...geoSearch, lng: e.target.value })}
                    className="mb-2"
                  />
                  <InputGroup>
                    <Form.Control
                      type="number"
                      placeholder="Distancia"
                      value={geoSearch.distance}
                      onChange={(e) => setGeoSearch({ ...geoSearch, distance: e.target.value })}
                    />
                    <InputGroup.Text>m</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  setLocationFilter({ country: '', region: '', city: '' });
                  setGeoSearch({ lat: '', lng: '', distance: 10000 });
                  setVisibilityFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
              <Button
                variant="primary"
                onClick={() => fetchPhotos(1)}
              >
                Aplicar filtros
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Barra de acciones por lotes - aparece cuando hay fotos seleccionadas */}
      {showBatchActions && (
        <div className="batch-actions mb-4 p-3 bg-light rounded shadow-sm">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Badge bg="primary" className="me-2">
              {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? 's' : ''} seleccionada{selectedPhotos.length !== 1 ? 's' : ''}
            </Badge>

            <Button size="sm" variant="outline-secondary" onClick={selectAllPhotos}>
              {selectedPhotos.length === photos.length ? (
                <>Deseleccionar Todas</>
              ) : (
                <>Seleccionar Todas</>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline-success"
              onClick={() => batchUpdateVisibility(true)}
              disabled={changingVisibility || selectedPhotos.length === 0}
            >
              <i className="bi bi-eye me-1"></i>
              Marcar como Públicas
            </Button>

            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => batchUpdateVisibility(false)}
              disabled={changingVisibility || selectedPhotos.length === 0}
            >
              <i className="bi bi-piggy-bank me-1"></i>
              Marcar como Privadas
            </Button>

            {/* Nuevo botón para eliminar */}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={selectedPhotos.length === 0}
            >
              <i className="bi bi-trash me-1"></i>
              Eliminar seleccionadas
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar fotos */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que quieres eliminar {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? 's' : ''}?</p>
          <p className="text-danger fw-bold">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleBatchDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                Eliminando...
              </>
            ) : (
              <>Eliminar</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando fotos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-4">📷</div>
          <h3>No hay fotos aún</h3>
          <p className="text-muted">¡Comienza a subir tus fotos para verlas aquí!</p>
          <Button as={Link} to="/upload" variant="primary" className="mt-3">
            Subir Fotos
          </Button>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {photos.map(photo => (
            <Col key={photo._id}>
              <Card className="h-100 hover-scale shadow-sm position-relative">
                {/* Checkbox de selección visible en modo selección */}
                {selectMode && (
                  <div
                    className="position-absolute top-0 start-0 m-2 z-1"
                    onClick={(e) => togglePhotoSelection(photo._id, e)}
                    style={{ zIndex: 2 }}
                  >
                    <div className={`selection-checkbox ${selectedPhotos.includes(photo._id) ? 'selected' : ''}`}>
                      {selectedPhotos.includes(photo._id) && <i className="bi bi-check"></i>}
                    </div>
                  </div>
                )}

                {/* Indicador de foto sin revisar */}
                {!photo.reviewed && (
                  <Button
                    as={Link}
                    to={`/photo/${photo._id}`}
                    className="edit-pending"
                    title="Foto sin revisar"
                    style={{
                      top: '45px'
                    }}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                )}

                {/* Botón de visibilidad original */}
                <Button
                  className="visibility-toggle"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePhotoVisibility(photo._id, !photo.isPublic);
                  }}
                  disabled={changingVisibility}
                  title={photo.isPublic ? 'Foto pública' : 'Foto privada'}
                >
                  <i className={`bi ${photo.isPublic ? 'bi-eye' : 'bi-piggy-bank'}`}></i>
                </Button>

                <Link to={`/photo/${photo._id}`} className="text-decoration-none">
                  <div className={`gallery-img-container ${determineImageBrightness(photo._id)}`}>
                    <Card.Img
                      variant="top"
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title || 'Foto'}
                      className="gallery-img"
                    />
                  </div>
                  <Card.Body>
                    <Card.Title
                      className="text-truncate text-center mb-3"
                      style={{ color: 'var(--primary)' }}
                    >
                      {photo.title || 'Sin título'}
                    </Card.Title>

                    <div className="photo-info d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {getLocationName(photo.location)}
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(photo.timestamp).toLocaleDateString()}
                      </small>
                    </div>
                  </Card.Body>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {photos.length > 0 && (
        <div className="pagination-container mt-4 py-3 px-4 bg-light rounded">
          <div className="row align-items-center">
            {/* Información de paginación */}
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <span className="text-secondary">
                  Mostrando
                  <strong className="mx-1">
                    {/* Calcular rango de fotos mostradas actualmente */}
                    {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, pagination?.total || photos.length)}
                  </strong>
                  de
                  <strong className="mx-1">
                    {pagination?.total || photos.length}
                  </strong>
                  fotos
                </span>
              </div>
            </div>

            {/* Control de paginación */}
            <div className="col-md-4 d-flex justify-content-center mb-3 mb-md-0">
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => fetchPhotos(1)}
                  disabled={currentPage === 1 || loading}
                />
                <Pagination.Prev
                  onClick={() => fetchPhotos(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                />

                {/* Números de página - versión mejorada con más números visibles */}
                {pagination && Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = pagination.pages || 1;

                    // Si hay 6 o menos páginas, mostrar todas sin ellipsis
                    if (totalPages <= 6) {
                      return true;
                    }

                    // Si hay más de 6 páginas, mostrar:
                    // - Primera página
                    // - Última página
                    // - Página actual
                    // - Al menos 3 páginas a cada lado de la actual (si existen)
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 3
                    );
                  })
                  .map((page, index, array) => {
                    // Agregar ellipsis solo si hay un salto mayor a 1 entre páginas adyacentes
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <Pagination.Ellipsis />
                          <Pagination.Item
                            active={page === currentPage}
                            onClick={() => fetchPhotos(page)}
                            disabled={loading}
                          >
                            {page}
                          </Pagination.Item>
                        </React.Fragment>
                      );
                    }
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => fetchPhotos(page)}
                        disabled={loading}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  })
                }

                <Pagination.Next
                  onClick={() => fetchPhotos(currentPage + 1)}
                  disabled={currentPage === (pagination?.pages || 1) || loading}
                />
                <Pagination.Last
                  onClick={() => fetchPhotos(pagination?.pages || 1)}
                  disabled={currentPage === (pagination?.pages || 1) || loading}
                />
              </Pagination>
            </div>

            {/* Selector de tamaño de página */}
            <div className="col-md-4 d-flex justify-content-md-end align-items-center">
              <span className="me-2 text-secondary">Fotos por página:</span>
              <Form.Select
                className="w-auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                disabled={loading}
              >
                <option value="12">12</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </div>
          </div>
        </div>
      )}

      {/* Toast para notificaciones */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
          className="text-white"
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">
              {toastVariant === 'success' ? '✅ Éxito' : '❌ Error'}
            </strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Gallery; 