import { Card, Row, Col, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

      <div className="dashboard-stats-row row">
        <style jsx="true">{`
          .dashboard-stats-row {
            display: flex;
            flex-wrap: wrap;
          }
          
          .dashboard-stats-row > div {
            display: flex;
            margin-bottom: 1.5rem;
          }
          
          .dashboard-stats-row .card {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          /* Para la tarjeta del mapa */
          .dashboard-map-card {
            background-color: #1b5441 !important;
            color: white !important;
            height: 100%;
          }
          
          /* Estilo especial para el botón del mapa */
          .dashboard-map-button {
            font-weight: 600;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            transition: all 0.3s;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            letter-spacing: 0.03em;
          }
          
          .dashboard-map-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }
          
          .dashboard-map-button:active {
            transform: translateY(1px);
          }
          
          /* Estilo para el título de la tarjeta de mapa */
          .dashboard-map-title {
            font-size: 2.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
        `}</style>

        {/* Mapa - Ocupa todo el ancho */}
        <div className="col-12">
          <Card className="shadow-sm bg-primary text-white">
            <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center text-center">
              <h2 className="mb-3 dashboard-map-title">{t('map.title')}</h2>
              <p>{t('map.description')}</p>
              <Button
                as={Link}
                to="/photo-map"
                variant="light"
                size="lg"
                className="mt-3 dashboard-map-button"
              >
                <i className="bi bi-geo-alt-fill me-2"></i>
                {t('map.button')}
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">📤</div>
              <h3>{t('upload.title')}</h3>
              <p className="text-muted">{t('upload.description')}</p>
              <Button
                variant="outline-primary"
                onClick={() => navigate('/upload')}
              >
                {t('upload.button')}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">🖼️</div>
              <h3>{t('gallery.title')}</h3>
              <p className="text-muted">{t('gallery.description')}</p>
              <Button as={Link} to="/gallery" variant="outline-primary">{t('gallery.button')}</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">👤</div>
              <h3>{t('profile.title')}</h3>
              <p className="text-muted">{t('profile.description')}</p>
              <Button as={Link} to="/profile" variant="outline-primary">{t('profile.button')}</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 