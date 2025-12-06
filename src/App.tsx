import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';

// Import layout components
import TopBar from './components/layout/TopBar';
import LeftPanel from './components/layout/LeftPanel';
import { ErrorFallback } from './components/common/ErrorFallback';

// Import views
import KidListView from './components/kids/KidListView';
import KidAddView from './components/kids/KidAddView';
import KidDetailsView from './components/kids/KidDetailsView';
import KidEditView from './components/kids/KidEditView';

// Import contexts
import { KidsProvider } from './contexts/KidsContext';
import { ClassProvider } from './contexts/ClassContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import React Toastify CSS
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

const App: React.FC = () => {
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
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <ThemeProvider>
        <ClassProvider>
          <KidsProvider>
            <Router>
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
                  <Routes>
                    <Route path="/" element={<Navigate to="/kids" replace />} />
                    <Route path="/kids" element={<KidListView />} />
                    <Route path="/kids/add" element={<KidAddView />} />
                    <Route path="/kids/:kidId" element={<KidDetailsView />} />
                    <Route path="/kids/:kidId/edit" element={<KidEditView />} />
                  </Routes>
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
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
            </Router>
          </KidsProvider>
        </ClassProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
