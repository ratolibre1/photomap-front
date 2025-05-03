import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Importar la misma hoja de estilo que las demás páginas
import '../styles/theme.css';

const NotFound = () => {
  const { t } = useTranslation(['common', 'errors']);

  // Asegurarse de que la página use el tema correcto al cargar
  useEffect(() => {
    // Obtener el tema del localStorage (o usar 'light' por defecto)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-bs-theme', savedTheme);

    return () => {
      // Restaurar el tema original al salir
      const currentTheme = localStorage.getItem('theme') || 'light';
      document.body.setAttribute('data-bs-theme', currentTheme);
    };
  }, []);

  return (
    <div className="not-found-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)'
    }}>
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
            </div>
            <h1 className="display-4 mb-3">404</h1>
            <h2 className="mb-4">{t('errors:notFound.title')}</h2>
            <p className="lead mb-5">
              {t('errors:notFound.message')}
            </p>
            <div className="d-flex justify-content-center">
              <Button
                as={Link}
                to="/"
                variant="primary"
                size="lg"
                className="px-4"
              >
                <i className="bi bi-house-door me-2"></i>
                {t('common:navigation.home')}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound; 