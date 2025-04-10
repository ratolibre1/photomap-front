import { createContext, useState, useContext } from 'react';
import { authService } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Simplificación radical: solo trabajaremos con datos en localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error al leer user de localStorage', e);
      return null;
    }
  };

  // Estado local
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para verificar si está autenticado (siempre lee directo de localStorage)
  const isAuthenticated = () => {
    return !!localStorage.getItem('token') && !!getUserFromStorage();
  };

  // Función para actualizar el idioma preferido del usuario
  const updatePreferredLanguage = async (languageCode) => {
    try {
      setLoading(true);
      setError(null);

      // Llamada a la API para actualizar el idioma preferido
      await authService.updatePreferredLanguage(languageCode);

      // Actualizar el idioma en el objeto usuario de localStorage
      const user = getUserFromStorage();
      if (user) {
        user.preferredLanguage = languageCode;
        localStorage.setItem('user', JSON.stringify(user));
      }

      return true;
    } catch (err) {
      console.error("Error al actualizar idioma preferido:", err);
      setError(err.response?.data?.message || err.message || 'Error al actualizar idioma preferido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar los datos del usuario en localStorage
  const updateUserData = (userData) => {
    try {
      // Obtener usuario actual
      const currentUser = getUserFromStorage();

      // Actualizar los datos con la nueva información
      const updatedUser = { ...currentUser, ...userData };

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Para forzar una actualización en componentes que usen el contexto
      setLoading(prev => !prev);

      return true;
    } catch (err) {
      console.error("Error al actualizar datos de usuario:", err);
      setError('Error al actualizar datos de usuario');
      return false;
    }
  };

  // Función de login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Iniciando sesión con:", credentials);

      const response = await authService.login(credentials);
      console.log("Respuesta del login:", response);

      // Ahora que conocemos la estructura exacta, extraemos correctamente
      const { data } = response.data;  // Primer nivel es 'data'
      const { token, user } = data;    // Dentro hay 'token' y 'user'

      console.log("Token extraído:", token);
      console.log("Usuario extraído:", user);

      if (!token) {
        throw new Error("No se recibió token del servidor");
      }

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Verificar que se guardó correctamente
      console.log("Token guardado:", localStorage.getItem('token'));

      // Configurar idioma preferido si el usuario tiene uno
      if (user.preferredLanguage) {
        i18n.changeLanguage(user.preferredLanguage);
        console.log(`Idioma cambiado a: ${user.preferredLanguage}`);
      }

      return true;
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirección forzada
  };

  // Valores simplificados para el contexto
  const value = {
    user: getUserFromStorage(),
    loading,
    error,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    getUser: getUserFromStorage,
    updatePreferredLanguage,
    updateUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 