import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import PublicMapComponent from './PublicMapComponent';
import { useTranslation } from 'react-i18next';
import '../../pages/PhotoMap.css';
import '../../pages/PublicMap.css';
import { publicMapService } from '../../services/api';
import i18n from '../../i18n';
import { THEMES } from '../../context/ThemeContext';

// Crear una instancia separada para el UI para que no cambie con el idioma del mapa
const uiI18n = i18n.cloneInstance();

// Función de utilidad para calcular si un color es claro
const isLightColor = (hexColor) => {
  // Convertir hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calcular luminosidad (fórmula estándar)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Si es mayor a 0.5, consideramos que es un color claro
  return luminance > 0.5;
};

const MapContent = ({ shareId, mapId, isPreview = false }) => {
  const [mapData, setMapData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [colorPalette, setColorPalette] = useState(null);
  const { t } = useTranslation(['map', 'common']);

  useEffect(() => {
    if (!shareId && !mapId) {
      setNotFound(true);
      return;
    }

    fetchMapData();
  }, [shareId, mapId]);

  // Aplicar el tema al componente completo cuando cambie la paleta de colores
  useEffect(() => {
    if (colorPalette && THEMES[colorPalette]) {
      // Obtener los colores del tema
      const themeData = THEMES[colorPalette];
      const colors = themeData.colors;

      // Aplicar variables CSS a nivel del root (document.documentElement)
      const root = document.documentElement;

      // Colores principales del tema
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--info', colors.info);
      root.style.setProperty('--success', colors.success);
      root.style.setProperty('--warning', colors.warning);
      root.style.setProperty('--danger', colors.danger);
      root.style.setProperty('--light', colors.light);
      root.style.setProperty('--dark', colors.dark);

      // Agregar fondo sutil usando el color light con transparencia
      const bgTint = colors.light + '80'; // 80 es opacidad 50%
      root.style.setProperty('--page-background', bgTint);

      // Determinar color de texto para botones basado en el color de fondo
      const successTextColor = isLightColor(colors.success) ? '#000' : '#fff';
      const dangerTextColor = isLightColor(colors.danger) ? '#000' : '#fff';

      root.style.setProperty('--btn-success-text', successTextColor);
      root.style.setProperty('--btn-danger-text', dangerTextColor);
    }

    // Limpieza: restaurar variables CSS cuando se desmonte el componente
    return () => {
      // Solo hacemos limpieza si encontramos un tema original almacenado
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && THEMES[savedTheme]) {
        const originalTheme = THEMES[savedTheme];
        const root = document.documentElement;

        // Restaurar variables CSS al tema guardado por el usuario
        root.style.setProperty('--primary', originalTheme.colors.primary);
        root.style.setProperty('--secondary', originalTheme.colors.secondary);
        root.style.setProperty('--info', originalTheme.colors.info);
        root.style.setProperty('--success', originalTheme.colors.success);
        root.style.setProperty('--warning', originalTheme.colors.warning);
        root.style.setProperty('--danger', originalTheme.colors.danger);
        root.style.setProperty('--light', originalTheme.colors.light);
        root.style.setProperty('--dark', originalTheme.colors.dark);

        // Restaurar fondo
        const bgTint = originalTheme.colors.light + '80';
        root.style.setProperty('--page-background', bgTint);
      }
    };
  }, [colorPalette]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      let response;

      // Decidir qué endpoint usar basado en si tenemos shareId o mapId
      if (mapId) {
        // Usar el endpoint privado por ID
        response = await publicMapService.getMapById(mapId);
      } else {
        // Usar el endpoint público por shareId
        response = await publicMapService.getPublicMap(shareId);
      }

      const mapData = response.data.data.map;

      // Cambiar el idioma si viene especificado en la respuesta - Sólo para el i18n del mapa, no el de la UI
      if (mapData.language && ['es', 'en'].includes(mapData.language)) {
        console.log(`🌐 Cambiando idioma del mapa a: ${mapData.language}`);
        i18n.changeLanguage(mapData.language);
      }

      // Extraer la paleta de colores si está definida
      if (mapData.colorPalette) {
        console.log(`🎨 Aplicando paleta de colores: ${mapData.colorPalette}`);
        setColorPalette(mapData.colorPalette);
      }

      setMapData(mapData);

      // Una vez que tenemos los datos del mapa, obtenemos las fotos
      fetchPhotos();
    } catch (error) {
      console.error('Error al cargar los datos del mapa:', error);

      // Si el error es 404, redirigimos a la página de error
      if (error.response && error.response.status === 404) {
        setNotFound(true);
      } else {
        setError('No pudimos cargar el mapa. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    }
  };

  const fetchPhotos = async () => {
    try {
      let response;

      // Decidir qué endpoint usar basado en si tenemos shareId o mapId
      if (mapId) {
        // Usar el endpoint privado por ID
        response = await publicMapService.getMapPhotosById(mapId);
      } else {
        // Usar el endpoint público por shareId
        response = await publicMapService.getPublicMapPhotos(shareId);
      }

      setPhotos(response.data.data.photos || []);
    } catch (error) {
      console.error('Error al cargar las fotos del mapa:', error);
      setError('No pudimos cargar las fotos. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Si no se encuentra el mapa, redirigimos a la página 404
  if (notFound) {
    return <Navigate to="/not-found" />;
  }

  return (
    <Container fluid className={`public-map-container py-5 ${colorPalette ? `theme-${colorPalette}` : ''}`}>
      <Row className="mb-4">
        <Col>
          {loading ? (
            <>
              <div className="skeleton-title mb-3" style={{ width: '40%', height: '2rem' }}></div>
              <div className="skeleton-label" style={{ width: '70%', height: '1.5rem' }}></div>
            </>
          ) : (
            <>
              <h1 className="public-map-title">
                {mapData ? (
                  <>
                    {mapData.title}
                    {isPreview && (
                      <span className="ms-2 text-muted fs-5">
                        {uiI18n.language === 'es' ? '(Vista previa)' : '(Preview)'}
                      </span>
                    )}
                  </>
                ) : (
                  'Mapa Fotográfico Público'
                )}
              </h1>
              <p className="public-map-subtitle lead">
                {mapData ? mapData.description : 'Cargando descripción...'}
              </p>
            </>
          )}
        </Col>
      </Row>

      <Card className="shadow mb-5">
        <Card.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : loading ? (
            <div className="skeleton-map">
              <div className="skeleton-map-overlay">
                <i className="bi bi-map"></i>
                <p>{t('common:loading.map')}</p>
              </div>
            </div>
          ) : (
            <>
              <PublicMapComponent
                photos={photos}
                userName={mapData.userName}
                loading={loading}
                colorPalette={colorPalette}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MapContent; 