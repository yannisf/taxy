import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';

// Import layout components
import TopBar from './components/layout/TopBar';
import LeftPanel from './components/layout/LeftPanel';

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
  return (
    <ThemeProvider>
      <ClassProvider>
        <KidsProvider>
          <Router>
          <div className="App d-flex flex-column min-vh-100">
            <TopBar />
            <Container fluid className="flex-grow-1 content-container">
              <Row className="h-100 gx-2">
                <Col xs={3} className="left-panel-col">
                  <LeftPanel />
                </Col>
                <Col xs={9} className="main-content-col">
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
  );
};

export default App;
