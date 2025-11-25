import React from 'react';
import { Navbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const TopBarLogo: React.FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <Navbar.Brand className="d-flex align-items-center">
      <img src="/logo.png" alt="Logo" style={{ height: '36px', paddingRight: '0.75rem' }}/>{' '}
      <span className='fs-5'>{t('common:appName')}</span>
    </Navbar.Brand>
  );
};

export default TopBarLogo;
