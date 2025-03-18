import { useState } from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-grow-1 primary-background" style={{
        marginLeft: sidebarExpanded ? '250px' : '60px',
        transition: 'margin-left 0.3s'
      }}>
        {/* Page Content - ya no tiene el botón */}
        <Container className="py-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout; 