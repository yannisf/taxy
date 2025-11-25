import React from 'react';
import { Button } from 'react-bootstrap';
import { MoonStars, Sun } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSelector from '../common/LanguageSelector';

const TopBarSettings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="d-flex align-items-center gap-2">
      <Button 
        variant="outline-secondary" 
        size="sm" 
        onClick={toggleTheme} 
        title={theme === 'light' ? t('darkMode') : t('lightMode')}
      >
        {theme === 'light' ? <MoonStars/> : <Sun/>}
      </Button>
      
      <LanguageSelector />
    </div>
  );
};

export default TopBarSettings;
