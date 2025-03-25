import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../../context/AuthContext'; // Importar el contexto de autenticación

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

const MapComponent = ({ photos, loading }) => {
  const { t } = useTranslation(['map', 'common']);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationLoading, setUserLocationLoading] = useState(false);
  const { user } = useAuth(); // Obtener el usuario actual

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Crear el mapa
      const map = L.map(mapRef.current).setView([-33.45, -70.67], 5); // Default: Santiago, Chile

      // Agregar capa de mosaicos de MapTiler
      const apiKey = 'vKvwcKb5zvFpvEHcTNBv'; // Reemplaza con tu clave API de MapTiler

      // Definir los diferentes estilos de mapa disponibles
      const mapStyles = {
        voyager: {
          title: t('layers.voyager'),
          url: `https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key=${apiKey}`
        },
        streets: {
          title: t('layers.streets'),
          url: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${apiKey}`
        },
        basic: {
          title: t('layers.basic'),
          url: `https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=${apiKey}`
        },
        outdoor: {
          title: t('layers.outdoor'),
          url: `https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=${apiKey}`
        },
        toner: {
          title: t('layers.toner'),
          url: `https://api.maptiler.com/maps/toner/{z}/{x}/{y}.png?key=${apiKey}`
        }
      };

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

      // Agregar la capa inicial (Voyager por defecto)
      baseLayers[t('layers.voyager')].addTo(map);

      // Agregar el control para cambiar entre capas
      L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map);

      // Guardar referencia al mapa
      mapInstanceRef.current = map;

      // Crear capa para marcadores de fotos
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Agregar botón de localización
      const locationButton = L.control({ position: 'topright' });
      locationButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
          <a href="#" title="${t('location.button_title')}" class="leaflet-control-locate leaflet-bar-part">
            <i class="bi bi-person-circle"></i>
          </a>
        `;

        // Prevenir que el clic se propague al mapa para evitar comportamientos inesperados
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
      locationButton.addTo(map);
    }

    return () => {
      // Limpiar el mapa al desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [user, t]); // Agregar t como dependencia

  // Función para encontrar la ubicación del usuario
  const findUserLocation = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!mapInstanceRef.current) return;

    console.log("🔍 Iniciando búsqueda de ubicación...");
    setUserLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Ubicación encontrada:", position.coords);
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        // Centrar mapa en ubicación del usuario con animación
        console.log("🗺️ Centrando mapa en:", latitude, longitude);

        // Forzar navegación y centrado con timeout
        setTimeout(() => {
          if (mapInstanceRef.current) {
            // Primero hacer zoom
            mapInstanceRef.current.setZoom(16);

            // Luego centrar en la ubicación
            mapInstanceRef.current.panTo([latitude, longitude], {
              animate: true,
              duration: 1
            });

            console.log("📍 Mapa centrado en coordenadas");
          }
        }, 100);

        // Obtener la inicial del usuario de forma segura
        const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : '👤';

        // Limpiar marcadores de usuario anteriores
        if (markersLayerRef.current) {
          const userMarkers = document.querySelectorAll('.custom-user-marker');
          userMarkers.forEach(marker => {
            const parent = marker.parentElement;
            if (parent && parent.parentElement) {
              parent.parentElement.removeChild(parent);
            }
          });
        }

        // Añadir marcador para el usuario
        const userMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-user-marker',
            html: `
              <div class="marker-container">
                <div class="marker-pin user-pin">
                  <div class="marker-thumbnail-container user-location-container">
                    <div class="user-initial">${navigator.onLine ? userInitial : '👤'}</div>
                  </div>
                </div>
              </div>
            `,
            iconSize: [50, 60],
            iconAnchor: [25, 55],
            popupAnchor: [0, -45] // Ajustado para que coincida con los tooltips de las fotos
          })
        }).addTo(mapInstanceRef.current);

        // Agregar popup con información
        userMarker.bindPopup(`
          <div class="user-location-popup text-center">
            <h6 class="mb-2">${t('location.current')}</h6>
            <p class="coordinates mb-2">${t('location.coordinates', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })}</p>
          </div>
        `);

        // Aplicar estilos al popup
        setTimeout(() => {
          const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
          popups.forEach(popup => {
            popup.style.padding = '10px';
            popup.style.borderRadius = '10px';
          });
        }, 10);

        setUserLocationLoading(false);
      },
      (error) => {
        console.error("❌ Error obteniendo ubicación:", error);
        setUserLocationLoading(false);

        // Mostrar alerta al usuario con más detalles
        let errorMsg = t('common:errors.location_general');

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += ' ' + t('common:errors.location_denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += ' ' + t('common:errors.location_unavailable');
            break;
          case error.TIMEOUT:
            errorMsg += ' ' + t('common:errors.location_timeout');
            break;
          default:
            errorMsg += ' ' + t('common:errors.location_unknown');
        }

        alert(errorMsg);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0 // Forzar a obtener una posición actualizada
      }
    );
  };

  // Actualizar marcadores cuando cambian las fotos
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current && photos && !loading) {
      // Limpiar marcadores anteriores
      markersLayerRef.current.clearLayers();

      // Añadir marcadores para cada foto con coordenadas
      const bounds = L.latLngBounds();
      let markersAdded = 0;

      photos.forEach(photo => {
        if (photo.location && photo.location.coordinates &&
          photo.location.coordinates.length === 2) {

          const [lng, lat] = photo.location.coordinates;

          // Solo añadir si las coordenadas parecen válidas (verificando si son números, no si son truthy)
          if ((lat !== undefined) && (lng !== undefined) && !isNaN(lat) && !isNaN(lng)) {
            const latLng = L.latLng(lat, lng);
            bounds.extend(latLng);
            markersAdded++;

            // Crear un marcador personalizado con miniatura circular
            const marker = L.marker(latLng, {
              icon: L.divIcon({
                className: 'custom-photo-marker',
                html: `
                  <div class="marker-container">
                    <div class="marker-pin">
                      <div class="marker-thumbnail-container">
                        ${photo.thumbnailUrl
                    ? `<img src="${photo.thumbnailUrl}" alt="${photo.title || t('photo.no_title')}" class="marker-thumbnail">`
                    : `<div class="marker-thumbnail no-image"><i class="bi bi-camera"></i></div>`
                  }
                      </div>
                    </div>
                  </div>
                `,
                iconSize: [40, 60],
                iconAnchor: [20, 55], // Punto central inferior del pin
                popupAnchor: [0, -45] // Posición del popup
              })
            })
              .addTo(markersLayerRef.current)
              .bindPopup(`
              <div style="width: 200px; text-align: center;">
                <h6>${photo.title || t('photo.no_title')}</h6>
                ${photo.thumbnailUrl ?
                  `<img src="${photo.thumbnailUrl}" alt="${photo.title || t('photo.no_title')}" style="max-width: 100%; height: auto; max-height: 150px; border-radius: 5px;">` :
                  `<div class="no-image-placeholder">${t('photo.no_image')}</div>`
                }
                <p class="mt-2">${photo.description || ''}</p>
                <a href="/photo/${photo._id}" class="btn btn-sm btn-primary">${t('photo.view_details')}</a>
              </div>
            `);
          }
        }
      });

      // Ajustar vista si hay marcadores
      if (markersAdded > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else if (!userLocation) {
        // Si no hay marcadores ni ubicación de usuario, mostrar vista predeterminada
        mapInstanceRef.current.setView([-33.45, -70.67], 5);
      }
    }
  }, [photos, loading, userLocation, t]); // Agregar t como dependencia

  // Estilo CSS para el mapa
  const mapStyle = {
    height: '70vh',
    width: '100%',
    position: 'relative'
  };

  return (
    <div className="map-component-container">
      {/* Overlay de carga */}
      {(loading || userLocationLoading) && (
        <div className="map-loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">
            {userLocationLoading
              ? t('common:loading.location')
              : t('common:loading.map')}
          </p>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div ref={mapRef} style={mapStyle}></div>

      {/* Información sobre el mapa */}
      <div className="mt-2 text-muted">
        <small>
          {photos.length > 0 ? (
            t('info.showing_photos', {
              count: photos.length,
              location: userLocation ? t('info.location_detected') : ''
            })
          ) : (
            t('info.no_photos')
          )}
        </small>
      </div>

      {/* CSS para los marcadores y overlay */}
      <style jsx="true">{`
        .map-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .user-location-marker {
          font-size: 24px;
          text-shadow: 1px 1px 2px white;
        }
        
        /* Estilos para los marcadores personalizados */
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
          object-fit: fill;
          background-color: white;
        }
        .marker-thumbnail.no-image {
          background: #f8f9fa;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-pin {
          background: var(--primary, #0dcaf0);  /* Color diferente para distinguir del pin de foto */
        }
        .user-location-container {
          background: var(--secondary, #0d6efd);
        }
        .user-initial {
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .user-location-popup {
          text-align: center;
          padding: 5px;
        }
        .user-location-popup .coordinates {
          margin: 5px 0 0;
          font-family: monospace;
          font-size: 0.9em;
        }

        /* Estilos para el botón de localización */
        .leaflet-control-locate {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 44px !important;
          height: 44px !important;
          background: white !important;
          color: #333 !important;
          box-shadow: none !important;
          border-radius: 4px !important;
          text-decoration: none !important;
        }
        .leaflet-control-locate:hover {
          background: #f8f8f8 !important;
        }
        .leaflet-control-locate i {
          font-size: 22px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Icono personalizado de localización */
        .location-icon {
          position: relative !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
    </div>
  );
};

export default MapComponent; 