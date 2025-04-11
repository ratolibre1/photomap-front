import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, OverlayTrigger, Tooltip, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { publicMapService } from '../services/api';
import { THEMES } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import NewFeatureBadge from '../components/common/NewFeatureBadge';
import { useLabels } from '../context/LabelContext';
import { useLocation } from '../context/LocationContext';
import LabelBadge from '../components/common/LabelBadge';
import './MyMaps.css';

const MapCard = ({ map, onDelete, onEdit, onShare }) => {
  const { t } = useTranslation(['common']);
  const themeData = THEMES[map.colorPalette] || THEMES.milotic;
  const mapDate = new Date(map.createdAt);
  const photoCount = map.stats?.photoCount || 0;
  const { labels } = useLabels();
  const { locations } = useLocation();

  // Obtener nombres de ubicaciones con cadena completa
  const locationNames = (() => {
    let names = {
      city: null,
      county: null,
      region: null,
      country: null
    };

    // Si tenemos una ciudad, obtenemos toda la cadena
    if (map.filters.cityId) {
      const city = locations.cities.find(c => c._id === map.filters.cityId);
      if (city) {
        names.city = city.name;
        const county = locations.counties.find(c => c._id === city.countyId);
        if (county) {
          names.county = county.name;
          const region = locations.regions.find(r => r._id === county.regionId);
          if (region) {
            names.region = region.name;
            const country = locations.countries.find(c => c._id === region.countryId);
            if (country) {
              names.country = country.name;
            }
          }
        }
      }
    }
    // Si tenemos una provincia/county, obtenemos región y país
    else if (map.filters.countyId) {
      const county = locations.counties.find(c => c._id === map.filters.countyId);
      if (county) {
        names.county = county.name;
        const region = locations.regions.find(r => r._id === county.regionId);
        if (region) {
          names.region = region.name;
          const country = locations.countries.find(c => c._id === region.countryId);
          if (country) {
            names.country = country.name;
          }
        }
      }
    }
    // Si tenemos una región, obtenemos el país
    else if (map.filters.regionId) {
      const region = locations.regions.find(r => r._id === map.filters.regionId);
      if (region) {
        names.region = region.name;
        const country = locations.countries.find(c => c._id === region.countryId);
        if (country) {
          names.country = country.name;
        }
      }
    }
    // Si solo tenemos país
    else if (map.filters.countryId) {
      const country = locations.countries.find(c => c._id === map.filters.countryId);
      if (country) {
        names.country = country.name;
      }
    }

    return names;
  })();

  // Formatear la fecha de creación del mapa
  const formattedDate = mapDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Convertir fechas de filtro a formato legible
  const startDate = map.filters.startDate ? new Date(map.filters.startDate).toLocaleDateString() : null;
  const endDate = map.filters.endDate ? new Date(map.filters.endDate).toLocaleDateString() : null;

  // Construir texto de rango de fechas usando traducciones
  let dateRangeText = '';
  if (startDate && endDate) {
    dateRangeText = t('common:mymaps.date_range', { startDate, endDate });
  } else if (startDate) {
    dateRangeText = t('common:mymaps.date_from', { date: startDate });
  } else if (endDate) {
    dateRangeText = t('common:mymaps.date_to', { date: endDate });
  }

  // Detectar si el mapa se creó en los últimos 7 días
  const isNew = (new Date() - mapDate) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card className="map-card h-100 shadow-sm border-0">
      <Card.Body className="position-relative p-4">
        {/* Badge de Nuevo */}
        {isNew && (
          <div className="new-feature-badge">
            {t('common:badges.new')}
          </div>
        )}

        {/* Conteo de fotos */}
        <div className="photo-count-badge">
          <span className="photo-count-icon">
            <i className="bi bi-camera"></i>
          </span>
          <span className="photo-count-number">{photoCount}</span>
        </div>

        {/* Botones flotantes de tema e idioma */}
        <div className="theme-language-buttons">
          <OverlayTrigger
            placement="left"
            overlay={<Tooltip>{themeData.name}</Tooltip>}
          >
            <div
              className="theme-button"
              style={{
                backgroundColor: themeData.colors.light,
                color: themeData.colors.primary,
                border: `2px solid ${themeData.colors.primary}`
              }}
            >
              {themeData.icon}
            </div>
          </OverlayTrigger>

          <OverlayTrigger
            placement="left"
            overlay={<Tooltip>{t(`common:language.${map.language || 'es'}`)}</Tooltip>}
          >
            <div className="language-button">
              {map.language === 'en' ? '🇬🇧' : '🇨🇱'}
            </div>
          </OverlayTrigger>
        </div>

        {/* Título y fecha con nuevas clases */}
        <div className="map-title-container">
          <h5 className="map-title">{map.title}</h5>
          <div className="map-date">
            <i className="bi bi-calendar3 me-1"></i> {formattedDate}
          </div>
        </div>

        {/* Descripción */}
        {map.description && (
          <div className="map-description">{map.description}</div>
        )}

        {/* Cajitas de filtros */}
        <div className="filter-boxes mt-3">
          {/* Filtro de ubicación */}
          <div className="filter-box mb-2">
            <i className="bi bi-geo-alt text-primary me-2"></i>
            {locationNames.city ? (
              <div>
                <div className="fw-bold">{locationNames.city}</div>
                <small className="text-muted">
                  {locationNames.county && `${locationNames.county}, `}
                  {locationNames.region && `${locationNames.region}, `}
                  {locationNames.country}
                </small>
              </div>
            ) : locationNames.county ? (
              <div>
                <div className="fw-bold">{locationNames.county}</div>
                <small className="text-muted">
                  {locationNames.region && `${locationNames.region}, `}
                  {locationNames.country}
                </small>
              </div>
            ) : locationNames.region ? (
              <div>
                <div className="fw-bold">{locationNames.region}</div>
                <small className="text-muted">{locationNames.country}</small>
              </div>
            ) : locationNames.country ? (
              <div className="fw-bold">{locationNames.country}</div>
            ) : (
              <span className="text-muted">{t('common:mymaps.anywhere')}</span>
            )}
          </div>

          {/* Filtro de fechas */}
          <div className="filter-box mb-2">
            <i className="bi bi-calendar-range text-primary me-2"></i>
            {dateRangeText ? (
              <span className="fw-bold">{dateRangeText}</span>
            ) : (
              <span className="text-muted">{t('common:mymaps.any_date')}</span>
            )}
          </div>

          {/* Filtro de etiquetas */}
          <div className="filter-box">
            <i className="bi bi-tags text-primary me-2"></i>
            <div className="d-flex flex-wrap gap-1">
              {map.filters.labels && map.filters.labels.length > 0 ? (
                map.filters.labels.map(labelId => {
                  const label = labels.find(l => l._id === labelId);
                  return label ? (
                    <LabelBadge
                      key={label._id}
                      label={label}
                      showEditButton={false}
                      style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    />
                  ) : null;
                })
              ) : (
                <span className="text-muted">{t('common:mymaps.any_label')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="map-stats">
          <Badge bg="info" pill className="me-2 stats-badge">
            <i className="bi bi-eye-fill me-1"></i>
            {t('common:mymaps.views', { count: map.stats?.viewCount || 0 })}
          </Badge>

          <Badge
            bg={map.isPublic ? "success" : "secondary"}
            pill
            className="stats-badge"
          >
            <i className={`bi ${map.isPublic ? 'bi-unlock' : 'bi-lock'} me-1`}></i>
            {map.isPublic ? t('common:visibility.public') : t('common:visibility.private')}
          </Badge>
        </div>
      </Card.Body>

      {/* Acciones */}
      <Card.Footer className="bg-transparent border-0 px-4 pb-4 pt-0">
        <div className="d-flex justify-content-between align-items-center map-actions">
          <Button
            variant="primary"
            className="view-map-btn"
            as={Link}
            to={`/mapa-publico/${map.shareId}`}
            target="_blank"
          >
            <i className="bi bi-map me-2"></i> {t('common:mymaps.view')}
          </Button>

          <div className="action-buttons">
            <Button
              variant="light"
              className="action-btn share-btn"
              onClick={() => onShare(map)}
              title={t('common:buttons.share')}
            >
              <i className="bi bi-share"></i>
            </Button>

            <Button
              variant="light"
              className="action-btn edit-btn"
              onClick={() => onEdit(map)}
              title={t('common:buttons.edit')}
            >
              <i className="bi bi-pencil"></i>
            </Button>

            <Button
              variant="light"
              className="action-btn delete-btn"
              onClick={() => onDelete(map)}
              title={t('common:buttons.delete')}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

const DeleteMapModal = ({ show, onHide, onConfirm, mapTitle }) => {
  const { t } = useTranslation(['common']);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('common:mymaps.delete_map_title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('common:mymaps.delete_map_confirm')}</p>
        <p className="text-danger fw-bold">{mapTitle}</p>
        <p>{t('common:mymaps.delete_map_warning')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('common:buttons.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('common:buttons.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Componente de skeleton para la carga de mapas
const MapCardSkeleton = () => {
  return (
    <Card className="map-card h-100 shadow-sm border-0 position-relative">
      <Card.Body className="position-relative p-4">
        {/* Skeleton para badge de fotos */}
        <div className="photo-count-badge">
          <div className="photo-count-icon skeleton-bg"></div>
          <div className="skeleton-text" style={{ width: '20px', height: '16px' }}></div>
        </div>

        {/* Skeleton para tema e idioma */}
        <div className="theme-language-buttons">
          <div className="theme-button skeleton-bg"></div>
          <div className="language-button skeleton-bg"></div>
        </div>

        {/* Skeleton para título y fecha */}
        <div className="map-title-container">
          <div className="skeleton-text" style={{ width: '80%', height: '24px', marginBottom: '8px' }}></div>
          <div className="skeleton-text" style={{ width: '50%', height: '16px', marginBottom: '16px' }}></div>
        </div>

        {/* Skeleton para descripción */}
        <div className="map-description">
          <div className="skeleton-text" style={{ width: '100%', height: '14px', marginBottom: '6px' }}></div>
          <div className="skeleton-text" style={{ width: '90%', height: '14px' }}></div>
        </div>

        {/* Skeleton para filtros */}
        <div className="filter-boxes mt-3">
          <div className="filter-box mb-2">
            <div className="skeleton-circle" style={{ width: '20px', height: '20px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '70%', height: '16px' }}></div>
          </div>
          <div className="filter-box mb-2">
            <div className="skeleton-circle" style={{ width: '20px', height: '20px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '60%', height: '16px' }}></div>
          </div>
          <div className="filter-box">
            <div className="skeleton-circle" style={{ width: '20px', height: '20px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '80%', height: '16px' }}></div>
          </div>
        </div>

        {/* Skeleton para stats */}
        <div className="map-stats">
          <div className="skeleton-text" style={{ width: '60px', height: '20px', borderRadius: '16px' }}></div>
          <div className="skeleton-text" style={{ width: '70px', height: '20px', borderRadius: '16px' }}></div>
        </div>

        {/* Skeleton para botones */}
        <div className="map-actions">
          <div className="skeleton-text" style={{ width: '100px', height: '36px', borderRadius: '4px' }}></div>
          <div className="d-flex gap-2">
            <div className="skeleton-circle" style={{ width: '36px', height: '36px' }}></div>
            <div className="skeleton-circle" style={{ width: '36px', height: '36px' }}></div>
            <div className="skeleton-circle" style={{ width: '36px', height: '36px' }}></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const MyMaps = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, map: null });
  const { t } = useTranslation(['common']);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        setLoading(true);
        const response = await publicMapService.getUserMaps();
        console.log('Mapas cargados:', response.data);
        setMaps(response.data.data.maps || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los mapas:', err);
        setError(t('common:mymaps.error'));
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteMap = (map) => {
    setDeleteModal({ show: true, map });
  };

  const confirmDelete = async () => {
    const map = deleteModal.map;
    try {
      await publicMapService.deleteMap(map._id);

      // Actualizar la lista de mapas
      setMaps(prevMaps => prevMaps.filter(m => m._id !== map._id));

      // Mostrar toast de éxito
      setToast({
        message: t('common:mymaps.delete_success'),
        title: map.title,
        type: 'success'
      });
    } catch (error) {
      console.error('Error al eliminar el mapa:', error);

      // Mostrar toast de error
      setToast({
        message: t('common:mymaps.delete_error'),
        title: map.title,
        type: 'error'
      });
    } finally {
      // Cerrar el modal
      setDeleteModal({ show: false, map: null });
    }
  };

  const handleEditMap = (map) => {
    console.log('Editar mapa:', map);
    // Aquí iría la lógica para editar el mapa
    alert(`Función de edición no implementada para: ${map.title}`);
  };

  const handleShareMap = (map) => {
    console.log('Compartir mapa:', map);
    // Copiar directamente el link al portapapeles
    const shareUrl = `${window.location.origin}/mapa-publico/${map.shareId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Mostrar toast de confirmación
        setToast({
          message: t('common:mymaps.copied'),
          title: map.title
        });

        // Ocultar el toast después de 3 segundos
        setTimeout(() => {
          setToast(null);
        }, 3000);
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        alert('No se pudo copiar al portapapeles');
      });
  };

  return (
    <Container fluid className="my-maps-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t('common:mymaps.title')}</h1>
        <Button variant="primary" size="lg" className="create-map-btn">
          <i className="bi bi-plus-lg me-2"></i> {t('common:mymaps.create')}
        </Button>
      </div>

      {loading ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {[...Array(5)].map((_, index) => (
            <Col key={`skeleton-${index}`}>
              <MapCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : error ? (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      ) : maps.length === 0 ? (
        <div className="text-center my-5 py-5">
          <i className="bi bi-map display-1 text-muted"></i>
          <h3 className="mt-3">{t('common:mymaps.empty_title')}</h3>
          <p className="text-muted">{t('common:mymaps.empty_description')}</p>
          <Button variant="primary" size="lg" className="mt-3">
            <i className="bi bi-plus-lg me-2"></i> {t('common:mymaps.create_first')}
          </Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {maps.map(map => (
            <Col key={map._id}>
              <MapCard
                map={map}
                onDelete={handleDeleteMap}
                onEdit={handleEditMap}
                onShare={handleShareMap}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Toast de confirmación */}
      <ToastContainer position="bottom-end" className="p-3">
        {toast && (
          <Toast
            onClose={() => setToast(null)}
            show={true}
            delay={3000}
            autohide
            bg={toast.type === 'error' ? 'danger' : 'success'}
            className="text-white"
          >
            <Toast.Header>
              <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-circle' : 'bi-clipboard-check'} me-2`}></i>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body>
              {toast.message}
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>

      {/* Modal de confirmación de borrado */}
      <DeleteMapModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, map: null })}
        onConfirm={confirmDelete}
        mapTitle={deleteModal.map?.title}
      />
    </Container>
  );
};

export default MyMaps; 