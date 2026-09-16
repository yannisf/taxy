import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf, Envelope, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useClassKids } from '../../hooks/useClassKids';
import { exportGuardianEmails } from '../../utils/exportUtils';
import { generateClassCatalogPDF } from '../../utils/pdf';
import { logger } from '../../utils/logger';

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

  const handleGenerateCatalog = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingCatalog(true);
    try {
      await generateClassCatalogPDF(selectedClass, classKids, t);
      toast.success(t('catalogGenerated'));
    } catch (error) {
      logger.error('Catalog generation failed:', error);
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
      logger.error('Guardian emails export failed:', error);
      if (error instanceof Error && error.message === 'No guardians with email addresses found') {
        toast.error(t('noGuardianEmailsFound'));
      } else {
        toast.error(t('failedToExportGuardianEmails'));
      }
    } finally {
      setIsExportingEmails(false);
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
        <Dropdown.Item onClick={() => { handleExportGuardianEmails(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isExportingEmails || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><Envelope /> {t('exportGuardianEmails')}</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TopBarReportsMenu;
