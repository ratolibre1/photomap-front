import { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { adminService } from '../../services/api';
import { useTranslation } from 'react-i18next';

const GeocodingPanel = () => {
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation(['admin']);

  const handleProcessGeocoding = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await adminService.processGeocoding({ limit });
      console.log('Respuesta geocodificación:', response.data);

      setResult(response.data);
    } catch (error) {
      console.error('Error al procesar geocodificación:', error);
      setError(error.response?.data?.message || t('geocoding.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t('geocoding.title')}</h5>
        <Badge bg="primary" className="ms-2">
          {t('geocoding.badge')}
        </Badge>
      </Card.Header>
      <Card.Body>
        <p className="text-muted">
          {t('geocoding.description')}
        </p>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {result && (
          <Alert variant="success" className="mb-3">
            <strong>{t('geocoding.success')}</strong>
            <div>{t('geocoding.photos_to_process', { count: result.count || '?' })}</div>
            {result.message && <div>{result.message}</div>}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>{t('geocoding.limit_label')}</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          />
          <Form.Text className="text-muted">
            {t('geocoding.limit_help')}
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          onClick={handleProcessGeocoding}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('geocoding.processing')}
            </>
          ) : (
            <>
              <i className="bi bi-lightning-charge me-2"></i>
              {t('geocoding.start_process')}
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default GeocodingPanel; 