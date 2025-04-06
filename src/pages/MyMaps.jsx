import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { publicMapService } from '../services/api';
import { THEMES } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import NewFeatureBadge from '../components/common/NewFeatureBadge';
import './MyMaps.css';

const MapCard = ({ map, onDelete, onEdit, onShare }) => {
  const { t } = useTranslation(['common']);
  const themeData = THEMES[map.colorPalette] || THEMES.magmar;
  const mapDate = new Date(map.createdAt);
  const photoCount = map.stats?.photoCount || 0;

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

        {/* Rango de fechas con formato bonito */}
        {dateRangeText && (
          <div className="date-range-display">
            <i className="bi bi-calendar-range me-2"></i>
            {dateRangeText}
          </div>
        )}

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

const MyMaps = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
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
    console.log('Eliminar mapa:', map);
    // Aquí iría la lógica para eliminar el mapa
    alert(`Función de eliminación no implementada para: ${map.title}`);
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
        <Button variant="success" size="lg" className="create-map-btn">
          <i className="bi bi-plus-lg me-2"></i> {t('common:mymaps.create')}
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">{t('common:mymaps.loading')}</span>
          </Spinner>
          <p className="mt-2">{t('common:mymaps.loading')}</p>
        </div>
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
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
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
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <i className="bi bi-clipboard-check me-2 text-success"></i>
              <strong className="me-auto">{toast.title}</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setToast(null)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MyMaps; 