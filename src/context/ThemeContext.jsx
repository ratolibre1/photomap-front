import { createContext, useContext, useState, useEffect } from 'react';

// Definimos las paletas de colores disponibles
export const THEMES = {
  magmar: {
    name: 'Magmar',
    icon: '🌋',
    colors: {
      light: '#ece7d7',
      dark: '#111219',
      primary: '#2b2a2c',
      secondary: '#da2f37',
      info: '#eaa845',
      success: '#20a166',
      warning: '#ddcc20',
      danger: '#e92f10',
    }
  },
  caterpie: {
    name: 'Caterpie',
    icon: '🐛',
    colors: {
      light: '#c6fbda',
      dark: '#00060a',
      primary: '#034d4c',
      secondary: '#824d39',
      info: '#c1a423',
      success: '#05a145',
      warning: '#ecc605',
      danger: '#f20232',
    }
  },
  farfetchd: {
    name: 'Farfetch\'d',
    icon: '🦆',
    colors: {
      light: '#ebe7d8',
      dark: '#000100',
      primary: '#5d3b2e',
      secondary: '#cc5f41',
      info: '#cfcb63',
      success: '#62ab2e',
      warning: '#fdc370',
      danger: '#f11a65',
    }
  },
  oddish: {
    name: 'Oddish',
    icon: '🌱',
    colors: {
      light: '#dbd2e9',
      dark: '#1e1b34',
      primary: '#423aa3',
      secondary: '#006afb',
      info: '#08bbca',
      success: '#00a862',
      warning: '#e2cd00',
      danger: '#f21f00',
    }
  },
  venusaur: {
    name: 'Venusaur',
    icon: '🌸',
    colors: {
      light: '#d3e6e6',
      dark: '#000709',
      primary: '#14493a',
      secondary: '#4a952f',
      info: '#e2cc2f',
      success: '#12b23d',
      warning: '#f6c911',
      danger: '#f80742',
    }
  }
};

const ThemeContext = createContext({
  theme: 'magmar',
  setTheme: () => { },
  themeData: THEMES.magmar
});

// Agregar esta función de utilidad para calcular si un color es claro
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

export const ThemeProvider = ({ children }) => {
  // Usar localStorage para persitir el tema del usuario
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && THEMES[savedTheme] ? savedTheme : 'magmar';
  });

  // Obtener los datos del tema actual
  const themeData = THEMES[theme] || THEMES.magmar;

  // Actualizar variables CSS cuando cambia el tema
  useEffect(() => {
    // Guardar preferencia
    localStorage.setItem('theme', theme);

    // Actualizar variables CSS
    const root = document.documentElement;

    // Colores principales del tema
    root.style.setProperty('--primary', themeData.colors.primary);
    root.style.setProperty('--secondary', themeData.colors.secondary);
    root.style.setProperty('--info', themeData.colors.info);
    root.style.setProperty('--success', themeData.colors.success);
    root.style.setProperty('--warning', themeData.colors.warning);
    root.style.setProperty('--danger', themeData.colors.danger);
    root.style.setProperty('--light', themeData.colors.light);
    root.style.setProperty('--dark', themeData.colors.dark);

    // Agregar fondo sutil para las páginas (usando el color light con transparencia)
    const bgTint = themeData.colors.light + '80'; // 80 es opacidad 50%
    root.style.setProperty('--page-background', bgTint);

    // Determinar color de texto para botones basado en el color de fondo
    const successTextColor = isLightColor(themeData.colors.success) ? '#000' : '#fff';
    const dangerTextColor = isLightColor(themeData.colors.danger) ? '#000' : '#fff';

    root.style.setProperty('--btn-success-text', successTextColor);
    root.style.setProperty('--btn-danger-text', dangerTextColor);
  }, [theme, themeData]);

  // Proporcionar el tema y la función para cambiarlo
  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 