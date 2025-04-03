import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation(['common', 'errors']);

  return (
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
  );
};

export default NotFound; 