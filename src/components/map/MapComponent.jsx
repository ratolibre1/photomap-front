import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../../context/AuthContext';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const clusterLayerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationLoading, setUserLocationLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation(['map']);
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'your_maptiler_api_key';

  // Estilos del mapa con traducciones
  const mapStyles = {
    voyager: {
      title: t('map:mapStyles.voyager'),
      url: `https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key=${apiKey}`
    },
    streets: {
      title: t('map:mapStyles.streets'),
      url: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${apiKey}`
    },
    basic: {
      title: t('map:mapStyles.basic'),
      url: `https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=${apiKey}`
    },
    outdoor: {
      title: t('map:mapStyles.outdoor'),
      url: `https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=${apiKey}`
    },
    toner: {
      title: t('map:mapStyles.toner'),
      url: `https://api.maptiler.com/maps/toner/{z}/{x}/{y}.png?key=${apiKey}`
    }
  };

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

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
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

      // Agregar la capa inicial (Voyager por defecto)
      baseLayers['Voyager'].addTo(map);

      // Agregar el control para cambiar entre capas
      L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map);

      // Guardar referencia al mapa
      mapInstanceRef.current = map;

      // Crear capa para marcadores de fotos usando MarkerClusterGroup
      clusterLayerRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        // Función dinámica para el radio máximo de clustering
        // A mayor zoom (más cerca), menor radio de agrupación = clusters más pequeños
        maxClusterRadius: function (zoom) {
          // Escala gradual de radio de clusters según el nivel de zoom
          if (zoom <= 5) return 80;      // Zoom muy lejano: clusters grandes
          else if (zoom <= 8) return 60; // Zoom medio-lejano
          else if (zoom <= 10) return 50; // Zoom medio
          else if (zoom <= 12) return 30; // Zoom medio-cercano
          else return 20;                // Zoom cercano: clusters pequeños
        },
        zoomToBoundsOnClick: false, // Desactivamos el comportamiento por defecto para manejarlo nosotros
        spiderfyOnMaxZoom: false,  // Desactivar el efecto spider en zoom máximo
        disableClusteringAtZoom: 14, // Desagrupar a un nivel de zoom más bajo (antes era 15)
        // Personalizar cómo se calcula el área a la que hacer zoom, con un padding mayor
        iconCreateFunction: function (cluster) {
          // Obtener el número de marcadores en el cluster
          const count = cluster.getChildCount();

          // Crear HTML personalizado para el icono del cluster
          return L.divIcon({
            html: `
              <div class="marker-container">
                <div class="marker-pin">
                  <div class="marker-thumbnail-container">
                    <span>${count}</span>
                  </div>
                </div>
              </div>
            `,
            className: 'custom-photo-marker',
            iconSize: [40, 60],
            iconAnchor: [20, 55],
            popupAnchor: [0, -45]
          });
        }
      }).addTo(map);

      // Personalizar el comportamiento de zoom al hacer clic en un cluster
      clusterLayerRef.current.on('clusterclick', function (e) {
        // Obtener el cluster y los datos relacionados
        const cluster = e.layer;
        const childCount = cluster.getChildCount();
        const childMarkers = cluster.getAllChildMarkers();
        const currentZoom = map.getZoom();

        // Crear límites para todos los marcadores en el cluster
        const bounds = L.latLngBounds(childMarkers.map(marker => marker.getLatLng()));

        // Calcular distancias entre marcadores para determinar cuán dispersos están
        let maxDistance = 0;
        if (childCount > 1) {
          for (let i = 0; i < childCount - 1; i++) {
            for (let j = i + 1; j < childCount; j++) {
              const dist = childMarkers[i].getLatLng().distanceTo(childMarkers[j].getLatLng());
              maxDistance = Math.max(maxDistance, dist);
            }
          }
        }

        // Determinar el padding necesario según la dispersión de puntos
        // Más dispersos = más padding para asegurar que todos sean visibles
        let zoomPadding;
        if (maxDistance > 10000) { // Muy dispersos (> 10km)
          zoomPadding = [150, 150];
        } else if (maxDistance > 1000) { // Dispersión media (1-10km)
          zoomPadding = [120, 120];
        } else { // Cercanos entre sí
          zoomPadding = [80, 80];
        }

        // Obtener el centro del cluster
        const clusterCenter = cluster.getLatLng();

        // Calcular el zoom óptimo con los límites
        const boundsZoom = map.getBoundsZoom(bounds, false, zoomPadding);

        // Si el cluster tiene menos de 3 marcadores y están muy cercanos, 
        // aumentar el zoom significativamente
        const targetZoom = (childCount <= 3 && maxDistance < 500)
          ? Math.max(currentZoom + 2, 14)  // Al menos 2 niveles más o nivel 14
          : Math.max(
            Math.min(boundsZoom, currentZoom + 3), // No más de 3 niveles de aumento
            Math.min(Math.ceil(currentZoom * 1.2), currentZoom + 1) // Al menos 1 nivel o 20% más
          );

        // Animar al nuevo zoom y centro
        // Usamos flyTo para clusters pequeños (movimiento más suave)
        // y flyToBounds para clusters más grandes (mejor visualización de área)
        if (childCount <= 5) {
          map.flyTo(clusterCenter, targetZoom, {
            duration: 0.5,
            easeLinearity: 0.5
          });
        } else {
          map.flyToBounds(bounds, {
            padding: zoomPadding,
            maxZoom: targetZoom,
            duration: 0.5
          });
        }

        return false; // Prevenir el comportamiento predeterminado
      });

      // Capa para marcadores no agrupados (como el marcador de usuario)
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Agregar botón de localización
      createLocationButton().addTo(map);
    }

    return () => {
      // Limpiar el mapa al desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Quitamos la dependencia de user

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

        setTimeout(() => {
          if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            mapInstanceRef.current.setZoom(currentZoom > 16 ? currentZoom : 16);
            mapInstanceRef.current.panTo([latitude, longitude], {
              animate: true,
              duration: 1
            });
          }
        }, 100);

        const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : '👤';

        if (markersLayerRef.current) {
          const userMarkers = document.querySelectorAll('.custom-user-marker');
          userMarkers.forEach(marker => {
            const parent = marker.parentElement;
            if (parent && parent.parentElement) {
              parent.parentElement.removeChild(parent);
            }
          });
        }

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
            popupAnchor: [0, -45]
          })
        }).addTo(markersLayerRef.current);

        userMarker.bindPopup(`
          <div class="user-location-popup text-center">
            <h6 class="mb-2">${t('map:location.youAreHere')}</h6>
            <p class="coordinates mb-2">Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}</p>
          </div>
        `);

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

        let errorMsg = t('map:location.errors.title');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += ': ' + t('map:location.errors.denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += ': ' + t('map:location.errors.unavailable');
            break;
          case error.TIMEOUT:
            errorMsg += ': ' + t('map:location.errors.timeout');
            break;
          default:
            errorMsg += ': ' + t('map:location.errors.unknown');
        }

        alert(errorMsg);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  };

  // Función para generar el contenido del popup
  const createPopupContent = (photo) => {
    const popupContent = document.createElement('div');
    popupContent.style.width = '200px';
    popupContent.style.textAlign = 'center';

    const title = document.createElement('h6');
    title.textContent = photo.title || t('map:photo.noTitle');
    popupContent.appendChild(title);

    if (photo.thumbnailUrl) {
      const img = document.createElement('img');
      img.src = photo.thumbnailUrl;
      img.alt = photo.title || t('map:photo.noTitle');
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.maxHeight = '150px';
      img.style.borderRadius = '5px';
      popupContent.appendChild(img);
    } else {
      const noImageDiv = document.createElement('div');
      noImageDiv.className = 'no-image-placeholder';
      noImageDiv.textContent = t('map:photo.noImage');
      popupContent.appendChild(noImageDiv);
    }

    if (photo.description) {
      const description = document.createElement('p');
      description.className = 'mt-2';
      description.textContent = photo.description;
      popupContent.appendChild(description);
    }

    const linkButton = document.createElement('a');
    linkButton.href = `#/photo/${photo._id}`;
    linkButton.className = 'btn btn-sm btn-primary';
    linkButton.textContent = t('map:photo.viewDetails');
    linkButton.style.marginTop = '8px';

    linkButton.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = `/photo/${photo._id}`;
    });

    popupContent.appendChild(linkButton);
    return popupContent;
  };

  // Actualizar marcadores cuando cambian las fotos
  useEffect(() => {
    if (mapInstanceRef.current && clusterLayerRef.current && photos && !loading) {
      clusterLayerRef.current.clearLayers();
      const bounds = L.latLngBounds();
      let markersAdded = 0;

      photos.forEach(photo => {
        if (photo.location && photo.location.coordinates &&
          photo.location.coordinates.length === 2) {

          const [lng, lat] = photo.location.coordinates;

          if ((lat !== undefined) && (lng !== undefined) && !isNaN(lat) && !isNaN(lng)) {
            const latLng = L.latLng(lat, lng);
            bounds.extend(latLng);
            markersAdded++;

            const marker = L.marker(latLng, {
              icon: L.divIcon({
                className: 'custom-photo-marker',
                html: `
                  <div class="marker-container">
                    <div class="marker-pin">
                      <div class="marker-thumbnail-container">
                        ${photo.thumbnailUrl
                    ? `<img src="${photo.thumbnailUrl}" alt="${photo.title || 'No title'}" class="marker-thumbnail">`
                    : `<div class="marker-thumbnail no-image"><i class="bi bi-camera"></i></div>`
                  }
                      </div>
                    </div>
                  </div>
                `,
                iconSize: [40, 60],
                iconAnchor: [20, 55],
                popupAnchor: [0, -45]
              })
            });

            marker.bindPopup(createPopupContent(photo));
            clusterLayerRef.current.addLayer(marker);
          }
        }
      });

      if (markersAdded > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
      } else if (!userLocation) {
        mapInstanceRef.current.setView([-33.45, -70.67], 5);
      }
    }
  }, [photos, loading]); // Quitamos userLocation de las dependencias ya que no es necesario

  // Estilo CSS para el mapa
  const mapStyle = {
    height: '70vh',
    width: '100%',
    position: 'relative'
  };

  return (
    <div className="map-component-container">
      {(loading || userLocationLoading) && (
        <div className="map-loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">
            {userLocationLoading ? t('map:location.gettingLocation') : t('map:location.loadingMap')}
          </p>
        </div>
      )}

      <div ref={mapRef} style={mapStyle}></div>

      <div className="mt-2 text-muted">
        <small>
          {photos.length > 0 ? (
            `${t('map:status.showing', { count: photos.length })}${userLocation ? ' · ' + t('map:location.locationDetected') : ''}`
          ) : (
            t('map:status.noPhotos')
          )}
        </small>
      </div>

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

        /* Ajustes para el número en los clusters */
        .marker-thumbnail-container span {
          color: #333;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
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