import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useLocation } from '../../context/LocationContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilos principales
import 'react-date-range/dist/theme/default.css'; // Tema por defecto
import { addDays } from 'date-fns'; // Para operaciones con fechas
import es from 'date-fns/locale/es'; // Importar localización española

const AdvancedFilters = ({ filters, onFilterChange }) => {
  const { locations, loading, selectedIds, selectLocation } = useLocation();

  // Estado para manejar el rango de fechas
  const [dateRangeState, setDateRangeState] = useState([
    {
      startDate: filters.startDate ? new Date(filters.startDate) : null,
      endDate: filters.endDate ? new Date(filters.endDate) : null,
      key: 'selection'
    }
  ]);

  // Manejar cambios en el rango de fechas
  const handleDateRangeChange = (item) => {
    setDateRangeState([item.selection]);

    // Actualizar los filtros del componente padre
    onFilterChange({
      startDate: item.selection.startDate ? item.selection.startDate.toISOString().split('T')[0] : '',
      endDate: item.selection.endDate ? item.selection.endDate.toISOString().split('T')[0] : ''
    });
  };

  const handleChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  // Función que maneja cambios en los selectores de ubicación
  const handleLocationChange = (field, value) => {
    // Actualizar el filtro para el componente padre
    handleChange(field, value);

    // Actualizar las selecciones en el contexto para filtrado en cascada
    switch (field) {
      case 'country':
        selectLocation('countryId', value);
        break;
      case 'region':
        selectLocation('regionId', value);
        break;
      case 'county':
        selectLocation('countyId', value);
        break;
      case 'city':
        selectLocation('cityId', value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="advanced-filters p-3 bg-light border rounded mb-3">
      <h6 className="mb-3">Filtros Avanzados</h6>

      {/* Selector de rango de fechas */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Rango de fechas</Form.Label>
            <div className="date-range-container">
              <DateRange
                editableDateInputs={true}
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRangeState}
                months={2}
                direction="horizontal"
                locale={es}
                weekdayDisplayFormat="EEEEE"
                rangeColors={["var(--secondary)"]}
                showMonthAndYearPickers={true}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>País</Form.Label>
            <Form.Select
              value={filters.country || ''}
              onChange={(e) => handleLocationChange('country', e.target.value)}
            >
              <option value="">Seleccionar país</option>
              {locations.countries.map(country => (
                <option key={country.id || country._id} value={country.id || country._id}>
                  {country.name}
                </option>
              ))}
            </Form.Select>
            {loading.countries && <small className="text-muted">Cargando países...</small>}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Región</Form.Label>
            <Form.Select
              value={filters.region || ''}
              onChange={(e) => handleLocationChange('region', e.target.value)}
            >
              <option value="">Seleccionar región</option>
              {locations.regions.map(region => (
                <option key={region.id || region._id} value={region.id || region._id}>
                  {region.name}
                </option>
              ))}
            </Form.Select>
            {loading.regions && <small className="text-muted">Cargando regiones...</small>}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Provincia</Form.Label>
            <Form.Select
              value={filters.county || ''}
              onChange={(e) => handleLocationChange('county', e.target.value)}
            >
              <option value="">Seleccionar provincia</option>
              {locations.counties.map(county => (
                <option key={county.id || county._id} value={county.id || county._id}>
                  {county.name}
                </option>
              ))}
            </Form.Select>
            {loading.counties && <small className="text-muted">Cargando provincias...</small>}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Ciudad</Form.Label>
            <Form.Select
              value={filters.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
            >
              <option value="">Seleccionar ciudad</option>
              {locations.cities.map(city => (
                <option key={city.id || city._id} value={city.id || city._id}>
                  {city.name}
                </option>
              ))}
            </Form.Select>
            {loading.cities && <small className="text-muted">Cargando ciudades...</small>}
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedFilters; 