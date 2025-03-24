import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import MapComponent from '../components/map/MapComponent';
import SearchFilters from '../components/gallery/SearchFilters';
import { photoService } from '../services/api';

const PhotoMap = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    country: '',
    region: '',
    county: '',
    city: '',
    labels: [],
    isPublic: true // Por defecto mostrar solo fotos públicas
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [filters]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);

      // Crear objeto base con filtros
      const queryParams = {};

      // Añadir filtros de fecha correctamente
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      // Agregar IDs de etiquetas si existen
      if (filters.labels && filters.labels.length > 0) {
        queryParams.labels = filters.labels.map(label => label._id || label.id);
      }

      // Agregar filtros de ubicación - asegurarse de que se envíen correctamente
      if (filters.country) queryParams.countryId = filters.country;
      if (filters.region) queryParams.regionId = filters.region;
      if (filters.county) queryParams.countyId = filters.county;
      if (filters.city) queryParams.cityId = filters.city;

      // Agregar filtro de visibilidad pública
      if (filters.isPublic !== undefined) {
        queryParams.isPublic = filters.isPublic;
      }

      queryParams.limit = 1000;

      console.log('🔍 Filtros de búsqueda enviados:', queryParams);
      console.log('📊 Estado actual de filters:', filters);

      const response = await photoService.getPhotos(queryParams);
      setPhotos(response.data.data.photos || []);
    } catch (error) {
      console.error('Error al cargar fotos para el mapa:', error);
      setError('No pudimos cargar el mapa. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    console.log(`💡 Actualizando filtro: ${field} = `, value);

    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value
    }));

    // Mostrar el estado actualizado (aunque esto capturará el estado anterior)
    console.log('💽 Estado de filtros después de actualizar:', field, value);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Mapa de Recuerdos</h1>
          <p className="text-muted">Visualiza tus fotos distribuidas geográficamente</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="py-3">
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <MapComponent
              photos={photos}
              loading={loading}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PhotoMap; 