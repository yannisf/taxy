import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { ChevronDown } from 'react-bootstrap-icons';

interface TopBarMenuToggleProps {
  id: string;
  label: string;
  isOpen: boolean;
}

/**
 * Shared toggle for the top bar menus: a borderless pill that tints on hover
 * and while its menu is open. The chevron rotates to mirror the open state.
 */
const TopBarMenuToggle: React.FC<TopBarMenuToggleProps> = ({ id, label, isOpen }) => (
  <Dropdown.Toggle
    as="button"
    type="button"
    id={id}
    className="topbar-nav-item no-caret"
    aria-haspopup="menu"
    aria-expanded={isOpen}
  >
    <span>{label}</span>
    <ChevronDown className="topbar-nav-chevron" size={13} aria-hidden />
  </Dropdown.Toggle>
);

export default TopBarMenuToggle;
