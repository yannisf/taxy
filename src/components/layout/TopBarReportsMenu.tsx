import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FilePdf, Envelope } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useClassKids } from '../../hooks/useClassKids';
import { exportGuardianEmails } from '../../utils/exportUtils';
import { useDropdownState } from '../../hooks/useModalState';
import TopBarMenuToggle from './TopBarMenuToggle';
import { logger } from '../../utils/logger';

// The PDF generators pull in pdfmake and ~260KB of embedded IEP Sans font data.
// They are imported dynamically inside the handlers so that weight stays out of
// the initial bundle and is only fetched when a report is actually requested.

const TopBarReportsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const dropdown = useDropdownState();
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);

  const handleGenerateCatalog = async () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsGeneratingCatalog(true);
    try {
      const { generateClassCatalogPDF } = await import('../../utils/pdf');
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
    <Dropdown show={dropdown.isOpen} onToggle={dropdown.toggle}>
      <TopBarMenuToggle id="reports-dropdown" label={t('menuReports')} isOpen={dropdown.isOpen} />
      <Dropdown.Menu align="start" className="topbar-dropdown-menu narrow">
        <Dropdown.Item onClick={() => { handleGenerateCatalog(); dropdown.close(); }} disabled={!selectedClass || isGeneratingCatalog || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><FilePdf /> {t('generateCatalog')}</span>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => { handleExportGuardianEmails(); dropdown.close(); }} disabled={!selectedClass || isExportingEmails || classKids.length === 0}>
          <span className="d-flex align-items-center gap-2"><Envelope /> {t('exportGuardianEmails')}</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TopBarReportsMenu;
