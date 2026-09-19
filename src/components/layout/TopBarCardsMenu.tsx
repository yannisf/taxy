import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useClassKids } from '../../hooks/useClassKids';
import { useDropdownState } from '../../hooks/useModalState';
import TopBarMenuToggle from './TopBarMenuToggle';
import { logger } from '../../utils/logger';

// The PDF generators pull in pdfmake and ~260KB of embedded IEP Sans font data.
// They are imported dynamically inside the handlers so that weight stays out of
// the initial bundle and is only fetched when a report is actually requested.

const TopBarCardsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const dropdown = useDropdownState();
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);
  const [isGeneratingGridBold, setIsGeneratingGridBold] = useState(false);
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

  const handleGenerateStudentGridBold = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingGridBold(true);
    try {
      const { generateStudentGridPDF } = await import('../../utils/pdf');
      await generateStudentGridPDF(selectedClass, classKids, t, { bold: true });
      toast.success(t('studentGridBoldGenerated'));
    } catch (error) {
      logger.error('Bold student grid generation failed:', error);
      toast.error(t('failedToGenerateStudentGridBold'));
    } finally {
      setIsGeneratingGridBold(false);
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
    <Dropdown show={dropdown.isOpen} onToggle={dropdown.toggle}>
      <TopBarMenuToggle id="cards-dropdown" label={t('menuCards')} isOpen={dropdown.isOpen} />
      <Dropdown.Menu align="start" className="topbar-dropdown-menu narrow">
        <Dropdown.Item onClick={() => { handleGenerateStudentGrid(); dropdown.close(); }} disabled={!selectedClass || isGeneratingGrid || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentGrid')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleGenerateStudentGridBold(); dropdown.close(); }} disabled={!selectedClass || isGeneratingGridBold || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentGridBold')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleGenerateStudentList(); dropdown.close(); }} disabled={!selectedClass || isGeneratingList || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentList')}</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TopBarCardsMenu;
