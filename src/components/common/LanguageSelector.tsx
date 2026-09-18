import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const label = `Switch to ${i18n.language === 'en' ? 'Greek' : 'English'}`;

  return (
    <button
      type="button"
      className="topbar-icon-button topbar-icon-button-text"
      onClick={toggleLanguage}
      title={label}
      aria-label={label}
    >
      {i18n.language === 'en' ? 'EN' : 'EL'}
    </button>
  );
};

export default LanguageSelector;
