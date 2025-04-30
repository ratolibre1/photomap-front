import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { THEMES } from '../../context/ThemeContext';

// Corregir el ícono de marcador predeterminado de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationPickerModal = ({ show, onHide, initialCoordinates, onConfirm, photoUrl }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const { t } = useTranslation(['photos', 'map', 'common']);
  const [coordinates, setCoordinates] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'your_maptiler_api_key';

  // Estilos del mapa con traducciones - solo Streets, Hybrid, Outdoor en ese orden
  const mapStyles = {
    streets: {
      title: t('map:mapStyles.streets'),
      url: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${apiKey}`
    },
    hybrid: {
      title: t('map:mapStyles.hybrid'),
      url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${apiKey}`
    },
    outdoor: {
      title: t('map:mapStyles.outdoor'),
      url: `https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=${apiKey}`
    }
  };

  // Crear un marker icon personalizado que use la foto
  const createCustomMarkerIcon = () => {
    // Determinar si tenemos una foto para mostrar o no
    const thumbnailContent = photoUrl
      ? `<img src="${photoUrl}" alt="" class="marker-thumbnail">`
      : `<div class="marker-thumbnail no-image"><i class="bi bi-camera"></i></div>`;

    return L.divIcon({
      html: `
        <div class="marker-container">
          <div class="marker-pin">
            <div class="marker-thumbnail-container">
              ${thumbnailContent}
            </div>
          </div>
        </div>
      `,
      className: 'custom-photo-marker',
      iconSize: [40, 60],
      iconAnchor: [25, 55],
    });
  };

  // Inicializar el mapa cuando el modal se muestra
  useEffect(() => {
    if (show && mapRef.current && !mapInstanceRef.current) {
      // Crear instancia del mapa
      const map = L.map(mapRef.current).setView([-33.45, -70.67], 5);

      // Crear las capas base para cada estilo
      const baseLayers = {};
      for (const [_, style] of Object.entries(mapStyles)) {
        baseLayers[style.title] = L.tileLayer(style.url, {
          attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1
        });
      }

      // Agregar la capa inicial (Streets por defecto)
      baseLayers[mapStyles.streets.title].addTo(map);

      // Agregar el control para cambiar entre capas
      L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map);

      // Agregar botón de geolocalización
      createLocationButton().addTo(map);

      // Guardar referencia al mapa
      mapInstanceRef.current = map;

      // Configurar el evento de clic en el mapa
      map.on('click', handleMapClick);

      // Si hay coordenadas iniciales, mostrar el marcador
      if (initialCoordinates) {
        try {
          // Intentar parsear las coordenadas iniciales (formato "lat, lng")
          const [lat, lng] = initialCoordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            setMarker(lat, lng);
            map.setView([lat, lng], 14);
            setCoordinates(`${lat}, ${lng}`);
          }
        } catch (error) {
          console.error('Error parsing initial coordinates:', error);
        }
      }
    }

    // Cleanup cuando el modal se cierra
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [show, initialCoordinates]);

  // Función para crear el botón de localización
  const createLocationButton = () => {
    const locationButton = L.control({ position: 'topright' });
    locationButton.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        <a href="#" title="${t('map:location.findMyLocation')}" class="leaflet-control-locate leaflet-bar-part">
          <i class="bi bi-person-circle"></i>
        </a>
      `;

      const link = div.querySelector('a');
      L.DomEvent.disableClickPropagation(link);
      L.DomEvent.on(link, 'click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        findUserLocation();
        return false;
      });

      return div;
    };
    return locationButton;
  };

  // Función para encontrar la ubicación del usuario
  const findUserLocation = () => {
    if (navigator.geolocation) {
      setSearching(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Actualizar el mapa y el marcador
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 14);
            setMarker(latitude, longitude);
            setCoordinates(`${latitude}, ${longitude}`);
          }

          setSearching(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(t('map:location.errors.unknown'));
          setSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert(t('map:location.errors.unavailable'));
    }
  };

  // Manejar clic en el mapa
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarker(lat, lng);
    setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  // Establecer un marcador en la ubicación especificada
  const setMarker = (lat, lng) => {
    // Eliminar marcador existente si hay uno
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Crear el ícono personalizado con la foto
    const customIcon = createCustomMarkerIcon();

    // Crear y añadir un nuevo marcador con el icono personalizado
    const marker = L.marker([lat, lng], {
      draggable: true, // Hacer el marcador arrastrable
      icon: customIcon
    }).addTo(mapInstanceRef.current);

    // Manejar el evento de finalización de arrastre
    marker.on('dragend', function (event) {
      const marker = event.target;
      const position = marker.getLatLng();
      setCoordinates(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
    });

    // Guardar referencia al marcador
    markerRef.current = marker;
  };

  // Estilos CSS para el marcador personalizado
  const markerStyle = `
    .custom-photo-marker {
      background: transparent;
      border: none;
    }
    .marker-container {
      position: relative;
      width: 40px;
      height: 48px;
    }
    .marker-pin {
      width: 50px;
      height: 50px;
      background: var(--primary, #0d6efd);
      border: 2px solid #fff;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 3px 5px rgba(0,0,0,0.3);
    }
    .marker-thumbnail-container {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marker-thumbnail {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      background-color: white;
    }
    .marker-thumbnail.no-image {
      background: #f8f9fa;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marker-thumbnail.no-image i {
      font-size: 20px;
    }
  `;

  // Manejar cambio en el campo de coordenadas
  const handleCoordinatesChange = (e) => {
    setCoordinates(e.target.value);
  };

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    setSearching(true);

    try {
      // Usar Nominatim para búsqueda de lugares (API gratuita de OpenStreetMap)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      setSearchResults(data);

      // Si hay resultados, mostrar en el mapa
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14);
          setMarker(latitude, longitude);
          setCoordinates(`${latitude}, ${longitude}`);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setSearching(false);
    }
  };

  // Manejar clic en un resultado de búsqueda
  const handleResultClick = (lat, lon) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 14);
      setMarker(latitude, longitude);
      setCoordinates(`${latitude}, ${longitude}`);
    }

    // Limpiar resultados de búsqueda
    setSearchResults([]);
    setSearchTerm('');
  };

  // Manejar confirmación
  const handleConfirm = () => {
    onConfirm(coordinates);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{t('photos:edit.location_picker')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Estilos CSS para el marcador */}
        <style>{markerStyle}</style>

        {/* Campo de búsqueda */}
        <Form onSubmit={handleSearch} className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder={t('photos:edit.search_location')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button
              variant="primary"
              type="submit"
              disabled={searching || !searchTerm.trim()}
            >
              {searching ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-search"></i>
              )}
            </Button>
          </InputGroup>
        </Form>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mb-3 border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <p className="mb-2 fw-bold">{t('photos:edit.search_results')}:</p>
            <ul className="list-group">
              {searchResults.map((result, index) => (
                <li
                  key={index}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleResultClick(result.lat, result.lon)}
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contenedor del mapa */}
        <div
          ref={mapRef}
          style={{ height: '400px', width: '100%', borderRadius: '4px', marginBottom: '1rem' }}
        ></div>

        {/* Campo de coordenadas */}
        <Form.Group className="mb-3">
          <Form.Label>{t('photos:edit.coordinates')}</Form.Label>
          <Form.Control
            type="text"
            value={coordinates}
            onChange={handleCoordinatesChange}
            placeholder={t('photos:edit.coordinates_placeholder')}
          />
          <Form.Text className="text-muted">
            {t('photos:edit.coordinates_help')}
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('common:buttons.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!coordinates.trim()}
        >
          {t('common:buttons.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationPickerModal; 