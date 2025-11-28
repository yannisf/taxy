import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { generateStudentGridPDF, generateStudentListPDF } from '../../utils/pdfUtils';

interface TopBarCardsMenuProps {
  theme: 'light' | 'dark';
}

const TopBarCardsMenu: React.FC<TopBarCardsMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const [cardsDropdownOpen, setCardsDropdownOpen] = useState(false);
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);

  const handleGenerateStudentGrid = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingGrid(true);
    try {
      await generateStudentGridPDF(selectedClass, classKids, t);
      toast.success(t('studentGridGenerated'));
    } catch (error) {
      console.error('Student grid generation failed:', error);
      toast.error(t('failedToGenerateStudentGrid'));
    } finally {
      setIsGeneratingGrid(false);
    }
  };

  const handleGenerateStudentList = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingList(true);
    try {
      await generateStudentListPDF(selectedClass, classKids, t);
      toast.success(t('studentListGenerated'));
    } catch (error) {
      console.error('Student list generation failed:', error);
      toast.error(t('failedToGenerateStudentList'));
    } finally {
      setIsGeneratingList(false);
    }
  };

  return (
    <Dropdown show={cardsDropdownOpen} onToggle={(show: boolean) => setCardsDropdownOpen(show)} className="me-2">
      <Dropdown.Toggle
        as="a"
        id="cards-dropdown"
        className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
        role="button"
        aria-haspopup="menu"
        aria-expanded={cardsDropdownOpen}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        <span>{t('menuCards')}</span>
        <ChevronDown size={14} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="start" className={`topbar-dropdown-menu narrow ${theme === 'light' ? 'light' : 'dark'}`}>
        <Dropdown.Item onClick={() => { handleGenerateStudentGrid(); setCardsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingGrid || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentGrid')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleGenerateStudentList(); setCardsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingList || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentList')}</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TopBarCardsMenu;
