import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Row, Col, Form, Button, Collapse } from 'react-bootstrap';
import { useLocation } from '../../context/LocationContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilos principales
import 'react-date-range/dist/theme/default.css'; // Tema por defecto
import es from 'date-fns/locale/es'; // Importar localización española
import enUS from 'date-fns/locale/en-US'; // Importar localización inglesa
import { useTranslation } from 'react-i18next';
import { photoService } from '../../services/api';
import LabelSelector from '../common/LabelSelector';
import LocationSelector from '../common/LocationSelector';
import { DropdownProvider } from '../../context/DropdownContext';
import NewFeatureBadge from '../common/NewFeatureBadge';

const SearchFilters = ({ filters, onFilterChange, showCreateMapButton = false, onOpenCreateMapModal, excludeUnknowns = false }) => {
  // Obtenemos funciones y datos del contexto de ubicación
  const { locations: filteredLocations, loading, selectLocation } = useLocation();
  const { t, i18n } = useTranslation(['filters', 'labels']);
  const [showCreateMapSection, setShowCreateMapSection] = useState(false);
  const prevFiltersRef = useRef(null);

  // Mapa de locales soportados para date-fns
  // Se puede extender fácilmente con más idiomas
  const locales = useMemo(() => ({
    'es': es,
    'en': enUS
  }), []);

  // Obtener el locale según el idioma actual
  const currentLocale = useMemo(() => {
    // Obtener el código de idioma base (es, en, etc.)
    const langCode = i18n.language.split('-')[0];
    // Retornar el locale correspondiente o inglés como fallback
    return locales[langCode] || locales['en'];
  }, [i18n.language, locales]);

  // Estado para controlar si se ha inicializado el calendario
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  // Estado para rastrear si estamos en proceso de selección
  const [isSelecting, setIsSelecting] = useState(false);

  // Estado para rastrear el último día seleccionado
  const [lastSelectedDay, setLastSelectedDay] = useState(null);

  // Estado para manejar el rango de fechas con la fecha actual
  const [dateRangeState, setDateRangeState] = useState(() => {
    // Inicializar con las fechas de los filtros si existen, si no con null
    let startDate = null;
    let endDate = null;

    if (filters.startDate) {
      // Si viene en formato YYYY-MM-DD, crear fecha a medianoche hora local
      const [year, month, day] = filters.startDate.split('-').map(Number);
      startDate = new Date(year, month - 1, day, 0, 0, 0);
    }

    if (filters.endDate) {
      // Si viene en formato YYYY-MM-DD, crear fecha a medianoche hora local
      const [year, month, day] = filters.endDate.split('-').map(Number);
      endDate = new Date(year, month - 1, day, 0, 0, 0);
    }

    return [{
      startDate,
      endDate,
      key: 'selection'
    }];
  });

  // Nuevo estado para almacenar datos del calendario
  const [calendarData, setCalendarData] = useState([]);
  // Estado para controlar si los datos del calendario están cargando
  const [loadingCalendarData, setLoadingCalendarData] = useState(false);

  // Función para cargar los datos del calendario
  const loadCalendarData = async (date) => {
    try {
      setLoadingCalendarData(true);

      // Obtener el mes y año del primer mes visible
      const firstMonth = new Date(date);
      const month = firstMonth.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
      const year = firstMonth.getFullYear();

      // Calcular el mes siguiente y su año correspondiente
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextMonthYear = month === 12 ? year + 1 : year;

      // Realizar ambas solicitudes en paralelo
      const [currentMonthResponse, nextMonthResponse] = await Promise.all([
        photoService.getPhotoCalendar(month, year, excludeUnknowns),
        photoService.getPhotoCalendar(nextMonth, nextMonthYear, excludeUnknowns)
      ]);

      // Extraer y combinar los datos de ambos meses
      const currentMonthData = currentMonthResponse.data.data.calendar || [];
      const nextMonthData = nextMonthResponse.data.data.calendar || [];

      // Combinar los datos de ambos meses en un solo array
      const combinedCalendarData = [...currentMonthData, ...nextMonthData];

      setCalendarData(combinedCalendarData);
      console.log('Datos del calendario cargados para meses:', `${month}/${year}`, `${nextMonth}/${nextMonthYear}`);
      console.log('Total de días con datos:', combinedCalendarData.length);
    } catch (error) {
      console.error('Error al cargar datos del calendario:', error);
    } finally {
      setLoadingCalendarData(false);
    }
  };

  // Efecto para cargar los datos del calendario al inicializar
  useEffect(() => {
    // Cargar los datos del calendario al inicializar,
    // pero solo si no hay una fecha seleccionada previamente
    if (!filters.startDate) {
      const today = new Date();
      loadCalendarData(today);
    } else {
      // Si ya hay una fecha seleccionada, usar esa para cargar los datos
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      loadCalendarData(startDate);
    }
  }, []);  // Solo se ejecuta al montar el componente

  // Efecto para cargar los datos del calendario cuando cambia la fecha de inicio
  useEffect(() => {
    if (filters.startDate) {
      console.log('🔄 Actualizando calendario por cambio en filtro:', filters.startDate);
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      loadCalendarData(startDate);
    }
  }, [filters.startDate]);

  // Formatear la fecha actual para usarla como placeholder, actualizándose cuando cambia el idioma
  const currentDatePlaceholder = useMemo(() => {
    const today = new Date();
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    let formattedDate = today.toLocaleDateString(i18n.language, options);
    formattedDate = formattedDate.replace(/^[A-Z]/, match => match.toLowerCase());
    return formattedDate;
  }, [i18n.language]);

  const handleDateRangeChange = (item) => {
    // Si es la primera interacción, inicializamos el estado
    if (!calendarInitialized) {
      setCalendarInitialized(true);
    }

    // Actualizamos el estado con la selección del usuario
    setDateRangeState([item.selection]);

    // Verificar si las fechas son válidas
    if (!item.selection.startDate || !item.selection.endDate) {
      console.log('⚠️ Fechas inválidas en la selección:', item.selection);
      return; // Salir si alguna fecha es nula
    }

    // Verificar si es un solo día (inicio y fin iguales)
    const isSingleDay = item.selection.startDate.getTime() === item.selection.endDate.getTime();

    // Convertir a formato string para comparaciones
    const selectedDay = isSingleDay ?
      formatDateToLocalISOString(item.selection.startDate) : null;

    // Lógica para la selección
    if (isSingleDay) {
      // Primera vez que seleccionamos este día
      if (!isSelecting || selectedDay !== lastSelectedDay) {
        // Iniciamos selección
        setIsSelecting(true);
        setLastSelectedDay(selectedDay);
        return; // No enviamos el cambio aún
      } else {
        // Segunda vez que seleccionamos el mismo día, confirmamos la selección
        setIsSelecting(false);
      }
    } else {
      // Si es un rango (días diferentes), resetear el estado de selección
      setIsSelecting(false);
      setLastSelectedDay(null);
    }

    // Llegados a este punto, enviamos el cambio (si es un rango o un día confirmado)
    const startDate = item.selection.startDate ? formatDateToLocalISOString(item.selection.startDate) : '';
    const endDate = item.selection.endDate ? formatDateToLocalISOString(item.selection.endDate) : '';

    // Actualizar cada campo individualmente
    onFilterChange('startDate', startDate);
    onFilterChange('endDate', endDate);

    // NO recargamos aquí - la carga de datos se hará en el useEffect cuando cambie la fecha
    console.log('📆 Selección completada, filtrando desde:', startDate, 'hasta:', endDate);
  };

  // Función para formatear fechas sin problema de zona horaria
  const formatDateToLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función que maneja cambios en los selectores de ubicación
  const handleLocationChange = (field, value) => {
    // Guardar el valor anterior para comparar
    const prevValue = filters[field];

    console.log(`🌀 Cambio en ${field} de "${prevValue}" a "${value}"`);

    // PRIMERO: Actualizamos el filtro para el componente padre
    onFilterChange(field, value);

    // SEGUNDO: Actualizamos el contexto, EVITANDO múltiples llamadas
    // que puedan pisarse entre sí

    // Caso especial: Limpiar solo el nivel actual si el valor es vacío
    if (value === '') {
      console.log(`🧹 Limpiando solo el nivel ${field}`);

      // Mapeamos el nombre del campo al ID correspondiente en el contexto
      const idMap = {
        'country': 'countryId',
        'region': 'regionId',
        'county': 'countyId',
        'city': 'cityId'
      };

      // Actualizar solo este nivel
      if (idMap[field]) {
        selectLocation(idMap[field], '');
      }

      return;
    }

    // Caso normal: Cambio de valor a uno no vacío
    console.log(`🔄 Actualizando ${field} a "${value}"`);

    // Solo realizamos UN ÚNICO llamado a selectLocation para evitar condiciones de carrera
    switch (field) {
      case 'country':
        if (prevValue !== value) {
          console.log(`🔄 Reseteando cascada desde país`);
          // Actualizar la UI primero
          onFilterChange('region', '');
          onFilterChange('county', '');
          onFilterChange('city', '');

          // Esperar un tick para asegurar que estos cambios se procesen antes
          setTimeout(() => {
            selectLocation('countryId', value);
          }, 10);
        } else {
          selectLocation('countryId', value);
        }
        break;

      case 'region':
        if (prevValue !== value) {
          // Actualizar la UI primero
          onFilterChange('county', '');
          onFilterChange('city', '');

          // Esperar un tick para asegurar que estos cambios se procesen antes
          setTimeout(() => {
            selectLocation('regionId', value);
          }, 10);
        } else {
          selectLocation('regionId', value);
        }
        break;

      case 'county':
        if (prevValue !== value) {
          // Actualizar la UI primero
          onFilterChange('city', '');

          // Esperar un tick para asegurar que estos cambios se procesen antes
          setTimeout(() => {
            selectLocation('countyId', value);
          }, 10);
        } else {
          selectLocation('countyId', value);
        }
        break;

      case 'city':
        selectLocation('cityId', value);
        break;

      default:
        break;
    }
  };

  // Función para manejar cambios en los meses visibles
  const handleShownDateChange = async (date) => {
    loadCalendarData(date);
  };

  // Función para renderizar el contenido personalizado de los días
  const renderDayContent = (day) => {
    // Formatear la fecha al formato YYYY-MM-DD para comparar con los datos del backend
    const dateString = formatDateToLocalISOString(day);

    // Buscar si hay datos para esta fecha
    const dayData = calendarData.find(item => item.date === dateString);

    if (dayData) {
      // Si hay fotos en esta fecha, mostrar un indicador
      return (
        <div className="calendar-day-with-photos">
          <span className="day-number">{day.getDate()}</span>
          <div
            className="photo-indicator"
            title={t('date.photo_count', { count: dayData.count })}
          >
            {dayData.count}
          </div>
        </div>
      );
    }

    // Si no hay datos, mostrar el día normal
    return <span className="day-number">{day.getDate()}</span>;
  };

  const handleLabelSelect = (label) => {
    const updatedLabels = [...(filters.labels || []), label];
    onFilterChange('labels', updatedLabels);
  };

  const handleLabelRemove = (labelToRemove) => {
    const updatedLabels = (filters.labels || []).filter(label =>
      (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
    );
    onFilterChange('labels', updatedLabels);
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = () => {
    return !!(
      filters.startDate ||
      filters.endDate ||
      filters.country ||
      filters.region ||
      filters.county ||
      filters.city ||
      (filters.labels && filters.labels.length > 0)
    );
  };

  // Efecto para detectar cuando se activan o desactivan filtros
  useEffect(() => {
    const hasFilters = hasActiveFilters();

    // Si acaban de aplicar filtros, mostrar el cajón
    if (hasFilters && !showCreateMapSection) {
      // Pequeño retraso para mejorar la animación
      setTimeout(() => {
        setShowCreateMapSection(true);
      }, 300);
    }
    // Si borraron todos los filtros, ocultar el cajón
    else if (!hasFilters && showCreateMapSection) {
      setShowCreateMapSection(false);
    }

    // Guardar estado actual para la próxima comparación
    prevFiltersRef.current = { ...filters };
  }, [filters]);

  // Función para reiniciar filtros
  const handleResetFilters = () => {
    // Reiniciar todos los filtros
    onFilterChange('startDate', '');
    onFilterChange('endDate', '');
    onFilterChange('country', '');
    onFilterChange('region', '');
    onFilterChange('county', '');
    onFilterChange('city', '');
    onFilterChange('labels', []);

    // Ocultar el cajón del botón
    setShowCreateMapSection(false);
  };

  return (
    <div className="search-filters p-3 bg-light border rounded mb-3">
      <h6 className="mb-3">{t('title')}</h6>

      <DropdownProvider>
        <Row>
          {/* COLUMNA IZQUIERDA: Filtros de ubicación y etiquetas */}
          <Col md={5} lg={4}>
            {/* Filtros de ubicación en vertical */}
            <Form.Group className="mb-3">
              <Form.Label>{t('location.country')}</Form.Label>
              <LocationSelector
                options={filteredLocations.countries}
                selectedValue={filters.country || ''}
                onSelect={(value) => handleLocationChange('country', value)}
                placeholder={t('location.select_country')}
                loading={loading.countries}
                noOptionsMessage={t('location.no_countries')}
                icon="globe"
                id="country-selector"
              />
              {loading.countries && <small className="text-muted">{t('location.loading_countries')}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('location.region')}</Form.Label>
              <LocationSelector
                options={filteredLocations.regions}
                selectedValue={filters.region || ''}
                onSelect={(value) => handleLocationChange('region', value)}
                placeholder={t('location.select_region')}
                loading={loading.regions}
                noOptionsMessage={
                  filters.country
                    ? t('location.no_regions')
                    : t('location.select_country_first')
                }
                icon="map"
                id="region-selector"
              />
              {loading.regions && <small className="text-muted">{t('location.loading_regions')}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('location.province')}</Form.Label>
              <LocationSelector
                options={filteredLocations.counties}
                selectedValue={filters.county || ''}
                onSelect={(value) => handleLocationChange('county', value)}
                placeholder={t('location.select_province')}
                loading={loading.counties}
                noOptionsMessage={
                  filters.region
                    ? t('location.no_provinces')
                    : t('location.select_region_first')
                }
                icon="geo-alt-fill"
                id="province-selector"
              />
              {loading.counties && <small className="text-muted">{t('location.loading_provinces')}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('location.city')}</Form.Label>
              <LocationSelector
                options={filteredLocations.cities}
                selectedValue={filters.city || ''}
                onSelect={(value) => handleLocationChange('city', value)}
                placeholder={t('location.select_city')}
                loading={loading.cities}
                noOptionsMessage={
                  filters.county
                    ? t('location.no_cities')
                    : t('location.select_province_first')
                }
                icon="building"
                id="city-selector"
              />
              {loading.cities && <small className="text-muted">{t('location.loading_cities')}</small>}
            </Form.Group>

            {/* Selector de etiquetas */}
            <Form.Group className="mb-3">
              <Form.Label>{t('labels:title')}</Form.Label>
              <div className="w-100">
                <LabelSelector
                  selectedLabels={filters.labels || []}
                  onLabelSelect={handleLabelSelect}
                  onLabelRemove={handleLabelRemove}
                  showPhotoCount={true}
                  id="labels-selector"
                />
              </div>
            </Form.Group>

            {/* Botón de reinicio de filtros */}
            {hasActiveFilters() && (
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  {t('filters:reset_filters')}
                </Button>
              </div>
            )}
          </Col>

          {/* COLUMNA DERECHA: Calendario */}
          <Col md={7} lg={8}>
            <Form.Group>
              <Form.Label>{t('date.title')}</Form.Label>
              <div className="date-range-container">
                {loadingCalendarData && (
                  <div className="calendar-loading-overlay">
                    <div className="text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                <DateRange
                  key={`date-range-${i18n.language}`}
                  editableDateInputs={false}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRangeState}
                  months={2}
                  direction="horizontal"
                  locale={currentLocale}
                  weekdayDisplayFormat="EEEEE"
                  rangeColors={["var(--secondary)"]}
                  showMonthAndYearPickers={true}
                  onShownDateChange={handleShownDateChange}
                  dayContentRenderer={renderDayContent}
                  startDatePlaceholder={currentDatePlaceholder}
                  endDatePlaceholder={currentDatePlaceholder}
                  showSelectionPreview={true}
                  className="w-100"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </DropdownProvider>

      {/* Cajón animado para el botón de crear mapa */}
      {showCreateMapButton && (
        <Collapse in={showCreateMapSection && hasActiveFilters()}>
          <div className="mt-4 border-top pt-4">
            <div className="text-center mb-3">
              <i className="bi bi-map-fill text-primary fs-3"></i>
              <h5 className="mb-0 mt-2">{t('filters:create_map_title')}</h5>
              <p className="text-muted">{t('filters:create_map_description')}</p>
            </div>
            <div className="d-flex justify-content-center">
              <div className="position-relative">
                <Button
                  variant="primary"
                  className="px-4"
                  onClick={() => onOpenCreateMapModal(filters)}
                >
                  <i className="bi bi-globe me-2"></i>
                  {t('filters:create_map_button')}
                </Button>
                <NewFeatureBadge className="position-absolute" rotate={12} />
              </div>
            </div>
          </div>
        </Collapse>
      )}

      {/* Estilo para la animación */}
      <style jsx="true">{`
        .btn-success {
          position: relative;
        }
        
        /* Estilos para los inputs de fecha */
        .rdrDateDisplay {
          display: flex !important;
          cursor: default !important;
        }
        
        /* Eliminar el borde rojo usando border-color personalizado */
        .rdrDateDisplayItem {
          border: 1px solid #ced4da !important;
          background-color: white !important;
          cursor: default !important;
        }
        
        .rdrDateDisplayItemActive {
          border-color: #ced4da !important;
          color: #212529 !important;
          cursor: default !important;
        }
        
        /* Estilo para los inputs dentro de los contenedores */
        .rdrDateInput input {
          color: #212529 !important;
          border: none !important;
          box-shadow: none !important;
          background-color: transparent !important;
          cursor: default !important;
        }
        
        /* Eliminar estilos de foco */
        .rdrDateDisplayItem:focus-within,
        .rdrDateInput input:focus {
          border-color: #ced4da !important;
          box-shadow: none !important;
          outline: none !important;
          cursor: default !important;
        }
        
        /* Clase específica para anular estilos de rojo */
        .rdrDateDisplay,
        .rdrDateDisplayItem,
        .rdrDateDisplayItemActive,
        .rdrDateDisplayWrapper,
        .rdrDateInput {
          border-color: #ced4da !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default SearchFilters; 