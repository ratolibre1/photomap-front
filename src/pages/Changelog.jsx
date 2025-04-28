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
          <span className="fw-bold">🚀 v1.2.0 - {t('current_version')}</span>
          <NewFeatureBadge rotate={12}>{t('common:badges.new')}</NewFeatureBadge>
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
                  <Link to="/upload" className="text-decoration-none">
                    <strong>{t('changes.v1_2_0.features.upload_improvements')}</strong>
                  </Link> - {t('descriptions.v1_2_0.features.upload_improvements')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.features.upload_results')}</strong> - {t('descriptions.v1_2_0.features.upload_results')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.features.batch_upload')}</strong> - {t('descriptions.v1_2_0.features.batch_upload')}
                </li>
              </ul>

              <h5 className="d-flex align-items-center mt-4">
                <i className="bi bi-arrow-up-circle me-2 text-primary"></i>
                {t('categories.improvements')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <strong>{t('changes.v1_2_0.improvements.map_interactions')}</strong> - {t('descriptions.v1_2_0.improvements.map_interactions')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.improvements.photo_filters')}</strong> - {t('descriptions.v1_2_0.improvements.photo_filters')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.improvements.error_handling')}</strong> - {t('descriptions.v1_2_0.improvements.error_handling')}
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
                  <strong>{t('changes.v1_2_0.ui.photo_details')}</strong> - {t('descriptions.v1_2_0.ui.photo_details')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.ui.sidebar_compact')}</strong> - {t('descriptions.v1_2_0.ui.sidebar_compact')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.ui.responsive_layout')}</strong> - {t('descriptions.v1_2_0.ui.responsive_layout')}
                </li>
              </ul>

              <h5 className="d-flex align-items-center mt-4">
                <i className="bi bi-bug me-2 text-primary"></i>
                {t('categories.fixes')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <strong>{t('changes.v1_2_0.fixes.upload_modal')}</strong> - {t('descriptions.v1_2_0.fixes.upload_modal')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.fixes.map_visibility')}</strong> - {t('descriptions.v1_2_0.fixes.map_visibility')}
                </li>
                <li>
                  <strong>{t('changes.v1_2_0.fixes.mobile_experience')}</strong> - {t('descriptions.v1_2_0.fixes.mobile_experience')}
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

      {/* Versión anterior */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <span className="fw-bold">📦 v1.1.0</span>
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

              <h5 className="d-flex align-items-center mt-4">
                <i className="bi bi-arrow-up-circle me-2 text-primary"></i>
                {t('categories.improvements')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <strong>{t('changes.v1_1_0.improvements.i18n')}</strong> - {t('descriptions.v1_1_0.improvements.i18n')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.improvements.gallery_filters')}</strong> - {t('descriptions.v1_1_0.improvements.gallery_filters')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.improvements.help_center')}</strong> - {t('descriptions.v1_1_0.improvements.help_center')}
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

              <h5 className="d-flex align-items-center mt-4">
                <i className="bi bi-bug me-2 text-primary"></i>
                {t('categories.fixes')}
              </h5>
              <ul className="changelog-list">
                <li>
                  <strong>{t('changes.v1_1_0.fixes.text_format')}</strong> - {t('descriptions.v1_1_0.fixes.text_format')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.fixes.pagination')}</strong> - {t('descriptions.v1_1_0.fixes.pagination')}
                </li>
                <li>
                  <strong>{t('changes.v1_1_0.fixes.search_placeholder')}</strong> - {t('descriptions.v1_1_0.fixes.search_placeholder')}
                </li>
              </ul>
            </Col>
          </Row>
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