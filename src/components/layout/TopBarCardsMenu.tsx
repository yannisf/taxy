import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useClassKids } from '../../hooks/useClassKids';
import { logger } from '../../utils/logger';

// The PDF generators pull in pdfmake and ~260KB of embedded IEP Sans font data.
// They are imported dynamically inside the handlers so that weight stays out of
// the initial bundle and is only fetched when a report is actually requested.

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
      const { generateStudentGridPDF } = await import('../../utils/pdf');
      await generateStudentGridPDF(selectedClass, classKids, t);
      toast.success(t('studentGridGenerated'));
    } catch (error) {
      logger.error('Student grid generation failed:', error);
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
      const { generateStudentListPDF } = await import('../../utils/pdf');
      await generateStudentListPDF(selectedClass, classKids, t);
      toast.success(t('studentListGenerated'));
    } catch (error) {
      logger.error('Student list generation failed:', error);
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
