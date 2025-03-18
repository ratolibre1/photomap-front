import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../services/api';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  // Estado para todas las ubicaciones cargadas desde el backend
  const [locations, setLocations] = useState({
    countries: [],
    regions: [],
    counties: [],
    cities: [],
  });

  // Estado para los IDs seleccionados en la jerarquía
  const [selectedIds, setSelectedIds] = useState({
    countryId: '',
    regionId: '',
    countyId: '',
    cityId: ''
  });

  const [loading, setLoading] = useState({
    countries: false,
    regions: false,
    counties: false,
    cities: false
  });

  // Cargar todos los países
  useEffect(() => {
    const fetchCountries = async () => {
      console.log('⏳ Iniciando carga de países...');
      setLoading(prev => ({ ...prev, countries: true }));
      try {
        const response = await api.get('/location/countries');
        console.log('📊 Estructura completa de datos de países:', response.data.data);

        if (response.data.status === "success") {
          const countriesData = response.data.data;
          setLocations(prev => ({ ...prev, countries: countriesData }));
        }
      } catch (error) {
        console.error('❌ Error al cargar países:', error);
      } finally {
        setLoading(prev => ({ ...prev, countries: false }));
      }
    };

    fetchCountries();
  }, []);

  // Cargar todas las regiones (sin filtrar por país)
  useEffect(() => {
    const fetchAllRegions = async () => {
      setLoading(prev => ({ ...prev, regions: true }));
      try {
        const response = await api.get('/location/regions');
        if (response.data.status === "success") {
          const regionsData = response.data.data;
          setLocations(prev => ({ ...prev, regions: regionsData }));
        }
      } catch (error) {
        console.error('Error al cargar regiones:', error);
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };

    fetchAllRegions();
  }, []);

  // Cargar todos los condados (sin filtrar por región)
  useEffect(() => {
    const fetchAllCounties = async () => {
      setLoading(prev => ({ ...prev, counties: true }));
      try {
        const response = await api.get('/location/counties');
        if (response.data.status === "success") {
          const countiesData = response.data.data;
          setLocations(prev => ({ ...prev, counties: countiesData }));
        }
      } catch (error) {
        console.error('Error al cargar condados:', error);
      } finally {
        setLoading(prev => ({ ...prev, counties: false }));
      }
    };

    fetchAllCounties();
  }, []);

  // Cargar todas las ciudades (sin filtrar por condado)
  useEffect(() => {
    const fetchAllCities = async () => {
      setLoading(prev => ({ ...prev, cities: true }));
      try {
        const response = await api.get('/location/cities');
        if (response.data.status === "success") {
          const citiesData = response.data.data;
          setLocations(prev => ({ ...prev, cities: citiesData }));
        }
      } catch (error) {
        console.error('Error al cargar ciudades:', error);
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };

    fetchAllCities();
  }, []);

  // Función para seleccionar ubicación y restablecer niveles inferiores
  const selectLocation = (level, id) => {
    const newSelectedIds = { ...selectedIds };

    // Actualizar el nivel seleccionado
    newSelectedIds[level] = id;

    // Restablecer todos los niveles inferiores
    if (level === 'countryId') {
      newSelectedIds.regionId = '';
      newSelectedIds.countyId = '';
      newSelectedIds.cityId = '';
    } else if (level === 'regionId') {
      newSelectedIds.countyId = '';
      newSelectedIds.cityId = '';
    } else if (level === 'countyId') {
      newSelectedIds.cityId = '';
    }

    setSelectedIds(newSelectedIds);
  };

  // Calcular las listas filtradas en base a las selecciones usando useMemo
  const filteredLocations = useMemo(() => {
    // Por defecto, las listas filtradas son iguales a las listas completas
    const filtered = {
      countries: locations.countries,
      regions: locations.regions,
      counties: locations.counties,
      cities: locations.cities,
    };

    // Si hay un país seleccionado, filtrar regiones por ese país
    if (selectedIds.countryId) {
      filtered.regions = locations.regions.filter(
        region => region.countryId === selectedIds.countryId
      );
    }

    // Si hay una región seleccionada, filtrar provincias por esa región
    if (selectedIds.regionId) {
      filtered.counties = locations.counties.filter(
        county => county.regionId === selectedIds.regionId
      );
    }

    // Si hay una provincia seleccionada, filtrar ciudades por esa provincia
    if (selectedIds.countyId) {
      filtered.cities = locations.cities.filter(
        city => city.countyId === selectedIds.countyId
      );
    }

    return filtered;
  }, [locations, selectedIds]);

  // Valor que proporcionará el contexto
  const contextValue = {
    // Listas completas para casos donde necesitamos todas las ubicaciones
    allLocations: locations,
    // Listas filtradas según las selecciones
    locations: filteredLocations,
    loading,
    // Selecciones actuales
    selectedIds,
    // Método para actualizar selecciones
    selectLocation
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}; 