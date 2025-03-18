import { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { adminService } from '../../services/api';

const GeocodingPanel = () => {
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      setError(error.response?.data?.message || 'Error al procesar la geocodificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Procesar Geocodificación</h5>
        <Badge bg="primary" className="ms-2">
          Admin
        </Badge>
      </Card.Header>
      <Card.Body>
        <p className="text-muted">
          Esta herramienta procesa asíncronamente la ubicación de las fotos a partir de sus coordenadas GPS,
          obteniendo información como país, región y ciudad.
        </p>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {result && (
          <Alert variant="success" className="mb-3">
            <strong>Proceso iniciado correctamente.</strong>
            <div>Fotos a procesar: {result.count || '?'}</div>
            {result.message && <div>{result.message}</div>}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Límite de fotos a procesar</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          />
          <Form.Text className="text-muted">
            Cantidad máxima de fotos que serán procesadas en esta ejecución.
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
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-lightning-charge me-2"></i>
              Iniciar Proceso
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default GeocodingPanel; 