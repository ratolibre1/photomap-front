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
  { path: '/help', label: 'nav:help', icon: '❓' },
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
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
      style={{ backgroundColor: THEMES[theme].colors.primary }}>
      {/* Logo/Brand sin botón */}
      <div className="p-3 d-flex align-items-center">
        <Link to="/dashboard" className="brand-link d-flex align-items-center">
          <span className="fs-4 me-2" style={{ paddingTop: '3px' }}>📷</span>
          {expanded && <h1 className="brand-title">PhotoMap</h1>}
        </Link>

        {/* Botón toggle solo visible cuando está expandido */}
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
              <span className="fs-5" style={{ paddingTop: '3px' }}>▶</span>
            </div>
          </Nav.Link>
        )}

        {/* Menú unificado usando el array MENU_ITEMS */}
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
                    <span className="nav-text">
                      {t(item.label)}
                    </span>
                    {item.isNew && <NewFeatureBadge position="inline" size="sm" rotate={-12} />}
                  </>
                )}
              </div>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Selector de tema cuando está expandido */}
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
                    color: THEMES[themeKey].colors.light,
                  }}
                  title={THEMES[themeKey].name}
                >
                  <span style={{ paddingTop: '3px' }}>{THEMES[themeKey].icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de idioma */}
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

      {/* Cuando está colapsado, usamos un popup con opciones */}
      {!expanded && (
        <div className="py-2 d-flex flex-column align-items-center gap-2">
          {/* Botón de tema */}
          <div className="theme-dropdown">
            <button
              className="btn btn-sm text-white border-0 bg-transparent"
              type="button"
              onClick={(e) => {
                const themeMenu = document.getElementById('themeMenu');
                if (themeMenu) {
                  themeMenu.style.display = themeMenu.style.display === 'none' ? 'block' : 'none';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const menuWidth = 200;
                  let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
                  leftPos = Math.max(10, leftPos);
                  const maxRight = window.innerWidth - menuWidth - 10;
                  leftPos = Math.min(maxRight, leftPos);
                  themeMenu.style.top = `${rect.bottom + 10}px`;
                  themeMenu.style.left = `${leftPos}px`;
                }
              }}
              title={t('common:theme.title')}
            >
              <span className="fs-5" style={{ paddingTop: '3px' }}>🎨</span>
            </button>

            {/* Menú de temas */}
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

              <div className="px-3 py-2 border-bottom mb-1"
                style={{ borderBottomColor: 'var(--dark)' }}>
                <small style={{ color: 'var(--dark)' }}>{t('common:theme.title')}</small>
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
                      backgroundColor: THEMES[themeKey].colors.light,
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ paddingTop: '3px' }}>{THEMES[themeKey].icon}</span>
                  </div>
                  <span className="fw-medium">{THEMES[themeKey].name}</span>
                  {theme === themeKey && <i className="bi bi-check-lg ms-auto text-secondary"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de idioma */}
          <div className="lang-dropdown">
            <button
              className="btn btn-sm text-white border-0 bg-transparent"
              type="button"
              onClick={(e) => {
                const langMenu = document.getElementById('langMenu');
                if (langMenu) {
                  langMenu.style.display = langMenu.style.display === 'none' ? 'block' : 'none';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const menuWidth = 200;
                  let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
                  leftPos = Math.max(10, leftPos);
                  const maxRight = window.innerWidth - menuWidth - 10;
                  leftPos = Math.min(maxRight, leftPos);
                  langMenu.style.top = `${rect.bottom + 10}px`;
                  langMenu.style.left = `${leftPos}px`;
                }
              }}
              title={t('common:language.title')}
            >
              <span className="fs-5" style={{ paddingTop: '3px' }}>🌍</span>
            </button>

            {/* Menú de idiomas */}
            <div
              id="langMenu"
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

              <div className="px-3 py-2 border-bottom mb-1"
                style={{ borderBottomColor: 'var(--dark)' }}>
                <small style={{ color: 'var(--dark)' }}>{t('common:language.title')}</small>
              </div>

              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className="dropdown-item d-flex align-items-center px-3 py-2"
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    backgroundColor: i18n.language === lang.code ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    className="me-3 rounded-circle"
                    style={{
                      backgroundColor: 'var(--light)',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ paddingTop: '3px' }}>{lang.icon}</span>
                  </div>
                  <span className="fw-medium">{t(`common:${lang.name}`)}</span>
                  {i18n.language === lang.code && <i className="bi bi-check-lg ms-auto text-secondary"></i>}
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