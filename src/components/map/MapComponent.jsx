import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../../context/AuthContext'; // Importar el contexto de autenticación
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
  const { t } = useTranslation(['map', 'common']);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const clusterLayerRef = useRef(null);
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
        }).addTo(markersLayerRef.current);

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
    if (mapInstanceRef.current && clusterLayerRef.current && photos && !loading) {
      // Limpiar marcadores anteriores
      clusterLayerRef.current.clearLayers();

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
            });

            // Crear un contenido personalizado para el popup
            const popupContent = document.createElement('div');
            popupContent.style.width = '200px';
            popupContent.style.textAlign = 'center';

            // Crear el título
            const title = document.createElement('h6');
            title.textContent = photo.title || t('photo.no_title');
            popupContent.appendChild(title);

            // Crear la imagen
            if (photo.thumbnailUrl) {
              const img = document.createElement('img');
              img.src = photo.thumbnailUrl;
              img.alt = photo.title || t('photo.no_title');
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.maxHeight = '150px';
              img.style.borderRadius = '5px';
              popupContent.appendChild(img);
            } else {
              const noImageDiv = document.createElement('div');
              noImageDiv.className = 'no-image-placeholder';
              noImageDiv.textContent = t('photo.no_image');
              popupContent.appendChild(noImageDiv);
            }

            // Agregar descripción si existe
            if (photo.description) {
              const description = document.createElement('p');
              description.className = 'mt-2';
              description.textContent = photo.description;
              popupContent.appendChild(description);
            }

            // Crear enlace como botón que use react-router-dom en lugar de un enlace absoluto
            const linkButton = document.createElement('a');
            linkButton.href = `#/photo/${photo._id}`; // Usar hash para que React Router lo capture
            linkButton.className = 'btn btn-sm btn-primary';
            linkButton.textContent = t('photo.view_details');
            linkButton.style.marginTop = '8px';

            // Agregar evento para evitar recarga de página y usar la navegación de React Router
            linkButton.addEventListener('click', function (e) {
              e.preventDefault();
              window.history.pushState({}, '', `/photo/${photo._id}`);
              window.dispatchEvent(new Event('popstate'));
            });

            popupContent.appendChild(linkButton);

            // Asignar el contenido personalizado al popup
            marker.bindPopup(popupContent);

            // Agregar el marcador al grupo de clusters en lugar de directamente al mapa
            clusterLayerRef.current.addLayer(marker);
          }
        }
      });

      // Ajustar vista si hay marcadores
      if (markersAdded > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
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