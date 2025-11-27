import React from 'react';
import { Navbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const TopBarLogo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Navbar.Brand className="d-flex align-items-center">
      <img src="/favicon.svg" alt="Taxy Logo" style={{ height: '48px', paddingRight: '0.75rem' }}/>{' '}
      <span className='fs-5'>{t('appName')}</span>
    </Navbar.Brand>
  );
};

export default TopBarLogo;
