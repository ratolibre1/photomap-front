import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useLocation } from '../../context/LocationContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilos principales
import 'react-date-range/dist/theme/default.css'; // Tema por defecto
import es from 'date-fns/locale/es'; // Importar localización española
import { useTranslation } from 'react-i18next';
import { photoService } from '../../services/api';
import LabelSelector from '../common/LabelSelector';

const SearchFilters = ({ filters, onFilterChange }) => {
  // Obtenemos funciones y datos del contexto de ubicación
  const { locations: filteredLocations, loading, selectLocation } = useLocation();
  const { t, i18n } = useTranslation(['filters', 'labels']);

  // Estado para controlar si se ha inicializado el calendario
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  // Estado para manejar el rango de fechas con la fecha actual
  const [dateRangeState, setDateRangeState] = useState(() => {
    const today = new Date();
    return [{
      startDate: today,
      endDate: today,
      key: 'selection'
    }];
  });

  // Nuevo estado para almacenar datos del calendario
  const [calendarData, setCalendarData] = useState([]);

  // Formatear la fecha actual para usarla como placeholder
  const formatCurrentDate = () => {
    const today = new Date();
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    let formattedDate = today.toLocaleDateString(i18n.language, options);
    formattedDate = formattedDate.replace(/^[A-Z]/, match => match.toLowerCase());
    return formattedDate;
  };

  // Guardar el formato para usarlo en los placeholders
  const currentDatePlaceholder = formatCurrentDate();

  const handleDateRangeChange = (item) => {
    // Si es la primera interacción, inicializamos el estado
    if (!calendarInitialized) {
      setCalendarInitialized(true);
    }

    // Actualizamos el estado con la selección del usuario
    setDateRangeState([item.selection]);

    // Notificamos al componente padre - CORREGIDO: enviar cada campo por separado
    const startDate = item.selection.startDate ? item.selection.startDate.toISOString().split('T')[0] : '';
    const endDate = item.selection.endDate ? item.selection.endDate.toISOString().split('T')[0] : '';

    // Actualizar cada campo individualmente
    onFilterChange('startDate', startDate);
    onFilterChange('endDate', endDate);
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
    // 'date' representa el primer mes visible
    const firstMonth = new Date(date);
    // El segundo mes visible es el mes siguiente
    const secondMonth = new Date(date);
    secondMonth.setMonth(secondMonth.getMonth() + 1);

    try {
      // Obtener datos del calendario para el primer mes visible
      const month = firstMonth.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
      const year = firstMonth.getFullYear();

      const response = await photoService.getPhotoCalendar(month, year);
      const calendarData = response.data.data.calendar || [];

      setCalendarData(calendarData);
      console.log('Datos del calendario:', calendarData);
    } catch (error) {
      console.error('Error al cargar datos del calendario:', error);
    }
  };

  // Función para renderizar el contenido personalizado de los días
  const renderDayContent = (day) => {
    // Formatear la fecha al formato YYYY-MM-DD para comparar con los datos del backend
    const dateString = day.toISOString().split('T')[0];

    // Buscar si hay datos para esta fecha
    const dayData = calendarData.find(item => item.date === dateString);

    if (dayData) {
      // Si hay fotos en esta fecha, mostrar un indicador
      return (
        <div className="calendar-day-with-photos">
          <span>{day.getDate()}</span>
          <div
            className="photo-indicator"
            title={`${dayData.count} foto${dayData.count !== 1 ? 's' : ''}`}
          >
            {dayData.count}
          </div>
        </div>
      );
    }

    // Si no hay datos, mostrar el día normal
    return <span>{day.getDate()}</span>;
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
        </Col>

        {/* COLUMNA DERECHA: Calendario */}
        <Col md={7} lg={8}>
          <Form.Group>
            <Form.Label>{t('date.title')}</Form.Label>
            <div className="date-range-container">
              <DateRange
                editableDateInputs={true}
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRangeState}
                months={2}
                direction="horizontal"
                locale={i18n.language.startsWith('es') ? es : undefined}
                weekdayDisplayFormat="EEEEE"
                rangeColors={["var(--secondary)"]}
                showMonthAndYearPickers={true}
                onShownDateChange={handleShownDateChange}
                dayContentRenderer={renderDayContent}
                startDatePlaceholder={currentDatePlaceholder}
                endDatePlaceholder={currentDatePlaceholder}
                showSelectionPreview={false}
                className="w-100"
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Estilos para ajustar el calendario */}
      <style jsx>{`
        .date-range-container {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
        }

        .calendar-day-with-photos {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .photo-indicator {
          font-size: 0.7em;
          background-color: var(--bs-secondary);
          color: white;
          border-radius: 10px;
          padding: 1px 4px;
          margin-top: 2px;
          line-height: 1;
        }

        /* Ajustes para el calendario */
        :global(.rdrCalendarWrapper) {
          width: 100% !important;
          font-size: 14px !important;
        }

        :global(.rdrMonth) {
          width: 100% !important;
          max-width: none !important;
        }

        :global(.rdrMonthAndYearWrapper) {
          padding-top: 5px !important;
          height: auto !important;
        }

        :global(.rdrMonthAndYearPickers select) {
          padding: 5px 25px 5px 10px !important;
        }

        :global(.rdrNextPrevButton) {
          margin: 0 5px !important;
        }

        :global(.rdrDateDisplayWrapper) {
          background-color: transparent !important;
        }

        :global(.rdrDateDisplay) {
          margin: 0.5rem !important;
        }

        :global(.rdrDateDisplayItem) {
          border-radius: 4px !important;
          background-color: white !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
        }

        :global(.rdrDateDisplayItemActive) {
          border-color: var(--bs-secondary) !important;
        }

        :global(.rdrDayToday .rdrDayNumber span:after) {
          background: var(--bs-secondary) !important;
        }
      `}</style>
    </div>
  );
};

export default SearchFilters; 