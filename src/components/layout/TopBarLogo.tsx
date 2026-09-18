import React from 'react';
import { Navbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const TopBarLogo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Navbar.Brand className="topbar-brand">
      <img src="/favicon.svg" alt="Entaxy Logo" />
      <span>{t('appName')}</span>
    </Navbar.Brand>
  );
};

export default TopBarLogo;
