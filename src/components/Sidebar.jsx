import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NewFeatureBadge from './common/NewFeatureBadge';
import './Sidebar.css';

// Íconos usando emoji por simplicidad
const MENU_ITEMS = [
  { path: '/photo-map', label: 'nav:map', icon: '🗺️' },
  { path: '/gallery', label: 'nav:gallery', icon: '🖼️' },
  { path: '/my-maps', label: 'nav:mymaps', icon: '🌎', isNew: true },
  { path: '/on-this-day', label: 'nav:onthisday', icon: '📅' },
  { path: '/upload', label: 'nav:upload', icon: '📤' },
  { path: '/categories', label: 'nav:categories', icon: '🏷️' },
  { path: '/profile', label: 'nav:profile', icon: '👤' },
  { path: '/admin-tools', label: 'nav:admin', icon: '🧰' },
];

const LANGUAGES = [
  { code: 'es', name: 'language.es', icon: '🇨🇱' },
  { code: 'en', name: 'language.en', icon: '🇬🇧' }
];

const Sidebar = ({ expanded, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, updatePreferredLanguage } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation(['nav', 'common']);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Añadir este efecto para cerrar los menús al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const themeMenu = document.getElementById('themeMenu');
      const langMenu = document.getElementById('langMenu');

      if (themeMenu && themeMenu.style.display === 'block' &&
        !themeMenu.contains(event.target) &&
        !event.target.closest('.theme-dropdown button')) {
        themeMenu.style.display = 'none';
      }

      if (langMenu && langMenu.style.display === 'block' &&
        !langMenu.contains(event.target) &&
        !event.target.closest('.lang-dropdown button')) {
        langMenu.style.display = 'none';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para cambiar idioma y guardarlo en preferencias
  const handleLanguageChange = async (langCode) => {
    try {
      // Cambiar el idioma en la interfaz
      i18n.changeLanguage(langCode);

      // Guardar la preferencia en el backend
      await updatePreferredLanguage(langCode);
      console.log(`Idioma actualizado a ${langCode} en el servidor`);

      // Cerrar el menú desplegable si está colapsado
      if (!expanded) {
        document.getElementById('langMenu').style.display = 'none';
      }
    } catch (error) {
      console.error('Error al actualizar idioma preferido:', error);
      // El idioma de la interfaz ya se cambió, así que no hacemos rollback
    }
  };

  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      {/* Logo/Brand */}
      <div className="p-3 d-flex align-items-center">
        <Link to="/dashboard" className="brand-link d-flex align-items-center">
          <span className="fs-4 me-2" style={{ paddingTop: '3px' }}>📷</span>
          {expanded && <h1 className="brand-title">PhotoMap</h1>}
        </Link>

        {/* Toggle button - visible when expanded */}
        {expanded && (
          <Button
            variant="outline-light"
            size="sm"
            className="ms-auto toggle-button"
            onClick={toggleSidebar}
          >
            ◀
          </Button>
        )}
      </div>

      {/* Navigation menu */}
      <Nav className="flex-column mb-auto">
        {/* Toggle button - visible when collapsed */}
        {!expanded && (
          <Nav.Link
            as="button"
            onClick={toggleSidebar}
            className="py-2 text-white border-0 bg-transparent d-flex justify-content-center"
          >
            <div className="d-flex align-items-center">
              <span className="fs-5" style={{ paddingTop: '3px' }}>▶</span>
            </div>
          </Nav.Link>
        )}

        {/* Menu items */}
        {MENU_ITEMS.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={Link}
              to={item.path}
              className={`py-2 ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="d-flex align-items-center position-relative">
                <span className={`${expanded ? 'me-3' : ''} fs-5`} style={{ paddingTop: '3px' }}>{item.icon}</span>
                {expanded && (
                  <>
                    <span>{t(item.label)}</span>
                    {item.isNew && <NewFeatureBadge position="inline" size="sm" rotate={-12} />}
                  </>
                )}
              </div>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Theme selector - visible when expanded */}
      {expanded && (
        <>
          <div className="px-3 mb-3">
            <p className="section-title">{t('common:theme.title')}:</p>
            <div className="d-flex flex-wrap gap-2">
              {Object.keys(THEMES).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`theme-button ${theme === themeKey ? 'active' : ''}`}
                  style={{
                    backgroundColor: THEMES[themeKey].colors.light,
                    color: THEMES[themeKey].colors.light
                  }}
                  title={THEMES[themeKey].name}
                >
                  <span style={{ paddingTop: '3px' }}>{THEMES[themeKey].icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="px-3 mb-3">
            <p className="section-title">{t('common:language.title')}:</p>
            <div className="d-flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`btn btn-sm p-1`}
                  style={{
                    backgroundColor: 'var(--light)',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: i18n.language === lang.code ? '3px solid var(--info)' : 'none',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    opacity: i18n.language === lang.code ? 1 : 0.7,
                  }}
                  title={t(`common:${lang.name}`)}
                  onMouseEnter={(e) => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.opacity = '0.7';
                    }
                  }}
                >
                  <span style={{ paddingTop: '3px' }}>{lang.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className={`${expanded ? 'p-3' : 'px-2 py-3'} mt-auto`}>
        <Button
          variant="outline-light"
          className={`${expanded ? 'w-100' : 'mx-auto'} d-flex align-items-center justify-content-center`}
          onClick={handleLogout}
          style={!expanded ? { width: '40px', height: '40px', borderRadius: '50%' } : {}}
          title={t('nav:logout')}
        >
          <span className={expanded ? "me-2" : ""} style={{ paddingTop: '3px' }}>🚪</span>
          {expanded && <span>{t('nav:logout')}</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 