import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import PhotoDetail from './pages/PhotoDetail';
import CategoryManager from './pages/CategoryManager';
import { ThemeProvider } from './context/ThemeContext';
import Upload from './pages/Upload';
import PhotoMap from './pages/PhotoMap';
import { CategoryProvider } from './context/CategoryContext';
import AdminTools from './pages/AdminTools';
import { LocationProvider } from './context/LocationContext';

// Importamos el CSS del layout
import './components/layout.css';
import './components/gallery.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importar CSS de tema personalizado
import './styles/theme.css';
import './styles/upload.css';

// Componente para rutas protegidas simplificado
const ProtectedRoute = ({ children }) => {
  // Verificación directa de localStorage
  const isLoggedIn = () => {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
  };

  console.log("¿Usuario autenticado según localStorage?", isLoggedIn());

  return isLoggedIn() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CategoryProvider>
      <LocationProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<div>Página de registro (próximamente)</div>} />

              {/* Rutas protegidas con layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/gallery" element={
                <ProtectedRoute>
                  <Layout>
                    <Gallery />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/photo-map" element={
                <ProtectedRoute>
                  <Layout>
                    <PhotoMap />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <Upload />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/photo/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <PhotoDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryManager />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin-tools" element={
                <ProtectedRoute>
                  <Layout>
                    <AdminTools />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Ruta para manejar direcciones no encontradas */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </LocationProvider>
    </CategoryProvider>
  );
}

export default App; 