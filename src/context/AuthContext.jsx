import { createContext, useState, useContext } from 'react';
import { authService } from '../services/api';

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 