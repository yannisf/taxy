import React from 'react';
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
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      type="button"
      title={`Switch to ${i18n.language === 'en' ? 'Greek' : 'English'}`}
    >
      {getCurrentLanguageLabel()}
    </button>
  );
};

export default LanguageSelector;
