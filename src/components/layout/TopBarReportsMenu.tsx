import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf, Envelope, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { exportGuardianEmails } from '../../utils/exportUtils';
import { generateClassCatalogPDF, generateStudentGridPDF, generateStudentListPDF } from '../../utils/pdfUtils';

interface TopBarReportsMenuProps {
  theme: 'light' | 'dark';
}

const TopBarReportsMenu: React.FC<TopBarReportsMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);

  const handleGenerateCatalog = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingCatalog(true);
    try {
      const classRecord = { ...selectedClass, kids: classKids };
      await generateClassCatalogPDF(classRecord, classKids, t);
      toast.success(t('catalogGenerated'));
    } catch (error) {
      console.error('Catalog generation failed:', error);
      toast.error(t('failedToGenerateCatalog'));
    } finally {
      setIsGeneratingCatalog(false);
    }
  };

  const handleExportGuardianEmails = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsExportingEmails(true);
    try {
      const result = await exportGuardianEmails(classKids, selectedClass.class_name, selectedClass.school_name);
      toast.success(t('guardianEmailsExported', { count: result.count }));
    } catch (error) {
      console.error('Guardian emails export failed:', error);
      if (error instanceof Error && error.message === 'No guardians with email addresses found') {
        toast.error(t('noGuardianEmailsFound'));
      } else {
        toast.error(t('failedToExportGuardianEmails'));
      }
    } finally {
      setIsExportingEmails(false);
    }
  };

  const handleGenerateStudentGrid = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingGrid(true);
    try {
      const classRecord = { ...selectedClass, kids: classKids };
      await generateStudentGridPDF(classRecord, classKids, t);
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
      const classRecord = { ...selectedClass, kids: classKids };
      await generateStudentListPDF(classRecord, classKids, t);
      toast.success(t('studentListGenerated'));
    } catch (error) {
      console.error('Student list generation failed:', error);
      toast.error(t('failedToGenerateStudentList'));
    } finally {
      setIsGeneratingList(false);
    }
  };

  return (
    <Dropdown show={reportsDropdownOpen} onToggle={(show: boolean) => setReportsDropdownOpen(show)} className="me-2">
      <Dropdown.Toggle
        as="a"
        id="reports-dropdown"
        className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
        role="button"
        aria-haspopup="menu"
        aria-expanded={reportsDropdownOpen}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        <span>{t('menuReports')}</span>
        <ChevronDown size={14} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="start" className={`topbar-dropdown-menu narrow ${theme === 'light' ? 'light' : 'dark'}`}>
        <Dropdown.Item onClick={() => { handleGenerateCatalog(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingCatalog || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateCatalog')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleGenerateStudentGrid(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingGrid || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentGrid')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleGenerateStudentList(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingList || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateStudentList')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleExportGuardianEmails(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isExportingEmails || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><Envelope /> {t('exportGuardianEmails')}</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TopBarReportsMenu;
