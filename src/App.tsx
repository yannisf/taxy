import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Import layout components
import TopBar from './components/layout/TopBar';
import LeftPanel from './components/layout/LeftPanel';

// Import views
import KidListView from './components/kids/KidListView';
import KidAddView from './components/kids/KidAddView';
import KidDetailsView from './components/kids/KidDetailsView';
import KidEditView from './components/kids/KidEditView';

// Import context
import { KidsProvider } from './contexts/KidsContext';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  return (
    <KidsProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <TopBar />
          <Container fluid className="flex-grow-1">
            <Row className="h-100">
              <Col xs={3} className="left-panel-col border-end">
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
      </Router>
    </KidsProvider>
  );
};

export default App;
