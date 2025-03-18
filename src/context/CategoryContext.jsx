import { createContext, useContext, useState, useEffect } from 'react';
import { categoryService } from '../services/api';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      console.log('Respuesta categorías:', response.data);

      // Nueva estructura de acceso a los datos
      let categoriesData = [];

      if (response.data?.data?.categories) {
        // Caso: response.data.data.categories (este es el caso actual)
        categoriesData = response.data.data.categories;
      } else if (response.data?.categories) {
        // Caso: response.data.categories
        categoriesData = response.data.categories;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Caso: response.data.data (si es un array)
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Caso: response.data (si es un array)
        categoriesData = response.data;
      }

      console.log('Categorías extraídas:', categoriesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al iniciar la app
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      error,
      reloadCategories: fetchCategories,
      addCategory: (newCategory) => setCategories([...categories, newCategory])
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook personalizado para facilitar el uso del contexto
export const useCategories = () => useContext(CategoryContext); 