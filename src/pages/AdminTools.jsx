import { Container, Row, Col } from 'react-bootstrap';
import GeocodingPanel from '../components/admin/GeocodingPanel';
import ColorPalette from '../components/admin/ColorPalette';
import LocationTree from '../components/admin/LocationTree';
import { useTranslation } from 'react-i18next';

const AdminTools = () => {
  const { t } = useTranslation(['admin']);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>{t('title')}</h1>
          <p className="text-muted">{t('subtitle')}</p>
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

      <Row className="mt-4">
        <Col md={12}>
          {/* Nuevo panel de árbol de ubicaciones */}
          <LocationTree />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminTools; 