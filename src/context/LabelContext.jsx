import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { categoryService } from '../services/api';

const LabelContext = createContext();

export const useLabels = () => useContext(LabelContext);

export const LabelProvider = ({ children }) => {
  const [labels, setLabels] = useState([]);
  const [categoriesWithLabels, setCategoriesWithLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convertir a useCallback para poder llamarla desde fuera
  const refreshData = useCallback(async () => {
    console.log('🔄 LabelContext: Iniciando refreshData para actualizar etiquetas...');
    try {
      setLoading(true);
      setError(null);

      console.log('📤 LabelContext: Solicitando categorías actualizadas al API...');
      const response = await categoryService.getCategories();
      console.log('📥 LabelContext: Respuesta recibida del API:', response);
      console.log('📥 LabelContext: Datos de categorías:', response.data);

      let categories = [];
      if (response.data && response.data.status === 'success') {
        console.log('✅ LabelContext: Extrayendo categorías de la respuesta...');
        categories = response.data.data || [];
        setCategoriesWithLabels(categories);
      } else {
        console.warn('⚠️ LabelContext: Formato de respuesta inesperado:', response.data);
        return false;
      }

      // Extraer todas las etiquetas de todas las categorías en una lista plana
      const allLabels = [];
      categories.forEach(category => {
        if (Array.isArray(category.labels)) {
          // Agregar información de categoría a cada etiqueta
          const labelsWithCategory = category.labels.map(label => ({
            ...label,
            categoryId: category._id || category.id,
            categoryName: category.name
          }));
          allLabels.push(...labelsWithCategory);
        }
      });

      // Actualizar el estado con todas las etiquetas
      console.log('📊 Total de etiquetas cargadas:', allLabels.length);
      setLabels(allLabels);

      return true; // Indicar éxito
    } catch (err) {
      console.error('❌ LabelContext: Error al actualizar categorías:', err);
      console.error('❌ LabelContext: Mensaje de error:', err.message);
      console.error('❌ LabelContext: Respuesta del servidor si existe:', err.response?.data);
      setError('No se pudieron cargar las categorías y etiquetas');
      return false; // Indicar fallo
    } finally {
      setLoading(false);
      console.log('🔄 LabelContext: Finalizando refreshData');
    }
  }, []);

  // Usar refreshData en useEffect inicial
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Función para obtener etiquetas de una categoría específica
  const getLabelsByCategory = (categoryId) => {
    const category = categoriesWithLabels.find(cat => cat._id === categoryId);
    return category?.labels || [];
  };

  // Función para obtener información de una etiqueta por su ID
  const getLabelById = (labelId) => {
    return labels.find(label => label._id === labelId);
  };

  // Función para obtener etiquetas con fotos públicas (útil para filtros públicos)
  const getLabelsWithPublicPhotos = () => {
    return labels.filter(label => label.publicPhotoCount > 0);
  };

  return (
    <LabelContext.Provider value={{
      labels,
      categoriesWithLabels,
      loading,
      error,
      getLabelsByCategory,
      getLabelById,
      getLabelsWithPublicPhotos,
      refreshData // Exportamos la función para usarla donde se necesite
    }}>
      {children}
    </LabelContext.Provider>
  );
}; 