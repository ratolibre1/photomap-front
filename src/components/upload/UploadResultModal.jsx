import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Alert, Badge, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './UploadResultModal.css';

const UploadResultModal = ({ show, onHide, result }) => {
  const { t } = useTranslation(['upload', 'common']);
  const [stats, setStats] = useState({});
  const [hasStats, setHasStats] = useState(false);

  // Procesamiento del resultado
  useEffect(() => {
    if (!result) return;

    console.log('Received result:', result);

    let newStats = {};

    // Verificar si la respuesta viene en el formato esperado
    if (result.data) {
      if (result.data.stats) {
        newStats = result.data.stats;
      }
    }

    console.log('Processed stats:', newStats);

    setStats(newStats);
    setHasStats(!!newStats && typeof newStats === 'object' && Object.keys(newStats).length > 0);
  }, [result]);

  // Construir la lista completa de fotos 
  const photosList = useMemo(() => {
    if (!stats || !stats.photos) return [];

    console.log('Building photosList from:', stats);
    return stats.photos || [];
  }, [stats]);

  // Si no hay resultado, no mostrar nada
  if (!result) {
    return null;
  }

  // Para debugging en desarrollo
  console.log('Upload result:', result);
  console.log('Photos list for modal:', photosList);
  console.log('Current stats:', stats);

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="upload-result-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t('result.stats_title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasStats && (
          <>
            <div className="stats-summary">
              <Row className="g-3">
                <Col md={4}>
                  <Card className="text-center h-100 shadow-sm bg-success bg-opacity-10">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-images fs-3 text-success"></i>
                        <h3 className="stat-value text-success mb-0">{stats.processed || 0}</h3>
                      </div>
                      <div className="stat-label text-muted fw-bold">{t('result.processed')}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center h-100 shadow-sm bg-warning bg-opacity-10">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-files fs-3 text-warning"></i>
                        <h3 className="stat-value text-warning mb-0">{stats.duplicates || 0}</h3>
                      </div>
                      <div className="stat-label text-muted fw-bold">{t('result.duplicates')}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center h-100 shadow-sm bg-danger bg-opacity-10">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-exclamation-circle fs-3 text-danger"></i>
                        <h3 className="stat-value text-danger mb-0">{stats.errors || 0}</h3>
                      </div>
                      <div className="stat-label text-muted fw-bold">{t('result.errors')}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>

            {photosList && photosList.length > 0 && (
              <div className="photos-list mt-2">
                <h5 className="m-3 border-bottom pb-2">{t('result.photos_title')}</h5>
                <div className="photo-grid">
                  {photosList.map((photo, idx) => {
                    const photoTitle = photo.title || photo.fileName || photo.name || `Foto ${idx + 1}`;
                    const isDuplicate = photo.duplicate === true;
                    const isError = photo.error === true;

                    let statusBadge;
                    let badgeClass;
                    let iconClass;

                    if (isDuplicate) {
                      statusBadge = t('result.is_duplicate');
                      badgeClass = 'custom-badge-warning';
                      iconClass = 'bi-files';
                    } else if (isError) {
                      statusBadge = t('result.error_processing');
                      badgeClass = 'custom-badge-danger';
                      iconClass = 'bi-exclamation-circle';
                    } else {
                      statusBadge = "Procesada";
                      badgeClass = 'custom-badge-success';
                      iconClass = 'bi-check-circle';
                    }

                    const thumbnailUrl = photo.thumbnailUrl || photo.existingPhotoUrl;
                    const photoId = isDuplicate ? photo.existingPhotoId : photo.id;

                    return (
                      <Card key={`photo-${idx}`} className="photo-item shadow-sm mb-3 m-1">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="photo-thumbnail me-3">
                              {thumbnailUrl ? (
                                <img
                                  src={thumbnailUrl}
                                  alt={photoTitle}
                                  className="img-thumbnail"
                                  style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="placeholder-thumbnail d-flex align-items-center justify-content-center bg-light" style={{ width: '70px', height: '70px' }}>
                                  <i className="bi bi-image text-muted fs-3"></i>
                                </div>
                              )}
                            </div>

                            <div className="photo-details flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="photo-title fw-bold">
                                  {photoTitle}
                                </div>
                                <span className={`ms-2 badge rounded-pill ${badgeClass}`}>
                                  <i className={`bi ${iconClass} me-1`}></i> {statusBadge}
                                </span>
                              </div>

                              <div className="photo-metadata mt-1 small">
                                {!isError && (
                                  <div className="d-flex flex-wrap">
                                    <span className="me-3">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {photo.hasLocation ?
                                        (photo.coordinates && photo.coordinates[1] && photo.coordinates[0]
                                          ? `${photo.coordinates[1].toFixed(6)}, ${photo.coordinates[0].toFixed(6)}`
                                          : t('result.location_available')) :
                                        t('result.location_unknown')}
                                    </span>
                                    <span>
                                      <i className="bi bi-calendar me-1"></i>
                                      {photo.hasTimestamp ?
                                        (photo.timestamp ? new Date(photo.timestamp).toLocaleDateString() : t('result.date_available')) :
                                        t('result.date_unknown')}
                                    </span>
                                  </div>
                                )}

                                {photoId && (
                                  <div className="mt-1">
                                    <Link to={`/photo/${photoId}`} className="btn btn-sm btn-primary mt-1">
                                      <i className="bi bi-eye me-1"></i>
                                      {isDuplicate ? t('result.view_duplicate') : t('result.view_detail')}
                                    </Link>
                                  </div>
                                )}

                                {isError && photo.errorMessage && (
                                  <div className="text-danger">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    {photo.errorMessage}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide} className="px-4">
          {t('common:buttons.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadResultModal; 