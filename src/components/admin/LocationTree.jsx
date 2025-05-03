import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { locationService } from '../../services/api';
import { useTranslation } from 'react-i18next';

const LocationTree = () => {
  const { t } = useTranslation(['admin']);
  const [locationTree, setLocationTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Función para expandir todos los nodos
  const expandAllNodes = (locations) => {
    const expanded = {};

    // Función recursiva para procesar cada nivel
    const processItems = (items, type) => {
      if (!Array.isArray(items)) return;

      items.forEach(item => {
        // Marcar este ítem como expandido
        expanded[`${type}_${item._id}`] = true;

        // Procesar hijos según el tipo
        if (type === 'country' && Array.isArray(item.regions)) {
          processItems(item.regions, 'region');
        } else if (type === 'region' && Array.isArray(item.counties)) {
          processItems(item.counties, 'county');
        } else if (type === 'county' && Array.isArray(item.cities)) {
          processItems(item.cities, 'city');
        }
      });
    };

    // Comenzar con los países
    processItems(locations, 'country');
    return expanded;
  };

  useEffect(() => {
    const fetchLocationTree = async () => {
      try {
        setLoading(true);
        const response = await locationService.getLocationTree();
        console.log('Respuesta completa:', response.data);

        // La respuesta tiene formato { status: "success", data: [...] }
        const locationData = response.data.data || [];

        // Asegurarse de que sea un array
        const data = Array.isArray(locationData) ? locationData : [];
        console.log('Datos de ubicaciones procesados:', data);

        // Expandir todos los nodos por defecto
        setExpandedItems(expandAllNodes(data));
        setLocationTree(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el árbol de ubicaciones:', error);
        setError('No se pudo cargar la estructura de ubicaciones. Intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchLocationTree();
  }, []);

  // Función para alternar la expansión de un ítem
  const toggleExpand = (itemType, itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${itemType}_${itemId}`]: !prev[`${itemType}_${itemId}`]
    }));
  };

  // Función para obtener el ícono según el tipo de ubicación
  const getLocationIcon = (locationType) => {
    switch (locationType) {
      case 'country':
        return <i className="bi bi-globe me-2"></i>;
      case 'region':
        return <i className="bi bi-map me-2"></i>;
      case 'county':
        return <i className="bi bi-building me-2"></i>;
      case 'city':
        return <i className="bi bi-houses me-2"></i>;
      default:
        return null;
    }
  };

  // Renderizado recursivo de elementos
  const renderLocationItem = (item, type) => {
    if (!item || typeof item !== 'object') return null;

    const isExpanded = expandedItems[`${type}_${item._id}`];
    const hasChildren = (type === 'country' && Array.isArray(item.regions) && item.regions.length > 0) ||
      (type === 'region' && Array.isArray(item.counties) && item.counties.length > 0) ||
      (type === 'county' && Array.isArray(item.cities) && item.cities.length > 0);

    return (
      <ListGroup.Item key={item._id} className="border-0 py-2">
        <div
          className={`d-flex align-items-center ${hasChildren ? 'cursor-pointer' : ''}`}
          onClick={() => hasChildren && toggleExpand(type, item._id)}
        >
          {hasChildren && (
            <span className="me-1">
              {isExpanded ? <i className="bi bi-chevron-down"></i> : <i className="bi bi-chevron-right"></i>}
            </span>
          )}
          {getLocationIcon(type)}
          <div className="d-flex align-items-center">
            <span>{item.name}</span>

            {/* Indicador de visibilidad */}
            {item.visible === true && (
              <span
                className="badge bg-primary text-white rounded-pill ms-2"
                style={{ backgroundColor: 'var(--bs-primary) !important' }}
                title="Ubicación visible"
              >
                <i className="bi bi-eye"></i>
              </span>
            )}

            {/* Contador de fotos */}
            {item.photoCount !== undefined && (
              <span
                className="badge bg-secondary text-white rounded-pill ms-2"
                style={{ backgroundColor: 'var(--bs-secondary) !important' }}
              >
                {item.photoCount}
              </span>
            )}

            <span style={{ fontSize: '0.75rem', color: '#6c757d', marginLeft: '0.5rem' }}>
              {item._id}
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <ListGroup className="ms-4 mt-2 border-start">
            {type === 'country' && Array.isArray(item.regions) && item.regions.map(region => renderLocationItem(region, 'region'))}
            {type === 'region' && Array.isArray(item.counties) && item.counties.map(county => renderLocationItem(county, 'county'))}
            {type === 'county' && Array.isArray(item.cities) && item.cities.map(city => renderLocationItem(city, 'city'))}
          </ListGroup>
        )}
      </ListGroup.Item>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">{t('locations.treeTitle', 'Árbol de Ubicaciones')}</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !Array.isArray(locationTree) || locationTree.length === 0 ? (
          <Alert variant="info">{t('locations.noData', 'No hay datos de ubicaciones disponibles')}</Alert>
        ) : (
          <ListGroup variant="flush">
            {locationTree.map(country => renderLocationItem(country, 'country'))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default LocationTree; 