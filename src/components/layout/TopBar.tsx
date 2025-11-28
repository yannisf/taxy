import React, { useState } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { useClass } from '../../contexts/ClassContext';
import TopBarLogo from './TopBarLogo';
import TopBarClassMenu from './TopBarClassMenu';
import TopBarDataMenu from './TopBarDataMenu';
import TopBarCardsMenu from './TopBarCardsMenu';
import TopBarReportsMenu from './TopBarReportsMenu';
import TopBarSettings from './TopBarSettings';
import SidebarToggleButton from './SidebarToggleButton';

interface TopBarProps {
  onSidebarToggle?: () => void;
  onSidebarClose?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSidebarToggle, onSidebarClose }) => {
  const { theme } = useTheme();
  const { selectedClass } = useClass();
  const [expanded, setExpanded] = useState(false);

  const handleHamburgerToggle = () => {
    // Close sidebar when opening hamburger menu
    if (!expanded && onSidebarClose) {
      onSidebarClose();
    }
    setExpanded(!expanded);
  };

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

        {/* Toggle buttons container - sidebar toggle on left, hamburger on right */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Sidebar toggle button - shows on small screens only when a class is selected */}
          {onSidebarToggle && selectedClass && <SidebarToggleButton onClick={onSidebarToggle} />}

          {/* Hamburger toggle button - shows on mobile */}
          <Navbar.Toggle aria-controls="navbar-nav" onClick={handleHamburgerToggle} />
        </div>
        
        {/* Collapsible navbar content */}
        <Navbar.Collapse id="navbar-nav">
          {/* Menu items */}
          <Nav className="me-auto">
            <TopBarClassMenu theme={theme} />
            <TopBarDataMenu theme={theme} />
            <TopBarCardsMenu theme={theme} />
            <TopBarReportsMenu theme={theme} />
          </Nav>

          {/* Right-aligned items */}
          <Nav className="ms-auto align-items-lg-center">
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
