import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Importar la misma hoja de estilo que las demás páginas
import '../../styles/theme.css';

const SessionExpiredPage = () => {
  const { t } = useTranslation(['common']);
  const [countdown, setCountdown] = useState(3);

  // Asegurarse de que la página use el tema correcto al cargar
  useEffect(() => {
    // Obtener el tema del localStorage (o usar 'light' por defecto)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-bs-theme', savedTheme);
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      // Tiempo completado, redirigir al login
      window.location.href = '/login';
    }
  }, [countdown]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bs-body-bg)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bs-body-color)'
      }}
      className="session-expired-page"
    >
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="mb-4">
              <i className="bi bi-exclamation-circle display-1 text-danger"></i>
            </div>

            <h1 className="display-4 mb-3">{t('session.expired')}</h1>

            <p className="lead mb-4">
              {t('session.redirecting')}
            </p>

            <div className="d-flex align-items-center justify-content-center mb-3">
              <Spinner animation="border" variant="primary" className="me-3" />
              <h2 className="countdown mb-0">{countdown}</h2>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SessionExpiredPage; 