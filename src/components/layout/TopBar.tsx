import React from 'react';
import { Navbar, Container, Alert } from 'react-bootstrap';
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

  return (
    <Navbar fixed='top' bg={theme === 'light' ? 'light' : 'dark'} variant={theme === 'light' ? 'light' : 'dark'} expand="lg">
      <Container fluid>
        <TopBarLogo />
        
        {/* Menu items placed near the brand on the left for wider menu */}
        <div className="d-flex align-items-center gap-2 me-3 topbar-nav">
          <TopBarClassMenu theme={theme} />
          <TopBarDataMenu theme={theme} />
          <TopBarReportsMenu theme={theme} />
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto topbar-actions">
          {!selectedClass && classes.length === 0 && (
            <Alert variant="warning" className="mb-0 py-1 px-2 small">
              {t('noClassesAvailable')}
            </Alert>
          )}
          
          <TopBarSettings />
        </div>
      </Container>
    </Navbar>
  );
};

export default TopBar;
