import React from 'react';
import { MoonStars, Sun } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import LanguageSelector from '../common/LanguageSelector';

const TopBarSettings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const label = theme === 'light' ? t('darkMode') : t('lightMode');

  return (
    <div className="d-flex align-items-center gap-1">
      <button
        type="button"
        className="topbar-icon-button"
        onClick={toggleTheme}
        title={label}
        aria-label={label}
      >
        {theme === 'light' ? <MoonStars /> : <Sun />}
      </button>

      <LanguageSelector />
    </div>
  );
};

export default TopBarSettings;
