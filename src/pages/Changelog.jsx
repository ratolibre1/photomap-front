import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NewFeatureBadge from '../components/common/NewFeatureBadge';

const Changelog = () => {
  const { t } = useTranslation(['changelog', 'common']);

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1>{t('title')}</h1>
        <p className="text-muted">{t('subtitle')}</p>
      </div>

      {/* Versión actual */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <span className="fw-bold">🚀 v1.1.0 - {t('current_version')}</span>
          <NewFeatureBadge rotate={12}>{t('common:new')}</NewFeatureBadge>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="d-flex align-items-center">
                <i className="bi bi-stars me-2 text-primary"></i>
                {t('categories.features')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <Link to="/my-maps" className="text-decoration-none">
                    <strong>{t('changes.v1_1_0.features.maps')}</strong>
                  </Link> - {t('descriptions.v1_1_0.features.maps')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.features.location_selector')}</strong> - {t('descriptions.v1_1_0.features.location_selector')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.features.avatar_upload')}</strong> - {t('descriptions.v1_1_0.features.avatar_upload')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.features.search')}</strong> - {t('descriptions.v1_1_0.features.search')}
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h5 className="d-flex align-items-center">
                <i className="bi bi-palette me-2 text-primary"></i>
                {t('categories.ui')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <strong>{t('changes.v1_1_0.ui.theme_update')}</strong> - {t('descriptions.v1_1_0.ui.theme_update')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.ui.sidebar_improvement')}</strong> - {t('descriptions.v1_1_0.ui.sidebar_improvement')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.ui.dropdowns')}</strong> - {t('descriptions.v1_1_0.ui.dropdowns')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.ui.animations')}</strong> - {t('descriptions.v1_1_0.ui.animations')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.ui.responsive')}</strong> - {t('descriptions.v1_1_0.ui.responsive')}
                </li>
              </ul>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Link to="/help" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-question-circle me-1"></i>
              {t('view_help')}
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Versión base */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <span className="fw-bold">📦 v1.0.0 - {t('initial_release')}</span>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="d-flex align-items-center">
                <i className="bi bi-stars me-2 text-primary"></i>
                {t('categories.features')}
              </h5>
              <ul className="changelog-list">
                <li><strong>{t('changes.v1_0_0.features.photo_upload')}</strong> - {t('descriptions.v1_0_0.features.photo_upload')}</li>
                <li><strong>{t('changes.v1_0_0.features.gallery')}</strong> - {t('descriptions.v1_0_0.features.gallery')}</li>
                <li><strong>{t('changes.v1_0_0.features.photo_map')}</strong> - {t('descriptions.v1_0_0.features.photo_map')}</li>
                <li><strong>{t('changes.v1_0_0.features.user_profile')}</strong> - {t('descriptions.v1_0_0.features.user_profile')}</li>
                <li><strong>{t('changes.v1_0_0.features.on_this_day')}</strong> - {t('descriptions.v1_0_0.features.on_this_day')}</li>
              </ul>
            </Col>
            <Col md={6}>
              <h5 className="d-flex align-items-center">
                <i className="bi bi-palette me-2 text-primary"></i>
                {t('categories.ui')}
              </h5>
              <ul className="changelog-list">
                <li><strong>{t('changes.v1_0_0.ui.responsive_design')}</strong> - {t('descriptions.v1_0_0.ui.responsive_design')}</li>
                <li><strong>{t('changes.v1_0_0.ui.theme_support')}</strong> - {t('descriptions.v1_0_0.ui.theme_support')}</li>
                <li><strong>{t('changes.v1_0_0.ui.map_integration')}</strong> - {t('descriptions.v1_0_0.ui.map_integration')}</li>
                <li><strong>{t('changes.v1_0_0.ui.modern_design')}</strong> - {t('descriptions.v1_0_0.ui.modern_design')}</li>
                <li><strong>{t('changes.v1_0_0.ui.reusable_components')}</strong> - {t('descriptions.v1_0_0.ui.reusable_components')}</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Changelog; 