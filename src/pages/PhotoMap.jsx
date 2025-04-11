import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Toast, ToastContainer } from 'react-bootstrap';
import MapComponent from '../components/map/MapComponent';
import SearchFilters from '../components/gallery/SearchFilters';
import { photoService } from '../services/api';
import { useTranslation } from 'react-i18next';
import './PhotoMap.css'; // Importar estilos para skeletons
import CreateMapModal from '../components/map/CreateMapModal';
import { Link } from 'react-router-dom';

const PhotoMap = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    country: '',
    region: '',
    county: '',
    city: '',
    labels: [],
    isPublic: true // Por defecto mostrar solo fotos públicas
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateMapModal, setShowCreateMapModal] = useState(false);
  const [toast, setToast] = useState(null);
  const { t } = useTranslation(['map', 'common']);

  useEffect(() => {
    fetchPhotos();
  }, [filters]);

  const fetchPhotos = async () => {
    try {
      // Solo mostrar loading en la carga inicial
      if (initialLoad) {
        setLoading(true);
      }

      // Crear objeto base con filtros
      const queryParams = {};

      // Añadir filtros de fecha correctamente
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      // Agregar IDs de etiquetas si existen
      if (filters.labels && filters.labels.length > 0) {
        queryParams.labels = filters.labels.map(label => label._id || label.id);
      }

      // Agregar filtros de ubicación - asegurarse de que se envíen correctamente
      if (filters.country) queryParams.countryId = filters.country;
      if (filters.region) queryParams.regionId = filters.region;
      if (filters.county) queryParams.countyId = filters.county;
      if (filters.city) queryParams.cityId = filters.city;

      // Agregar filtro de visibilidad pública
      if (filters.isPublic !== undefined) {
        queryParams.isPublic = filters.isPublic;
      }

      queryParams.limit = 1000;

      console.log('🔍 Filtros de búsqueda enviados:', queryParams);
      console.log('📊 Estado actual de filters:', filters);

      const response = await photoService.getPhotos(queryParams);
      setPhotos(response.data.data.photos || []);
    } catch (error) {
      console.error('Error al cargar fotos para el mapa:', error);
      setError('No pudimos cargar el mapa. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleFilterChange = (field, value) => {
    console.log(`💡 Actualizando filtro: ${field} = `, value);

    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value
    }));

    // Mostrar el estado actualizado (aunque esto capturará el estado anterior)
    console.log('💽 Estado de filtros después de actualizar:', field, value);
  };

  // Función para manejar la apertura del modal de creación de mapas
  const handleOpenCreateMapModal = () => {
    setShowCreateMapModal(true);
  };

  // Función para manejar el éxito al crear un mapa
  const handleMapCreated = (map) => {
    console.log('Mapa creado con éxito:', map);

    // Mostrar toast de confirmación
    setToast({
      title: t('map:create_map.success'),
      message: t('map:create_map.success_message'),
      variant: 'success'
    });

    // Ocultar el toast después de 5 segundos
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <Container fluid className="py-4">
      <h1>{t('title')}</h1>
      <p className="text-muted">{t('description')}</p>

      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="py-3">
              {loading ? (
                <div>
                  <h6 className="mb-3 skeleton-title"></h6>
                  <Row>
                    {/* COLUMNA IZQUIERDA: Skeletons de ubicación y etiquetas */}
                    <Col md={5} lg={4}>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="skeleton-input"></div>
                      </div>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="skeleton-input"></div>
                      </div>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="skeleton-input"></div>
                      </div>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="skeleton-input"></div>
                      </div>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="skeleton-tags">
                          <div className="d-flex flex-wrap mt-2">
                            <div className="skeleton-tag skeleton-tag-small"></div>
                            <div className="skeleton-tag skeleton-tag-medium"></div>
                            <div className="skeleton-tag skeleton-tag-large"></div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* COLUMNA DERECHA: Skeleton de calendario */}
                    <Col md={7} lg={8}>
                      <div className="mb-3">
                        <div className="skeleton-label mb-2"></div>
                        <div className="d-flex mb-2">
                          <div className="skeleton-input me-2"></div>
                          <div className="skeleton-input"></div>
                        </div>
                        <div className="skeleton-calendar"></div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <SearchFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  showCreateMapButton={true}
                  onOpenCreateMapModal={handleOpenCreateMapModal}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : loading ? (
            <div className="skeleton-map">
              <div className="skeleton-map-overlay">
                <i className="bi bi-map"></i>
                <p>{t('common:loading.map')}</p>
              </div>
            </div>
          ) : (
            <MapComponent
              photos={photos}
              loading={loading}
            />
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear mapa personalizado */}
      <CreateMapModal
        show={showCreateMapModal}
        onHide={() => setShowCreateMapModal(false)}
        filters={filters}
        onSuccess={handleMapCreated}
      />

      {/* Toast para mostrar mensajes de confirmación */}
      <ToastContainer position="bottom-end" className="p-3">
        {toast && (
          <Toast
            onClose={() => setToast(null)}
            show={true}
            delay={5000}
            autohide
            bg={toast.variant || 'success'}
            className="text-white"
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body>
              {toast.message}
              <div className="mt-2">
                <Link to="/my-maps" className="btn btn-sm btn-light">
                  <i className="bi bi-arrow-right me-1"></i>
                  {t('common:mymaps.view_all')}
                </Link>
              </div>
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </Container>
  );
};

export default PhotoMap; 