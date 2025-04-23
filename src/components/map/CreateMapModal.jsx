import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Row, Col, Badge } from 'react-bootstrap';
import { publicMapService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { THEMES, useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import LabelBadge from '../common/LabelBadge';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const CreateMapModal = ({ show, onHide, filters, onSuccess }) => {
  const { t, i18n } = useTranslation(['common', 'map']);
  const { locations } = useLocation();
  const { currentTheme } = useTheme();

  // Inicializar el estado cuando se abre el modal
  const [mapData, setMapData] = useState(() => ({
    title: '',
    description: '',
    isPublic: true,
    colorPalette: 'milotic', // valor por defecto inicial
    language: i18n.language.startsWith('es') ? 'es' : 'en'
  }));

  // Actualizar valores por defecto cuando se abre el modal Y el tema está disponible
  useEffect(() => {
    if (show && currentTheme) {
      console.log('Theme loaded:', currentTheme);
      setMapData(prev => ({
        ...prev,
        colorPalette: currentTheme,
        language: i18n.language.startsWith('es') ? 'es' : 'en'
      }));
    }
  }, [show, currentTheme]); // Agregamos currentTheme como dependencia

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estado para almacenar los nombres de las ubicaciones
  const [locationNames, setLocationNames] = useState({
    city: null,
    county: null,
    region: null,
    country: null
  });

  // Función para formatear fechas según el idioma actual
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      const locale = i18n.language.startsWith('es') ? es : enUS;
      return format(date, 'PP', { locale });
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return dateString;
    }
  };

  // Obtener los nombres de las ubicaciones según los IDs
  useEffect(() => {
    if (show) {
      const names = {
        city: null,
        county: null,
        region: null,
        country: null
      };

      // Si tenemos una ciudad, obtenemos toda la cadena
      if (filters.city) {
        const city = locations.cities.find(c => c._id === filters.city || c.id === filters.city);
        if (city) {
          names.city = city.name;
          const county = locations.counties.find(c => c._id === city.countyId);
          if (county) {
            names.county = county.name;
            const region = locations.regions.find(r => r._id === county.regionId);
            if (region) {
              names.region = region.name;
              const country = locations.countries.find(c => c._id === region.countryId);
              if (country) {
                names.country = country.name;
              }
            }
          }
        }
      }
      // Si tenemos una provincia/county, obtenemos región y país
      else if (filters.province || filters.county) {
        const county = locations.counties.find(c => c._id === (filters.province || filters.county) || c.id === (filters.province || filters.county));
        if (county) {
          names.county = county.name;
          const region = locations.regions.find(r => r._id === county.regionId);
          if (region) {
            names.region = region.name;
            const country = locations.countries.find(c => c._id === region.countryId);
            if (country) {
              names.country = country.name;
            }
          }
        }
      }
      // Si tenemos una región, obtenemos el país
      else if (filters.region) {
        const region = locations.regions.find(r => r._id === filters.region || r.id === filters.region);
        if (region) {
          names.region = region.name;
          const country = locations.countries.find(c => c._id === region.countryId);
          if (country) {
            names.country = country.name;
          }
        }
      }
      // Si solo tenemos país
      else if (filters.country) {
        const country = locations.countries.find(c => c._id === filters.country || c.id === filters.country);
        if (country) {
          names.country = country.name;
        }
      }

      setLocationNames(names);
    }
  }, [show, filters, locations]);

  // Formatear los filtros para mostrarlos en un resumen
  const formatFilters = () => {
    const formattedFilters = [];

    // Etiquetas (ahora en su propia carta)
    if (filters.labels && filters.labels.length > 0) {
      formattedFilters.push(
        <Card key="labels-card" className="mb-2 border-light">
          <Card.Body className="py-2">
            <div key="labels">
              <div className="fw-bold mb-2">🏷️ {t('common:filters.tags')}</div>
              <div className="d-flex flex-wrap gap-2">
                {filters.labels.map(label => (
                  <LabelBadge
                    key={label._id || label.id}
                    label={label}
                    showEditButton={false}
                  />
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>
      );
    }

    // Fechas (en su propia carta)
    if (filters.startDate || filters.endDate) {
      let dateText = '';
      if (filters.startDate && filters.endDate) {
        const formattedStartDate = formatDate(filters.startDate);
        const formattedEndDate = formatDate(filters.endDate);
        dateText = (
          <span>
            <span className="fw-bold">{formattedStartDate}</span> {t('common:to')} <span className="fw-bold">{formattedEndDate}</span>
          </span>
        );
      } else if (filters.startDate) {
        dateText = <span className="fw-bold">{formatDate(filters.startDate)}</span>;
      } else {
        dateText = <span className="fw-bold">{formatDate(filters.endDate)}</span>;
      }

      formattedFilters.push(
        <Card key="dates-card" className="mb-2 border-light">
          <Card.Body className="py-2">
            <div key="dates">
              <div className="fw-bold mb-2">
                📅 {filters.startDate && filters.endDate
                  ? t('common:filters.date_range')
                  : filters.startDate
                    ? t('common:filters.date_from')
                    : t('common:filters.date_to')}
              </div>
              <div>{dateText}</div>
            </div>
          </Card.Body>
        </Card>
      );
    }

    // Ubicación (en su propia carta)
    if (locationNames.city || locationNames.region || locationNames.county || locationNames.country) {
      let mainLocation = '';
      let locationDetail = [];

      // Determinar la ubicación principal (la más específica) y los detalles
      if (locationNames.city) {
        mainLocation = locationNames.city;
        if (locationNames.county) locationDetail.push(locationNames.county);
        if (locationNames.region) locationDetail.push(locationNames.region);
        if (locationNames.country) locationDetail.push(locationNames.country);
      } else if (locationNames.county) {
        mainLocation = locationNames.county;
        if (locationNames.region) locationDetail.push(locationNames.region);
        if (locationNames.country) locationDetail.push(locationNames.country);
      } else if (locationNames.region) {
        mainLocation = locationNames.region;
        if (locationNames.country) locationDetail.push(locationNames.country);
      } else {
        mainLocation = locationNames.country;
      }

      formattedFilters.push(
        <Card key="location-card" className="mb-2 border-light">
          <Card.Body className="py-2">
            <div key="location">
              <div className="fw-bold mb-2">📍 {t('common:filters.location')}</div>
              <div className="fw-bold">{mainLocation}</div>
              {locationDetail.length > 0 && (
                <div className="text-muted small mt-1">{locationDetail.join(', ')}</div>
              )}
            </div>
          </Card.Body>
        </Card>
      );
    }

    return formattedFilters.length > 0 ? formattedFilters : (
      <Card className="mb-2 border-light">
        <Card.Body className="py-2 text-center text-muted fst-italic">
          {t('common:filters.none')}
        </Card.Body>
      </Card>
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMapData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar datos para enviar al API
      const payload = {
        title: mapData.title,
        description: mapData.description,
        filters: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          isPublic: mapData.isPublic,
          labels: filters.labels && filters.labels.length > 0
            ? filters.labels.map(label => label._id || label.id)
            : []
        },
        displayOptions: {
          sortBy: "timestamp",
          sortDirection: "desc",
          limit: 1000
        },
        language: mapData.language,
        colorPalette: mapData.colorPalette
      };

      // Si hay filtros de ubicación, agregarlos
      if (filters.country) payload.filters.countryId = filters.country;
      if (filters.region) payload.filters.regionId = filters.region;
      if (filters.county) payload.filters.countyId = filters.county;
      if (filters.city) payload.filters.cityId = filters.city;

      console.log('Enviando datos para crear mapa:', payload);

      // Llamar al API
      const response = await publicMapService.createMap(payload);

      // Llamar al callback de éxito
      onSuccess(response.data.data.map);
      onHide();
    } catch (err) {
      console.error('Error al crear el mapa:', err);
      setError(t('common:error.create_map'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      style={{ zIndex: 1500 }} // Aumentar el z-index para que aparezca sobre el selector
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('map:create_map.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p className="fw-bold mb-2">{t('map:create_map.applied_filters')}:</p>
            {formatFilters()}
          </div>

          <Form.Group className="mb-3">
            <Form.Label>{t('map:create_map.map_title')} <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={mapData.title}
              onChange={handleInputChange}
              placeholder={t('map:create_map.title_placeholder')}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('map:create_map.description')}</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={mapData.description}
              onChange={handleInputChange}
              placeholder={t('map:create_map.description_placeholder')}
              rows={3}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('map:create_map.color_theme')}</Form.Label>
                <Form.Select
                  name="colorPalette"
                  value={mapData.colorPalette}
                  onChange={handleInputChange}
                  className="d-flex align-items-center"
                >
                  {Object.keys(THEMES).map((themeKey) => (
                    <option key={themeKey} value={themeKey}>
                      {THEMES[themeKey].icon} {THEMES[themeKey].name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('common:language.title')}</Form.Label>
                <Form.Select
                  name="language"
                  value={mapData.language}
                  onChange={handleInputChange}
                >
                  <option value="es">{t('common:language.es')}</option>
                  <option value="en">{t('common:language.en')}</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isPublic"
                  checked={mapData.isPublic}
                  onChange={handleInputChange}
                  label={t('map:create_map.public_map')}
                  id="isPublic"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {error && (
            <div className="text-danger me-auto">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </div>
          )}
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!mapData.title || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('map:create_map.creating')}
              </>
            ) : (
              t('map:create_map.create_button')
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateMapModal; 