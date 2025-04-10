import React from 'react';
import { Container, Accordion, Card, Row, Col } from 'react-bootstrap';
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
    <Container fluid className="py-4">
      <h1 className="mb-4">{t('help:title')}</h1>
      <p className="text-muted mb-4" dangerouslySetInnerHTML={{ __html: renderMarkdownText(t('help:description')) }}></p>

      <Row>
        {/* Tabla de contenidos a la izquierda en pantallas grandes */}
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5>{t('help:table_of_contents')}</h5>
              <div className="list-group mt-3">
                <a href="#general" className="list-group-item list-group-item-action">
                  {t('help:sections.general.title')}
                </a>
                <a href="#photo-map" className="list-group-item list-group-item-action">
                  {t('help:sections.photo_map.title')}
                </a>
                <a href="#gallery" className="list-group-item list-group-item-action">
                  {t('help:sections.gallery.title')}
                </a>
                <a href="#my-maps" className="list-group-item list-group-item-action">
                  {t('help:sections.my_maps.title')}
                </a>
                <a href="#on-this-day" className="list-group-item list-group-item-action">
                  {t('help:sections.on_this_day.title')}
                </a>
                <a href="#upload" className="list-group-item list-group-item-action">
                  {t('help:sections.upload.title')}
                </a>
                <a href="#categories" className="list-group-item list-group-item-action">
                  {t('help:sections.categories.title')}
                </a>
                <a href="#profile" className="list-group-item list-group-item-action">
                  {t('help:sections.profile.title')}
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenido principal a la derecha */}
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {/* Agregar estilos CSS para quitar el azul de los acordeones */}
              <style>
                {`
                  .accordion-button:focus {
                    box-shadow: none !important;
                    outline: none !important;
                    border: none !important;
                  }
                  .accordion-button:not(.collapsed) {
                    background-color: rgba(0,0,0,.03) !important;
                    color: inherit !important;
                  }
                  .accordion-button::after {
                    color: inherit !important;
                  }
                  .accordion-item {
                    border-radius: 0.25rem !important;
                    margin-bottom: 0.5rem !important;
                  }
                  .accordion-item:last-of-type .accordion-button.collapsed {
                    border-bottom-right-radius: 0.25rem !important;
                    border-bottom-left-radius: 0.25rem !important;
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Help; 