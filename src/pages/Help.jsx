import React from 'react';
import { Container, Accordion, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Función para renderizar texto con formato markdown
const renderMarkdownText = (text) => {
  if (!text) return '';

  // Reemplazar **texto** con <strong>texto</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const Help = () => {
  const { t } = useTranslation(['help', 'common']);

  return (
    <Container fluid className="py-4 help-container">
      <h1 className="mb-3">{t('help:title')}</h1>
      <p className="text-muted mb-4" dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:description')) }}></p>

      <Row>
        {/* Temas de ayuda a la izquierda en pantallas grandes */}
        <Col lg={3} className="mb-4">
          <h5 className="mb-3 pb-2" style={{ borderBottom: '2px solid var(--primary)', display: 'inline-block' }}>
            {t('help:table_of_contents')}
          </h5>
          <ol className="ps-3 help-toc">
            <li className="mb-2">
              <a href="#general" className="text-decoration-none help-toc-link">
                {t('help:sections.general.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#photo-map" className="text-decoration-none help-toc-link">
                {t('help:sections.photo_map.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#gallery" className="text-decoration-none help-toc-link">
                {t('help:sections.gallery.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#my-maps" className="text-decoration-none help-toc-link">
                {t('help:sections.my_maps.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#on-this-day" className="text-decoration-none help-toc-link">
                {t('help:sections.on_this_day.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#upload" className="text-decoration-none help-toc-link">
                {t('help:sections.upload.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#categories" className="text-decoration-none help-toc-link">
                {t('help:sections.categories.title')}
              </a>
            </li>
            <li className="mb-2">
              <a href="#profile" className="text-decoration-none help-toc-link">
                {t('help:sections.profile.title')}
              </a>
            </li>
          </ol>
        </Col>

        {/* Contenido principal a la derecha */}
        <Col lg={9}>
          <div className="help-content p-0">
            {/* Estilos CSS personalizados para acordeones */}
            <style>
              {`
                /* Estilos generales del acordeón */
                .help-container .accordion {
                  --bs-accordion-border-width: 0;
                  --bs-accordion-border-radius: 0;
                  --bs-accordion-inner-border-radius: 0;
                }
                
                /* Header del acordeón */
                .help-container .accordion-header {
                  margin-bottom: 0.5rem;
                  width: 100%;
                }
                
                .help-container .accordion-button {
                  background-color: color-mix(in srgb, var(--primary) 15%, transparent) !important;
                  color: var(--dark) !important;
                  border: none !important;
                  border-bottom: 2px solid var(--secondary) !important;
                  box-shadow: none !important;
                  padding: 0.75rem 1rem;
                  border-radius: 0 !important;
                  font-weight: 500;
                  width: 100%;
                }
                
                .help-container .accordion-button:focus {
                  box-shadow: none !important;
                  outline: none !important;
                }
                
                .help-container .accordion-button:not(.collapsed) {
                  background-color: color-mix(in srgb, var(--primary) 25%, transparent) !important;
                  color: var(--dark) !important;
                  border-bottom-width: 2px !important;
                }
                
                .help-container .accordion-button::after {
                  color: var(--primary) !important;
                  transition: transform 0.2s ease;
                  width: 1rem;
                  height: 1rem;
                  background-size: 1rem;
                }
                
                /* Estilos para el cuerpo del acordeón */
                .help-container .accordion-item {
                  border: none !important;
                  background-color: transparent;
                  margin-bottom: 1rem;
                }
                
                .help-container .accordion-body {
                  background-color: rgba(255, 255, 255, 0.5);
                  border-left: 2px solid var(--primary);
                  padding: 1rem 1.5rem;
                  margin-left: 0.5rem;
                }
                
                /* Estilos para los enlaces del menú */
                .help-toc-link {
                  color: var(--dark);
                  font-weight: 500;
                  transition: all 0.2s ease;
                  display: inline-block;
                  padding: 0.35rem 0;
                }
                
                .help-toc-link:hover {
                  color: var(--primary);
                  transform: translateX(5px);
                }
                
                /* Estilos para los títulos de sección */
                .help-content h2 {
                  color: var(--primary);
                  margin-bottom: 1.5rem;
                  display: inline-block;
                  font-weight: 600;
                  padding-bottom: 0.5rem;
                }
                
                /* Ajuste para pantallas pequeñas */
                @media (max-width: 992px) {
                  .help-container .accordion-body {
                    margin-left: 0;
                  }
                }
              `}
            </style>

            {/* Sección General */}
            <section id="general" className="mb-5">
              <h2 className="mb-4">{t('help:sections.general.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="general-1">
                  <Accordion.Header>
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.general.items.what_is.title')) }}></span>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.general.items.what_is.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="general-2">
                  <Accordion.Header>{t('help:sections.general.items.getting_started.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.general.items.getting_started.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="general-3">
                  <Accordion.Header>{t('help:sections.general.items.navigation.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.general.items.navigation.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Mapa de Recuerdos */}
            <section id="photo-map" className="mb-5">
              <h2 className="mb-4">{t('help:sections.photo_map.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="map-1">
                  <Accordion.Header>{t('help:sections.photo_map.items.overview.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.photo_map.items.overview.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="map-2">
                  <Accordion.Header>{t('help:sections.photo_map.items.navigation.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.photo_map.items.navigation.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="map-3">
                  <Accordion.Header>{t('help:sections.photo_map.items.filters.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.photo_map.items.filters.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Galería */}
            <section id="gallery" className="mb-5">
              <h2 className="mb-4">{t('help:sections.gallery.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="gallery-1">
                  <Accordion.Header>{t('help:sections.gallery.items.overview.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.gallery.items.overview.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="gallery-2">
                  <Accordion.Header>{t('help:sections.gallery.items.search.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.gallery.items.search.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Mis Mapas */}
            <section id="my-maps" className="mb-5">
              <h2 className="mb-4">{t('help:sections.my_maps.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="my-maps-1">
                  <Accordion.Header>{t('help:sections.my_maps.items.overview.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.my_maps.items.overview.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="my-maps-2">
                  <Accordion.Header>{t('help:sections.my_maps.items.sharing.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.my_maps.items.sharing.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Un Día como Hoy */}
            <section id="on-this-day" className="mb-5">
              <h2 className="mb-4">{t('help:sections.on_this_day.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="on-this-day-1">
                  <Accordion.Header>{t('help:sections.on_this_day.items.overview.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.on_this_day.items.overview.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Subir Fotos */}
            <section id="upload" className="mb-5">
              <h2 className="mb-4">{t('help:sections.upload.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="upload-1">
                  <Accordion.Header>{t('help:sections.upload.items.methods.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.upload.items.methods.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="upload-2">
                  <Accordion.Header>{t('help:sections.upload.items.zip_upload.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.upload.items.zip_upload.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Categorías */}
            <section id="categories" className="mb-5">
              <h2 className="mb-4">{t('help:sections.categories.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="categories-1">
                  <Accordion.Header>{t('help:sections.categories.items.overview.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.categories.items.overview.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="categories-2">
                  <Accordion.Header>{t('help:sections.categories.items.management.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.categories.items.management.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>

            {/* Sección Perfil */}
            <section id="profile" className="mb-5">
              <h2 className="mb-4">{t('help:sections.profile.title')}</h2>
              <Accordion className="mb-3">
                <Accordion.Item eventKey="profile-1">
                  <Accordion.Header>{t('help:sections.profile.items.settings.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.profile.items.settings.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="profile-2">
                  <Accordion.Header>{t('help:sections.profile.items.security.title')}</Accordion.Header>
                  <Accordion.Body>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:sections.profile.items.security.content')) }}></div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </section>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Help; 