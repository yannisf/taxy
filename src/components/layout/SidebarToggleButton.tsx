import React from 'react';
import { Button } from 'react-bootstrap';
import { PeopleFill } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface SidebarToggleButtonProps {
  onClick: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Button
      className="d-sm-none sidebar-toggle-button"
      onClick={onClick}
      aria-label={t('toggleSidebar')}
      aria-expanded={false}
    >
      <PeopleFill />
    </Button>
  );
};

export default SidebarToggleButton;
