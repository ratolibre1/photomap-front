import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Dropdown, Spinner, Alert, Container, Pagination, Badge, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { photoService, categoryService } from '../services/api';
import { API_URL } from '../config';
import { useLabels } from '../context/LabelContext';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/gallery/SearchBar';

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
  const [categories, setCategories] = useState([]);

  // Añadir este hook para acceder al contexto de etiquetas
  const { refreshData: refreshLabels } = useLabels();

  const { t } = useTranslation(['photos', 'common']);

  // Mover fetchPhotos fuera del useEffect para que sea accesible globalmente
  const fetchPhotos = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Preparar filtros base (no relacionados con ubicación)
      const searchFilters = {
        searchTerm,
        page: page,
        limit: pageSize,
        sortDirection: sortDirection,
        category: selectedTag,
        sortBy: sortBy,
      };

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
      setError(t('photos:gallery.load_error'));
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

  // Función para obtener una ubicación legible
  const getLocationName = (hasValidCoordinates, location) => {
    if (!hasValidCoordinates) {
      return t('photos:detail.unknown_location');
    }
    return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
  };

  // Nueva función para obtener la fecha formateada
  const getFormattedDate = (hasValidTimestamp, timestamp) => {
    if (!hasValidTimestamp) {
      return t('photos:detail.unknown_date');
    }
    return new Date(timestamp).toLocaleDateString();
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
      alert(t('photos:gallery.visibility_error'));
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
      alert(t('photos:gallery.batch_visibility_error'));
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
      setToastMessage(
        t('photos:gallery.delete_success', { count: selectedPhotos.length })
      );
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
      setToastMessage(t('photos:gallery.delete_error'));
      setShowToast(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t('photos:gallery.title')}</h1>

        <div className="d-flex align-items-center">
          <Button
            variant={selectMode ? 'outline-primary' : 'outline-secondary'}
            size="sm"
            className="me-2"
            onClick={toggleSelectMode}
          >
            <i className="bi bi-check-square me-1"></i>
            {selectMode ? t('photos:gallery.cancel_selection') : t('photos:gallery.select_multiple')}
          </Button>
        </div>
      </div>

      <div className="d-flex align-items-end justify-content-between mb-4">
        <div className="search-controls flex-grow-1 me-2">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="category-filter" style={{ minWidth: '200px' }}>
              <Form.Group>
                <Form.Label>{t('photos:gallery.category')}</Form.Label>
                <Form.Select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="">{t('photos:gallery.all_categories')}</option>
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
                <Form.Label>{t('photos:gallery.sort_by')}</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="me-2"
                  >
                    <option value="timestamp">{t('photos:gallery.sort_options.date')}</option>
                    <option value="title">{t('photos:gallery.sort_options.title')}</option>
                    <option value="location">{t('photos:gallery.sort_options.location')}</option>
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    title={t(sortDirection === 'asc' ? 'photos:gallery.sort_desc' : 'photos:gallery.sort_asc')}
                  >
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
                  </Button>
                </div>
              </Form.Group>
            </div>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-end">
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
            {t('photos:gallery.clear_filters')}
          </Button>
        </div>
      </div>

      {/* Barra de acciones por lotes - aparece cuando hay fotos seleccionadas */}
      {showBatchActions && (
        <div className="batch-actions mb-4 p-3 bg-light rounded shadow-sm">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Badge bg="primary" className="me-2">
              {t('photos:gallery.selected_photos', { count: selectedPhotos.length })}
            </Badge>

            <Button size="sm" variant="outline-secondary" onClick={selectAllPhotos}>
              {selectedPhotos.length === photos.length
                ? t('photos:gallery.deselect_all')
                : t('photos:gallery.select_all')}
            </Button>

            <Button
              size="sm"
              variant="outline-success"
              onClick={() => batchUpdateVisibility(true)}
              disabled={changingVisibility || selectedPhotos.length === 0}
            >
              <i className="bi bi-eye-fill me-1"></i>
              {t('photos:gallery.mark_public')}
            </Button>

            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => batchUpdateVisibility(false)}
              disabled={changingVisibility || selectedPhotos.length === 0}
            >
              <i className="bi bi-eye-slash-fill me-1"></i>
              {t('photos:gallery.mark_private')}
            </Button>

            {/* Nuevo botón para eliminar */}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={selectedPhotos.length === 0}
            >
              <i className="bi bi-trash me-1"></i>
              {t('photos:gallery.delete_selected')}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar fotos */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('photos:delete.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('photos:gallery.confirm_delete', { count: selectedPhotos.length })}</p>
          <p className="text-danger fw-bold">{t('photos:delete.warning')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleBatchDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                {t('photos:gallery.deleting')}
              </>
            ) : (
              t('common:buttons.delete')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common:loading.default')}</span>
          </div>
          <p className="mt-3">{t('photos:gallery.loading_photos')}</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-4">📷</div>
          <h3>{t('photos:gallery.no_photos_title')}</h3>
          <p className="text-muted">{t('photos:gallery.no_photos_description')}</p>
          <Button as={Link} to="/upload" variant="primary" className="mt-3">
            {t('photos:gallery.upload_photos')}
          </Button>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {photos.map(photo => (
            <Col key={photo._id}>
              <Card className="h-100 hover-border shadow-sm position-relative">
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
                    title={t('photos:gallery.review_needed')}
                  >
                    <i className="bi bi-pencil-fill"></i>
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
                  title={photo.isPublic ? t('photos:gallery.public_photo') : t('photos:gallery.private_photo')}
                >
                  <i className={`bi ${photo.isPublic ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                </Button>

                <Link to={`/photo/${photo._id}`} className="text-decoration-none">
                  <div className={`gallery-img-container ${determineImageBrightness(photo._id)}`}>
                    <Card.Img
                      variant="top"
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title || t('photos:detail.no_title')}
                      className="gallery-img"
                    />
                  </div>
                  <Card.Body>
                    <Card.Title
                      className="text-truncate text-center mb-3"
                      style={{ color: 'var(--bs-secondary-color)' }}
                    >
                      {photo.title || t('photos:detail.no_title')}
                    </Card.Title>

                    <div className="photo-info d-flex justify-content-between align-items-center">
                      <small className={photo.hasValidCoordinates === false ? "text-danger fw-bold text-decoration-underline" : "text-muted"}
                        title={photo.hasValidCoordinates === false ? t('photos:detail.invalid_coordinates') : ""}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {getLocationName(photo.hasValidCoordinates, photo.location)}
                      </small>
                      <small className={photo.hasValidTimestamp === false ? "text-danger fw-bold text-decoration-underline" : "text-muted"}
                        title={photo.hasValidTimestamp === false ? t('photos:detail.invalid_date') : ""}>
                        <i className="bi bi-calendar me-1"></i>
                        {getFormattedDate(photo.hasValidTimestamp, photo.timestamp)}
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
                <span className="text-secondary"
                  dangerouslySetInnerHTML={{
                    __html: t('photos:gallery.showing', {
                      start: ((currentPage - 1) * pageSize) + 1,
                      end: Math.min(currentPage * pageSize, pagination?.total || photos.length),
                      total: pagination?.total || photos.length
                    })
                  }}
                />
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
              <span className="me-2 text-secondary">{t('photos:gallery.photos_per_page')}:</span>
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
              {toastVariant === 'success' ? t('common:toast.success') : t('common:toast.error')}
            </strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Gallery; 