import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { photoService } from '../services/api';
import { useTranslation } from 'react-i18next';

const OnThisDay = () => {
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState([]);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation(['onthisday', 'common']);

  // Obtener y formatear la fecha actual según el idioma
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'long'
  }).format(today);

  useEffect(() => {
    fetchPhotosOnThisDay();
  }, []);

  const fetchPhotosOnThisDay = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar el endpoint real para obtener las memorias de este día
      const response = await photoService.getPhotosOnThisDay();

      // Extraer datos de la respuesta
      const { memories } = response.data.data;
      setMemories(memories);
    } catch (error) {
      console.error('Error al cargar fotos de "Un día como hoy":', error);
      setError(t('errors.loading'));
    } finally {
      setLoading(false);
    }
  };

  // Calcular el total de fotos
  const totalPhotos = memories.reduce((total, memory) => total + memory.count, 0);

  // Función para formatear coordenadas de forma amigable
  const formatCoordinates = (location) => {
    if (!location || !location.coordinates || location.coordinates.length < 2) {
      return 'Sin ubicación';
    }

    const [lng, lat] = location.coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1>{t('title')}</h1>
        <p className="text-muted">
          {t('subtitle.start')} <span className="fw-bold">{formattedDate}</span> {t('subtitle.end')}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('common:loading.photos')}</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : totalPhotos === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <i className="bi bi-calendar-x display-1 text-muted"></i>
            <h3 className="mt-4">{t('no_photos.title')}</h3>
            <p>{t('no_photos.message', { date: formattedDate })}</p>
            <Link to="/upload" className="btn btn-primary mt-3">
              <i className="bi bi-cloud-upload me-2"></i>
              {t('no_photos.upload_button')}
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {memories.map(memory => (
            <div key={memory.year} className="mb-5">
              <div className="d-flex align-items-center mb-3">
                <h2 className="mb-0">{memory.year}</h2>
                <div className="ms-3 badge bg-primary rounded-pill">
                  {memory.count} {memory.count === 1 ? t('photo') : t('photos')}
                </div>
              </div>

              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {memory.photos.map(photo => (
                  <Col key={photo._id}>
                    <Card className="h-100 hover-scale shadow-sm">
                      <Link to={`/photo/${photo._id}`} className="text-decoration-none">
                        <div className="gallery-img-container">
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
                              {formatCoordinates(photo.location)}
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {new Date(photo.timestamp).toLocaleDateString(i18n.language)}
                            </small>
                          </div>
                        </Card.Body>
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OnThisDay; 