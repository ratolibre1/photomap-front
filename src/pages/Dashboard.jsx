import { Card, Row, Col, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { statsService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    counts: { photos: 0, users: 0, categories: 0 },
    distribution: { byVisibility: [], byMonth: [] },
    top: { categories: [], cameras: [] },
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await statsService.getSystemStats();
        setStats(response.data.data.stats);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  console.log("Token en localStorage:", localStorage.getItem('token'));
  console.log("User en localStorage:", localStorage.getItem('user'));
  console.log("Usuario en contexto:", user);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Resumen de actividad del sistema</p>
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
          
          /* Para la tarjeta de estadísticas */
          .dashboard-stats-card {
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

        {/* Primera columna - Mapa */}
        <div className="col-lg-8">
          <Card className="shadow-sm bg-primary text-white">
            <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center text-center">
              <h2 className="mb-3 dashboard-map-title">Explora tus recuerdos en el mapa 🗺️</h2>
              <p>Visualiza todas tus fotos distribuidas geográficamente y descubre los lugares que has visitado.</p>
              <Button
                as={Link}
                to="/photo-map"
                variant="light"
                size="lg"
                className="mt-3 dashboard-map-button"
              >
                <i className="bi bi-geo-alt-fill me-2"></i>
                Ver mapa
              </Button>
            </Card.Body>
          </Card>
        </div>

        {/* Segunda columna - Estadísticas */}
        <div className="col-lg-4">
          <Card className="shadow-sm h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <h3 className="mb-3">Tus estadísticas 📊</h3>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Cargando estadísticas...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <div className="mb-2">
                    <i className="bi bi-camera me-2"></i> Fotos totales: <span className="fw-bold">{stats.counts.photos}</span>
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-tag me-2"></i> Categorías: <span className="fw-bold">{stats.counts.categories}</span>
                  </div>
                  {stats.distribution?.byVisibility && (
                    <>
                      <div className="mb-2">
                        <i className="bi bi-eye me-2"></i> Fotos públicas: <span className="fw-bold">
                          {stats.distribution.byVisibility.find(v => v.visibility === "public")?.count || 0}
                        </span>
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-eye-slash me-2"></i> Fotos privadas: <span className="fw-bold">
                          {stats.distribution.byVisibility.find(v => v.visibility === null)?.count || 0}
                        </span>
                      </div>
                    </>
                  )}
                  {stats.lastUpdated && (
                    <div className="mt-3 text-muted small">
                      <i className="bi bi-clock-history me-1"></i> Actualizado: {new Date(stats.lastUpdated).toLocaleString()}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">📤</div>
              <h3>Subir fotos</h3>
              <p className="text-muted">Comparte tus momentos subiendo nuevas fotos al mapa.</p>
              <Button
                variant="outline-primary"
                onClick={() => navigate('/upload')}
              >
                Subir ahora
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">🖼️</div>
              <h3>Galería de Fotos</h3>
              <p className="text-muted">Visualiza todas tus fotos organizadas en una galería.</p>
              <Button as={Link} to="/gallery" variant="outline-primary">Ver galería</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body className="p-4">
              <div className="display-1 mb-3">👤</div>
              <h3>Tu perfil</h3>
              <p className="text-muted">Edita tu información personal y tus preferencias.</p>
              <Button as={Link} to="/profile" variant="outline-primary">Ver perfil</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 