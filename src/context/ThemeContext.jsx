import { createContext, useContext, useState, useEffect } from 'react';

// Definimos colores comunes para todas las paletas
const COMMON_COLORS = {
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545'
};

// Definimos las paletas de colores disponibles
export const THEMES = {
  milotic: {
    name: 'Milotic',
    icon: '🐍',
    colors: {
      light: '#ffffe6',
      dark: '#313131',
      primary: '#ee6a7b',
      secondary: '#39acd5',
      ...COMMON_COLORS
    }
  },
  exeggutor: {
    name: 'Exeggutor',
    icon: '🌴',
    colors: {
      light: '#ffeea4',
      dark: '#524110',
      primary: '#73ac31',
      secondary: '#734110',
      ...COMMON_COLORS
    }
  },
  azumarill: {
    name: 'Azumarill',
    icon: '🐁',
    colors: {
      light: '#d5def6',
      dark: '#183973',
      primary: '#4183cd',
      secondary: '#bd2931',
      ...COMMON_COLORS
    }
  },
  starmie: {
    name: 'Starmie',
    icon: '🌟',
    colors: {
      light: '#ffe694',
      dark: '#313973',
      primary: '#8b73bd',
      secondary: '#f65273',
      ...COMMON_COLORS
    }
  },
  charizard: {
    name: 'Charizard',
    icon: '🐲',
    colors: {
      light: '#eede7b',
      dark: '#084152',
      primary: '#ee8329',
      secondary: '#207394',
      ...COMMON_COLORS
    }
  },
  shaymin: {
    name: 'Shaymin',
    icon: '🌸',
    colors: {
      light: '#acde62',
      dark: '#294129',
      primary: '#399441',
      secondary: '#cd6a8b',
      ...COMMON_COLORS
    }
  }
};

const ThemeContext = createContext({
  theme: 'milotic',
  setTheme: () => { },
  themeData: THEMES.milotic
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

// Función para oscurecer o aclarar un color
const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = Math.max(0, R).toString(16).padStart(2, '0');
  G = Math.max(0, G).toString(16).padStart(2, '0');
  B = Math.max(0, B).toString(16).padStart(2, '0');

  return `#${R}${G}${B}`;
};

export const ThemeProvider = ({ children }) => {
  // Usar localStorage para persitir el tema del usuario
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && THEMES[savedTheme] ? savedTheme : 'milotic';
  });

  // Obtener los datos del tema actual
  const themeData = THEMES[theme] || THEMES.milotic;

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

    // Añadir variables CSS para los estados hover de botones
    // Crear un tono más oscuro del color primario para hover
    const primaryHover = shadeColor(themeData.colors.primary, -15); // Oscurecer 15%
    root.style.setProperty('--btn-primary-hover', primaryHover);
    root.style.setProperty('--btn-primary-bg', themeData.colors.primary);

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