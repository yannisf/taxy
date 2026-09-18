import React from 'react';
import { People } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface SidebarToggleButtonProps {
  onClick: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="d-md-none topbar-icon-button sidebar-toggle-button"
      onClick={onClick}
      aria-label={t('toggleSidebar')}
      aria-expanded={false}
    >
      <People />
    </button>
  );
};

export default SidebarToggleButton;
