import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { photoService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/common/LocationSelector';
import { DropdownProvider } from '../context/DropdownContext';

const OnThisDay = () => {
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState([]);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation(['onthisday', 'common']);
  const { user } = useAuth();

  // Estado para el formulario de búsqueda para administradores
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [isCustomDate, setIsCustomDate] = useState(false);

  // Obtener y formatear la fecha actual según el idioma
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() es 0-indexed
  const currentDay = today.getDate();

  // Generar opciones de meses (sin ordenamiento alfabético)
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: (i + 1).toString(),
      name: t(`admin_search.months.${i + 1}`),
      disableSort: true // Deshabilitar ordenamiento
    }));
  }, [i18n.language]);

  // Función para calcular días en el mes seleccionado (teniendo en cuenta años bisiestos)
  const getDaysInMonth = (month) => {
    if (!month) return 31; // valor por defecto

    const monthNum = parseInt(month);
    // Para febrero (mes 2)
    if (monthNum === 2) {
      return 29;
    }
    // Para los demás meses
    if ([4, 6, 9, 11].includes(monthNum)) {
      return 30;
    }
    return 31;
  };

  // Generar opciones de días (sin ordenamiento alfabético)
  const dayOptions = useMemo(() => {
    return Array.from(
      { length: getDaysInMonth(selectedMonth) },
      (_, i) => ({
        id: (i + 1).toString(),
        name: (i + 1).toString(),
        disableSort: true // Deshabilitar ordenamiento
      })
    );
  }, [selectedMonth]);

  // Manejador para cambio de mes (resetea el día seleccionado)
  const handleMonthChange = (monthId) => {
    setSelectedMonth(monthId);
    setSelectedDay(''); // Resetear el día al cambiar de mes
  };

  // Formatear la fecha actual para mostrar
  const formatDate = (day, month) => {
    // Usar un año bisiesto conocido (2020) para garantizar que el 29 de febrero se muestre correctamente
    const date = new Date(2020, month - 1, day);
    return new Intl.DateTimeFormat(i18n.language, {
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  const formattedDate = isCustomDate && selectedMonth && selectedDay
    ? formatDate(parseInt(selectedDay), parseInt(selectedMonth))
    : formatDate(currentDay, currentMonth);

  useEffect(() => {
    fetchPhotosOnThisDay();
  }, []);

  const fetchPhotosOnThisDay = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Usar el endpoint con los parámetros opcionales
      const response = await photoService.getPhotosOnThisDay(params);

      // Extraer datos de la respuesta
      const { memories } = response.data.data;
      setMemories(memories);

      // Si se proporcionaron parámetros, marcar como fecha personalizada
      if (params.day || params.month) {
        setIsCustomDate(true);
      } else {
        setIsCustomDate(false);
      }
    } catch (error) {
      console.error('Error al cargar fotos de "Un día como hoy":', error);
      setError(t('errors.loading'));
    } finally {
      setLoading(false);
    }
  };

  // Manejador para el formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};

    if (selectedMonth) params.month = parseInt(selectedMonth);
    if (selectedDay) params.day = parseInt(selectedDay);

    fetchPhotosOnThisDay(params);
  };

  // Manejador para resetear la búsqueda
  const handleReset = () => {
    setSelectedMonth('');
    setSelectedDay('');
    fetchPhotosOnThisDay();
  };

  // Calcular el total de fotos
  const totalPhotos = memories.reduce((total, memory) => total + memory.count, 0);

  // Función para formatear coordenadas de forma amigable
  const formatCoordinates = (location) => {
    if (!location || !location.coordinates || location.coordinates.length < 2) {
      return 'Sin ubicación';
    }

    const [lng, lat] = location.coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Verificar si el usuario es administrador
  const isAdmin = user && user.role === 'admin';

  // Determinar si el botón de búsqueda debe estar deshabilitado
  const isSearchDisabled = !selectedMonth || !selectedDay;

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1>{t('title')}</h1>
        <p className="text-muted">
          {isCustomDate
            ? (
              <>
                {t('admin_search.custom_date', { date: '' })}
                <span className="fw-bold">{formattedDate}</span>
              </>
            )
            : (
              <>
                {t('subtitle.start')} <span className="fw-bold">{formattedDate}</span> {t('subtitle.end')}
              </>
            )
          }
        </p>
      </div>

      {/* Formulario de búsqueda para administradores */}
      {isAdmin && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>{t('admin_search.title')}</h5>
            <p className="text-muted">{t('admin_search.description')}</p>

            <Form onSubmit={handleSearch}>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin_search.month_label')}</Form.Label>
                    <DropdownProvider>
                      <LocationSelector
                        id="month-selector"
                        options={monthOptions}
                        selectedValue={selectedMonth}
                        onSelect={handleMonthChange}
                        placeholder={t('admin_search.month_label')}
                        icon="calendar-month"
                        noOptionsMessage={t('common:dropdown.no_options')}
                      />
                    </DropdownProvider>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('admin_search.day_label')}</Form.Label>
                    <DropdownProvider>
                      <LocationSelector
                        id="day-selector"
                        options={dayOptions}
                        selectedValue={selectedDay}
                        onSelect={setSelectedDay}
                        placeholder={t('admin_search.day_label')}
                        icon="calendar-day"
                        noOptionsMessage={t('common:dropdown.no_options')}
                        disabled={!selectedMonth}
                      />
                    </DropdownProvider>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <div className="d-flex gap-2 mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSearchDisabled}
                    >
                      <i className="bi bi-search me-1"></i>
                      {t('admin_search.search_button')}
                    </Button>

                    <Button
                      type="button"
                      variant="dark-inverse"
                      onClick={handleReset}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      {t('admin_search.reset_button')}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('common:loading.photos')}</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : totalPhotos === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <i className="bi bi-calendar-x display-1 text-muted"></i>
            <h3 className="mt-4">{t('no_photos.title')}</h3>
            <p>
              {t('no_photos.message', { date: formattedDate }).split(formattedDate).map((part, index) =>
                index === 0 ? part : <><strong>{formattedDate}</strong>{part}</>
              )}
            </p>
            <Link to="/upload" className="btn btn-primary mt-3">
              <i className="bi bi-cloud-upload me-2"></i>
              {t('no_photos.upload_button')}
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {memories.map(memory => (
            <div key={memory.year} className="mb-5">
              <div className="d-flex align-items-center mb-3">
                <h2 className="mb-0">{memory.year}</h2>
                <div className="ms-2 badge rounded-pill" style={{ backgroundColor: 'var(--info)', color: 'var(--dark)' }}>
                  {new Date().getFullYear() - memory.year} {new Date().getFullYear() - memory.year === 1 ? t('year_ago') : t('years_ago')}
                </div>
                <div className="ms-2 badge rounded-pill" style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>
                  {memory.count} {memory.count === 1 ? t('photo') : t('photos')}
                </div>
              </div>

              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {memory.photos.map(photo => (
                  <Col key={photo._id}>
                    <Card className="h-100 hover-scale shadow-sm">
                      <Link to={`/photo/${photo._id}`} className="text-decoration-none">
                        <div className="gallery-img-container">
                          <Card.Img
                            variant="top"
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.title || 'Foto'}
                            className="gallery-img"
                          />
                        </div>
                        <Card.Body>
                          <Card.Title
                            className="text-truncate text-center mb-3"
                            style={{ color: 'var(--primary)' }}
                          >
                            {photo.title || 'Sin título'}
                          </Card.Title>

                          <div className="photo-info d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {formatCoordinates(photo.location)}
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {new Date(photo.timestamp).toLocaleDateString(i18n.language)}
                            </small>
                          </div>
                        </Card.Body>
                      </Link>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OnThisDay; 