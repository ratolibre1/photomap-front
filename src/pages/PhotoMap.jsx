import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import MapComponent from '../components/map/MapComponent';
import SearchBar from '../components/gallery/SearchBar';
import AdvancedFilters from '../components/gallery/AdvancedFilters';
import { photoService } from '../services/api';

const PhotoMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    country: '',
    region: '',
    county: '',
    city: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [searchTerm, filters]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);

      // Crear objeto base con filtros no relacionados con ubicación
      const searchFilters = {
        searchTerm,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        isPublic: true,
        limit: 1000,
      };

      // Agregar solo el filtro de ubicación más específico que tenga valor
      // El orden jerárquico es: city > county > region > country
      if (filters.city) {
        searchFilters.cityId = filters.city;
      } else if (filters.county) {
        searchFilters.countyId = filters.county;
      } else if (filters.region) {
        searchFilters.regionId = filters.region;
      } else if (filters.country) {
        searchFilters.countryId = filters.country;
      }

      console.log('🔍 Filtros de búsqueda enviados:', searchFilters);
      const response = await photoService.getPhotos(searchFilters);
      setPhotos(response.data.data.photos || []);
    } catch (error) {
      console.error('Error al cargar fotos para el mapa:', error);
      setError('No pudimos cargar el mapa. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAdvancedFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
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
              <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
              />

              {showAdvancedFilters && (
                <AdvancedFilters
                  filters={filters}
                  onFilterChange={handleAdvancedFilterChange}
                />
              )}
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