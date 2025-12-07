import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Import layout components
import TopBar from './TopBar';
import LeftPanel from './LeftPanel';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Auto-close sidebar when resizing from mobile to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="App d-flex flex-column min-vh-100">
      <TopBar onSidebarToggle={toggleSidebar} onSidebarClose={closeSidebar} />
      <Container fluid className="flex-grow-1 content-container">
        <Row className="h-100 gx-2">
          {/* Left Panel - Hidden on mobile, 3 cols on desktop */}
          <Col xs={12} md={3} className={`left-panel-col ${sidebarOpen ? 'mobile-open' : ''}`}>
            <LeftPanel
              isOpen={sidebarOpen}
              onClose={closeSidebar}
              onKidClick={closeSidebar}
            />
          </Col>
          {/* Main Content - Full width on mobile, 9 cols on desktop */}
          <Col xs={12} md={9} className="main-content-col">
            <Outlet />
          </Col>
        </Row>
      </Container>

      {/* Backdrop - only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop show d-md-none"
          onClick={closeSidebar}
          role="button"
          tabIndex={-1}
          aria-label={t('closeSidebar')}
        />
      )}
    </div>
  );
};

export default AppLayout;
