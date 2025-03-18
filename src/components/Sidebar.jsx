import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useEffect } from 'react';

// Íconos usando emoji por simplicidad
const MENU_ITEMS = [
  { path: '/photo-map', label: 'Mapa de Recuerdos', icon: '🗺️' },
  { path: '/gallery', label: 'Galería de Fotos', icon: '🖼️' },
  { path: '/upload', label: 'Subir Fotos', icon: '📤' },
  { path: '/categories', label: 'Categorías', icon: '🏷️' },
  { path: '/profile', label: 'Perfil', icon: '👤' },
  { path: '/admin-tools', label: 'Herramientas Admin', icon: '🧰' },
];

const Sidebar = ({ expanded, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Añadir este efecto para cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const themeMenu = document.getElementById('themeMenu');
      if (themeMenu && themeMenu.style.display === 'block' && !themeMenu.contains(event.target) && !event.target.closest('.dropdown button')) {
        themeMenu.style.display = 'none';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
      style={{
        width: expanded ? '250px' : '60px',
        transition: 'width 0.3s',
        backgroundColor: 'var(--primary)',
        borderRight: '1px solid var(--info)'
      }}>

      {/* Logo/Brand sin botón */}
      <div className="p-3 d-flex align-items-center">
        <Link to="/dashboard" className="text-decoration-none text-white d-flex align-items-center">
          <span className="fs-4 me-2">📷</span>
          <h1>{expanded && <span className="fs-4 fw-bold" style={{ fontFamily: 'Courgette' }}>PhotoMap</span>}</h1>
        </Link>

        {/* Botón toggle solo visible cuando está expandido */}
        {expanded && (
          <Button
            variant="outline-light"
            size="sm"
            className="ms-auto p-1 border-0 d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
            style={{ width: '28px', height: '28px' }}
          >
            ◀
          </Button>
        )}
      </div>

      {/* Menú de navegación */}
      <Nav className="flex-column mb-auto">
        {/* Botón de expandir - solo visible cuando está colapsado */}
        {!expanded && (
          <Nav.Link
            as="button"
            onClick={toggleSidebar}
            className="py-2 text-white border-0 bg-transparent d-flex justify-content-center"
          >
            <div className="d-flex align-items-center">
              <span className="fs-5">▶</span>
            </div>
          </Nav.Link>
        )}

        {/* Menú unificado usando el array MENU_ITEMS */}
        {MENU_ITEMS.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={Link}
              to={item.path}
              className={`py-2 ${location.pathname === item.path ? 'active bg-secondary bg-opacity-25' : ''}`}
            >
              <div className="d-flex align-items-center">
                <span className={`${expanded ? 'me-3' : ''} fs-5`}>{item.icon}</span>
                {expanded && <span>{item.label}</span>}
              </div>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Selector de tema cuando está expandido */}
      {expanded && (
        <div className="px-3 mb-3">
          <p className="text-light small mb-2">Tema:</p>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(THEMES).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setTheme(themeKey)}
                className={`btn btn-sm p-1`}
                style={{
                  backgroundColor: THEMES[themeKey].colors.light,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: theme === themeKey ? '2px solid ' + THEMES[themeKey].colors.dark : 'none',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  color: THEMES[themeKey].colors.light,
                  opacity: theme === themeKey ? 1 : 0.7,
                }}
                title={THEMES[themeKey].name}
                onMouseEnter={(e) => {
                  if (theme !== themeKey) {
                    e.currentTarget.style.backgroundColor = THEMES[themeKey].colors.light;
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== themeKey) {
                    e.currentTarget.style.backgroundColor = THEMES[themeKey].colors.light;
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                <span>{THEMES[themeKey].icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cuando está colapsado, usamos un popup con opciones */}
      {!expanded && (
        <div className="py-2 d-flex justify-content-center">
          <div className="dropdown">
            <button
              className="btn btn-sm text-white border-0 bg-transparent"
              type="button"
              onClick={(e) => {
                // Crear menú manual en vez de usar dropdown Bootstrap
                const themeMenu = document.getElementById('themeMenu');
                if (themeMenu) {
                  themeMenu.style.display = themeMenu.style.display === 'none' ? 'block' : 'none';

                  // Posicionar de manera diferente para evitar que se salga de la pantalla
                  const rect = e.currentTarget.getBoundingClientRect();
                  const menuWidth = 200; // Ancho aproximado del menú

                  // Calcular posición para que quede visible
                  let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);

                  // Asegurarse de que no se salga por la izquierda
                  leftPos = Math.max(10, leftPos);

                  // Asegurarse de que no se salga por la derecha
                  const maxRight = window.innerWidth - menuWidth - 10;
                  leftPos = Math.min(maxRight, leftPos);

                  themeMenu.style.top = `${rect.bottom + 10}px`;
                  themeMenu.style.left = `${leftPos}px`;
                }
              }}
              title="Cambiar tema"
            >
              <span className="fs-5">🎨</span>
            </button>

            {/* Menú personalizado con colores del tema */}
            <div
              id="themeMenu"
              className="position-fixed rounded shadow-lg py-1"
              style={{
                display: 'none',
                zIndex: 1000,
                minWidth: '200px',
                marginTop: '10px',
                animation: 'fadeIn 0.2s ease-in-out',
                backgroundColor: 'var(--light)',
                border: '1px solid var(--dark)',
                color: 'var(--dark)'
              }}
            >
              {/* Flecha decorativa */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '20px',
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid var(--light)'
                }}
              ></div>

              {/* Título del menú */}
              <div className="px-3 py-2 border-bottom mb-1"
                style={{ borderBottomColor: 'var(--dark)' }}>
                <small style={{ color: 'var(--dark)' }}>Selecciona un tema</small>
              </div>

              {Object.keys(THEMES).map((themeKey) => (
                <button
                  key={themeKey}
                  className="dropdown-item d-flex align-items-center px-3 py-2"
                  onClick={() => {
                    setTheme(themeKey);
                    document.getElementById('themeMenu').style.display = 'none';
                  }}
                  style={{
                    backgroundColor: theme === themeKey ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    className="me-3 rounded-circle"
                    style={{
                      backgroundColor: THEMES[themeKey].colors.secondary,
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span>{THEMES[themeKey].icon}</span>
                  </div>
                  <span className="fw-medium">{THEMES[themeKey].name}</span>
                  {theme === themeKey && <i className="bi bi-check-lg ms-auto text-secondary"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`${expanded ? 'p-3' : 'px-2 py-3'} mt-auto`}>
        <Button
          variant="outline-light"
          className={`${expanded ? 'w-100' : 'mx-auto'} d-flex align-items-center justify-content-center`}
          onClick={handleLogout}
          style={!expanded ? { width: '40px', height: '40px', borderRadius: '50%' } : {}}
        >
          <span className={expanded ? "me-2" : ""}>🚪</span>
          {expanded && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 