import { Card, Row, Col, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);

  console.log("Token en localStorage:", localStorage.getItem('token'));
  console.log("User en localStorage:", localStorage.getItem('user'));
  console.log("Usuario en contexto:", user);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>{t('title')}</h1>
          <p className="text-muted">{t('subtitle')}</p>
        </Col>
      </Row>

      <div className="featured-map-box p-5 mb-4 rounded text-center">
        <h2 className="display-5 mb-3 fw-bold">{t('map.featured_title')}</h2>
        <p className="lead text-muted mb-4">
          {t('map.featured_description')}
        </p>
        <Button
          as={Link}
          to="/map"
          variant="primary"
          size="lg"
          className="px-5 py-3"
          style={{ fontSize: '1.2rem' }}
        >
          <i className="bi bi-geo-alt me-2"></i>
          {t('map.button')}
        </Button>
      </div>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="display-1 mb-3">📤</div>
              <h3>{t('upload.title')}</h3>
              <p className="text-muted">{t('upload.description')}</p>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/upload" variant="dark-inverse">
                  <i className="bi bi-upload me-2"></i>
                  {t('upload.button')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="display-1 mb-3">🖼️</div>
              <h3>{t('gallery.title')}</h3>
              <p className="text-muted">{t('gallery.description')}</p>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/gallery" variant="dark-inverse">
                  <i className="bi bi-images me-2"></i>
                  {t('gallery.button')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="display-1 mb-3">👤</div>
              <h3>{t('profile.title')}</h3>
              <p className="text-muted">{t('profile.description')}</p>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/profile" variant="dark-inverse">
                  <i className="bi bi-person-fill me-2"></i>
                  {t('profile.button')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .featured-map-box {
          background: var(--bs-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .featured-map-box .text-muted {
          color: rgba(255,255,255,0.8) !important;
        }
      `}</style>
    </Container>
  );
};

export default Dashboard; 