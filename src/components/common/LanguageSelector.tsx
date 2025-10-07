import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'en' ? 'EN' : 'GR';
  };

  return (
    <Button
      variant="outline-secondary"
      size="sm"
      onClick={toggleLanguage}
      title={`Switch to ${i18n.language === 'en' ? 'Greek' : 'English'}`}
    >
      {getCurrentLanguageLabel()}
    </Button>
  );
};

export default LanguageSelector;
