import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, OverlayTrigger, Tooltip, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { publicMapService } from '../services/api';
import { THEMES } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import NewFeatureBadge from '../components/common/NewFeatureBadge';
import { useLabels } from '../context/LabelContext';
import { useLocation } from '../context/LocationContext';
import LabelBadge from '../components/common/LabelBadge';
import './MyMaps.css';

const MapCard = ({ map, onDelete, onShare, onVisibilityChange }) => {
  const { t } = useTranslation(['common']);
  const themeData = THEMES[map.colorPalette] || THEMES.milotic;
  const mapDate = new Date(map.createdAt);
  const { labels } = useLabels();
  const { locations } = useLocation();

  // Calcular tiempo relativo para última modificación
  const lastModified = new Date(map.updatedAt ? map.updatedAt : map.createdAt);
  const timeAgo = (() => {
    const now = new Date();
    const diffMs = now - lastModified;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('common:time.today');
    } else if (diffDays === 1) {
      return t('common:time.yesterday');
    } else if (diffDays < 7) {
      return diffDays === 1
        ? t('common:time.days_ago_one', { count: diffDays })
        : t('common:time.days_ago_other', { count: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1
        ? t('common:time.weeks_ago_one', { count: weeks })
        : t('common:time.weeks_ago_other', { count: weeks });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1
        ? t('common:time.months_ago_one', { count: months })
        : t('common:time.months_ago_other', { count: months });
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1
        ? t('common:time.years_ago_one', { count: years })
        : t('common:time.years_ago_other', { count: years });
    }
  })();

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
    <Card className="map-card h-100 shadow-sm ">
      {/* Header Section */}
      <Card.Header className="bg-light border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h5 className="map-title mb-0">{map.title}</h5>

          {/* Tema e idioma */}
          <div className="d-flex gap-2">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{themeData.name}</Tooltip>}
            >
              <div
                className="map-theme-button"
                style={{
                  backgroundColor: themeData.colors.light,
                  color: themeData.colors.primary
                }}
              >
                <span>{themeData.icon}</span>
              </div>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t(`common:language.${map.language || 'es'}`)}</Tooltip>}
            >
              <div className="map-language-button">
                <span>{map.language === 'en' ? '🇬🇧' : '🇨🇱'}</span>
              </div>
            </OverlayTrigger>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="map-date small text-muted d-flex align-items-center">
            <i className="bi bi-calendar3 me-1"></i> {formattedDate}
            {/* Badge de Nuevo */}
            {isNew && (
              <NewFeatureBadge size="sm" rotate={12} className="ms-2" />
            )}
          </div>
        </div>
      </Card.Header>

      {/* Content Section */}
      <Card.Body className="position-relative p-4">
        {/* Descripción */}
        {map.description ? (
          <div className="map-description mb-3">{map.description}</div>
        ) : (
          <div className="map-description mb-3 text-muted fst-italic">{t('common:no_description', 'Sin descripción')}</div>
        )}

        {/* Filtros Section */}
        <section className="filters-section">
          <h6 className="section-title fw-bold text-muted">
            <i className="bi bi-funnel-fill me-2"></i>
            {t('common:filters.title')}
          </h6>

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
        </section>

        {/* Estadísticas y metadata */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Badge bg="primary" pill className="stats-badge">
            <i className="bi bi-eye-fill me-1"></i>
            {map.stats?.viewCount === 1
              ? t('common:mymaps.views_one', { count: map.stats?.viewCount || 0 })
              : t('common:mymaps.views_other', { count: map.stats?.viewCount || 0 })}
          </Badge>

          <Badge bg="primary" pill className="stats-badge">
            <i className="bi bi-clock-history me-1"></i>
            {timeAgo}
          </Badge>
        </div>

        {/* Información de fotos filtradas */}
        {map.stats?.matchingPhotos !== undefined && (
          <div className="text-center mt-3 small">
            <span className="text-primary">
              <strong>{map.stats.matchingPhotos}</strong> {t('common:photo.plural')} {t('common:filters.match')}
            </span>
          </div>
        )}
      </Card.Body>

      {/* Acciones */}
      <Card.Footer className="border-top px-4 py-3" style={{ backgroundColor: 'var(--light)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="primary"
            className="view-map-btn"
            as={Link}
            to={`/private/${map._id}`}
            target="_blank"
          >
            <i className="bi bi-map-fill me-2"></i> {t('common:mymaps.view')}
          </Button>

          <div className="action-buttons">
            {/* Botón para cambiar visibilidad */}
            <Button
              variant="dark-inverse"
              className="action-btn"
              onClick={() => onVisibilityChange(map)}
              title={map.isPublic ? t('common:visibility.public') : t('common:visibility.private')}
            >
              <i className={`bi ${map.isPublic ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
            </Button>

            <Button
              variant="dark-inverse"
              className="action-btn"
              onClick={() => onShare(map)}
              title={t('common:buttons.share')}
            >
              <i className="bi bi-share"></i>
            </Button>

            {/*<Button
              variant="dark-inverse"
              className="action-btn"
              onClick={() => onEdit(map)}
              title={t('common:buttons.edit')}
            >
              <i className="bi bi-pencil"></i>
            </Button>*/}

            <Button
              variant="dark-inverse"
              className="action-btn"
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
    <Card className="map-card h-100 shadow-sm position-relative">
      {/* Header Section - mismas dimensiones que la tarjeta real */}
      <Card.Header className="bg-light border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="skeleton-text" style={{ width: '60%', height: '24px' }}></div>
          <div className="d-flex gap-2">
            <div className="skeleton-circle" style={{ width: '34px', height: '34px' }}></div>
            <div className="skeleton-circle" style={{ width: '34px', height: '34px' }}></div>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <div className="skeleton-text" style={{ width: '40%', height: '21px', marginBottom: '10px' }}></div>
        </div>
      </Card.Header>

      <Card.Body className="position-relative p-4">
        {/* Skeleton para descripción */}
        <div className="map-description mb-3">
          <div className="skeleton-text" style={{ width: '100%', height: '14px', marginBottom: '6px' }}></div>
          <div className="skeleton-text" style={{ width: '90%', height: '14px' }}></div>
        </div>

        {/* Título de filtros */}
        <h6 className="section-title fw-bold text-muted mb-3 skeleton-text" style={{ width: '120px', height: '16px' }}></h6>

        {/* Skeleton para filtros - mantener los 3 filtros como en la tarjeta real */}
        <div className="filter-boxes">
          <div className="filter-box mb-2">
            <div style={{ width: '20px', height: '26px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '70%', height: '16px' }}></div>
          </div>
          <div className="filter-box mb-2">
            <div style={{ width: '20px', height: '26px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '60%', height: '16px' }}></div>
          </div>
          <div className="filter-box mb-2">
            <div style={{ width: '20px', height: '26px', marginRight: '12px' }}></div>
            <div className="skeleton-text" style={{ width: '80%', height: '16px' }}></div>
          </div>
        </div>

        {/* Skeleton para stats - mantener la estructura visual */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="skeleton-text" style={{ width: '60px', height: '20px', borderRadius: '16px', backgroundColor: 'var(--primary)' }}></div>
          <div className="skeleton-text" style={{ width: '70px', height: '20px', borderRadius: '16px', backgroundColor: 'var(--primary)' }}></div>
        </div>
      </Card.Body>

      {/* Card Footer para acciones - mantener la estructura visual */}
      <Card.Footer className="border-top px-4 py-3" style={{ backgroundColor: 'var(--light)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="skeleton-text" style={{ width: '100px', height: '42px', borderRadius: '4px', backgroundColor: 'var(--secondary)' }}></div>
          <div className="d-flex gap-2">
            <div className="skeleton-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--dark)' }}></div>
            <div className="skeleton-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--dark)' }}></div>
            <div className="skeleton-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--dark)' }}></div>
            {/*<div className="skeleton-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--dark)' }}></div>*/}
          </div>
        </div>
      </Card.Footer>
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

  const handleVisibilityChange = async (map) => {
    try {
      // Llamar al servicio para cambiar la visibilidad
      await publicMapService.updateMapVisibility(map._id, !map.isPublic);

      // Actualizar el estado local
      setMaps(prevMaps => prevMaps.map(m =>
        m._id === map._id ? { ...m, isPublic: !m.isPublic } : m
      ));

      // Mostrar toast de confirmación
      setToast({
        message: map.isPublic
          ? t('common:mymaps.visibility_private_success')
          : t('common:mymaps.visibility_public_success'),
        title: map.title,
        type: 'success'
      });
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);

      // Mostrar toast de error
      setToast({
        message: t('common:mymaps.visibility_change_error'),
        title: map.title,
        type: 'error'
      });
    }
  };

  const handleShareMap = (map) => {
    console.log('Compartir mapa:', map);
    // Copiar directamente el link al portapapeles
    const shareUrl = `${window.location.origin}/public/${map.shareId}`;
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
          <i className="bi bi-map-fill me-2"></i> {t('common:mymaps.create')}
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
                onVisibilityChange={handleVisibilityChange}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Toast de confirmación */}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1030 }}>
        {toast && (
          <Toast
            onClose={() => setToast(null)}
            show={true}
            delay={3000}
            autohide
            bg={toast.type === 'error' ? 'danger' : 'success'}
            className="text-white"
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">
                {toast.type === 'error' ? '❌ ' + t('common:messages.error') : '✅ ' + t('common:messages.success')}
              </strong>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
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