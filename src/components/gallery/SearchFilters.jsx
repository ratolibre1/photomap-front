import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useLocation } from '../../context/LocationContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilos principales
import 'react-date-range/dist/theme/default.css'; // Tema por defecto
import es from 'date-fns/locale/es'; // Importar localización española
import enUS from 'date-fns/locale/en-US'; // Importar localización inglesa
import { useTranslation } from 'react-i18next';
import { photoService } from '../../services/api';
import LabelSelector from '../common/LabelSelector';

const SearchFilters = ({ filters, onFilterChange }) => {
  // Obtenemos funciones y datos del contexto de ubicación
  const { locations: filteredLocations, loading, selectLocation } = useLocation();
  const { t, i18n } = useTranslation(['filters', 'labels']);

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

      // El backend ya devuelve los datos para los dos meses visibles
      const response = await photoService.getPhotoCalendar(month, year);
      const calendarData = response.data.data.calendar || [];

      setCalendarData(calendarData);
      console.log('Datos del calendario cargados:', calendarData);
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

  // Función para reiniciar todos los filtros
  const handleResetFilters = () => {
    // Reiniciar ubicación
    onFilterChange('country', '');
    onFilterChange('region', '');
    onFilterChange('county', '');
    onFilterChange('city', '');

    // Reiniciar etiquetas
    onFilterChange('labels', []);

    // Reiniciar fechas sin establecer valores
    onFilterChange('startDate', '');
    onFilterChange('endDate', '');

    // Reiniciar el estado del DateRange con la fecha actual pero sin selección
    const today = new Date();
    setDateRangeState([{
      startDate: null,
      endDate: null,
      key: 'selection'
    }]);

    // Recargar datos del calendario con la fecha actual
    loadCalendarData(today);
  };

  return (
    <div className="search-filters p-3 bg-light border rounded mb-3">
      <h6 className="mb-3">{t('title')}</h6>

      <Row>
        {/* COLUMNA IZQUIERDA: Filtros de ubicación y etiquetas */}
        <Col md={5} lg={4}>
          {/* Filtros de ubicación en vertical */}
          <Form.Group className="mb-3">
            <Form.Label>{t('location.country')}</Form.Label>
            <Form.Select
              value={filters.country || ''}
              onChange={(e) => handleLocationChange('country', e.target.value)}
            >
              <option value="">{t('location.select_country')}</option>
              {filteredLocations.countries.map(country => (
                <option key={country.id || country._id} value={country.id || country._id}>
                  {country.name}
                </option>
              ))}
            </Form.Select>
            {loading.countries && <small className="text-muted">{t('location.loading_countries')}</small>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.region')}</Form.Label>
            <Form.Select
              value={filters.region || ''}
              onChange={(e) => handleLocationChange('region', e.target.value)}
            >
              <option value="">{t('location.select_region')}</option>
              {filteredLocations.regions.map(region => (
                <option key={region.id || region._id} value={region.id || region._id}>
                  {region.name}
                </option>
              ))}
            </Form.Select>
            {loading.regions && <small className="text-muted">{t('location.loading_regions')}</small>}
            {filteredLocations.regions.length === 0 && filters.country &&
              <small className="text-muted">{t('location.no_regions')}</small>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.province')}</Form.Label>
            <Form.Select
              value={filters.county || ''}
              onChange={(e) => handleLocationChange('county', e.target.value)}
            >
              <option value="">{t('location.select_province')}</option>
              {filteredLocations.counties.map(county => (
                <option key={county.id || county._id} value={county.id || county._id}>
                  {county.name}
                </option>
              ))}
            </Form.Select>
            {loading.counties && <small className="text-muted">{t('location.loading_provinces')}</small>}
            {filteredLocations.counties.length === 0 && filters.region &&
              <small className="text-muted">{t('location.no_provinces')}</small>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.city')}</Form.Label>
            <Form.Select
              value={filters.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
            >
              <option value="">{t('location.select_city')}</option>
              {filteredLocations.cities.map(city => (
                <option key={city.id || city._id} value={city.id || city._id}>
                  {city.name}
                </option>
              ))}
            </Form.Select>
            {loading.cities && <small className="text-muted">{t('location.loading_cities')}</small>}
            {filteredLocations.cities.length === 0 && filters.county &&
              <small className="text-muted">{t('location.no_cities')}</small>}
          </Form.Group>

          {/* Selector de etiquetas */}
          <Form.Group className="mb-3">
            <Form.Label>{t('labels:title')}</Form.Label>
            <LabelSelector
              selectedLabels={filters.labels || []}
              onLabelSelect={handleLabelSelect}
              onLabelRemove={handleLabelRemove}
              showPhotoCount={true}
            />
          </Form.Group>

          {/* Botón de reinicio de filtros */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mb-3"
            onClick={handleResetFilters}
          >
            {t('reset_filters')}
          </Button>
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
                editableDateInputs={true}
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
    </div>
  );
};

export default SearchFilters; 