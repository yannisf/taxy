import React, { useState } from 'react';
import { Navbar, Container, Nav, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useTheme } from '../../contexts/ThemeContext';
import TopBarLogo from './TopBarLogo';
import TopBarClassMenu from './TopBarClassMenu';
import TopBarDataMenu from './TopBarDataMenu';
import TopBarReportsMenu from './TopBarReportsMenu';
import TopBarSettings from './TopBarSettings';

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const { classes, selectedClass } = useClass();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar 
      fixed='top' 
      bg={theme === 'light' ? 'light' : 'dark'} 
      variant={theme === 'light' ? 'light' : 'dark'} 
      expand="lg"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container fluid>
        <TopBarLogo />
        
        {/* Hamburger toggle button - shows on mobile */}
        <Navbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)} />
        
        {/* Collapsible navbar content */}
        <Navbar.Collapse id="navbar-nav">
          {/* Menu items */}
          <Nav className="me-auto">
            <TopBarClassMenu theme={theme} />
            <TopBarDataMenu theme={theme} />
            <TopBarReportsMenu theme={theme} />
          </Nav>

          {/* Right-aligned items */}
          <Nav className="ms-auto align-items-lg-center">
            {!selectedClass && classes.length === 0 && (
              <Nav.Item className="px-2">
                <Alert variant="warning" className="mb-0 py-1 px-2 small">
                  {t('noClassesAvailable')}
                </Alert>
              </Nav.Item>
            )}
            
            <Nav.Item>
              <TopBarSettings />
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopBar;
