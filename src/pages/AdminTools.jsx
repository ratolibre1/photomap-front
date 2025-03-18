import { Container, Row, Col } from 'react-bootstrap';
import GeocodingPanel from '../components/admin/GeocodingPanel';
import ColorPalette from '../components/admin/ColorPalette';

const AdminTools = () => {
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Herramientas de Administración</h1>
          <p className="text-muted">Panel de control para tareas administrativas del sistema</p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <GeocodingPanel />
        </Col>

        {/* Panel de colores */}
        <Col md={6}>
          <ColorPalette />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminTools; 