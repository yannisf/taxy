import React, { useState } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { List, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
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
  const { t } = useTranslation();
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
      expand="lg"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container fluid>
        <TopBarLogo />

        {/* Toggle buttons container - sidebar toggle on left, hamburger on right */}
        <div className="d-flex align-items-center gap-1 ms-auto d-lg-none">
          {/* Sidebar toggle button - shows on small screens only when a class is selected */}
          {onSidebarToggle && selectedClass && <SidebarToggleButton onClick={onSidebarToggle} />}

          {/* Hamburger toggle button - shows on mobile */}
          <Navbar.Toggle
            as="button"
            aria-controls="navbar-nav"
            aria-label={t('menu')}
            className="topbar-icon-button"
            onClick={handleHamburgerToggle}
          >
            {expanded ? <X /> : <List />}
          </Navbar.Toggle>
        </div>

        {/* Collapsible navbar content */}
        <Navbar.Collapse id="navbar-nav">
          {/* Menu items */}
          <Nav className="topbar-nav">
            <TopBarClassMenu />
            <TopBarDataMenu />
            <TopBarCardsMenu />
            <TopBarReportsMenu />
          </Nav>

          {/* Right-aligned items */}
          <Nav className="topbar-actions ms-auto align-items-lg-center">
            <TopBarSettings />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopBar;
