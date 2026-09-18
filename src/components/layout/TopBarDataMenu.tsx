import React, { useState, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Download, Upload } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useKids } from '../../hooks/useKids';
import { useModalState, useDropdownState } from '../../hooks/useModalState';
import { exportClassData } from '../../utils/exportUtils';
import { validateImportFile, performImport, type ImportValidationResult } from '../../utils/importUtils';
import ExportModal from '../classes/ExportModal';
import ImportConfirmModal from '../classes/ImportConfirmModal';
import TopBarMenuToggle from './TopBarMenuToggle';
import { logger } from '../../utils/logger';

const TopBarDataMenu: React.FC = () => {
  const { t } = useTranslation();
  const { selectedClass, selectClass, refreshClasses } = useClass();
  const { refreshKids } = useKids();

  const dropdown = useDropdownState();
  const exportModal = useModalState();
  const importModal = useModalState();

  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }
    exportModal.open();
    dropdown.close();
  };

  const handleConfirmExport = async () => {
    if (!selectedClass) return;

    exportModal.setLoading(true);
    try {
      await exportClassData(selectedClass.class_id);
      toast.success(t('classDataExported'));
      exportModal.close();
    } catch (error) {
      logger.error('Export failed:', error);
      toast.error(t('failedToExportClassData'));
    } finally {
      exportModal.setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    event.target.value = '';

    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error(t('invalidFileFormat'));
      return;
    }

    importModal.setLoading(true);
    try {
      const validationResult = await validateImportFile(file);

      if (!validationResult.valid) {
        toast.error(t('invalidImportFile'));
        logger.error('Import validation errors:', validationResult.errors);
        return;
      }

      setImportValidationResult(validationResult);
      importModal.open();
    } catch (error) {
      logger.error('Import validation failed:', error);
      toast.error(t('failedToValidateImportFile'));
    } finally {
      importModal.setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importValidationResult?.validatedKids || importValidationResult.validatedKids.length === 0) return;

    // Extract class_id from the first kid (all kids in import should have same class_id)
    const classIdFromImport = importValidationResult.validatedKids[0].class_id;

    importModal.setLoading(true);
    try {
      const result = await performImport(
        importValidationResult.validatedKids,
        classIdFromImport,
        importValidationResult.classData
      );
      if (result.success) {
        toast.success(t('importSuccessful', { count: result.statistics?.totalImported || 0 }));

        // Refresh classes to show the newly imported class
        await refreshClasses();

        // Auto-select the newly imported class in context
        await selectClass(classIdFromImport);

        // Refresh kids to show the imported students
        await refreshKids();
      } else {
        toast.error(t('importFailed'));
      }
    } catch (error) {
      logger.error('Import failed:', error);
      toast.error(t('importFailedUnexpected'));
    } finally {
      importModal.setLoading(false);
      handleCancelImport();
    }
  };

  const handleCancelImport = () => {
    importModal.close();
    setImportValidationResult(null);
  };

  return (
    <>
      <Dropdown show={dropdown.isOpen} onToggle={dropdown.toggle}>
        <TopBarMenuToggle id="import-export-dropdown" label={t('importExport')} isOpen={dropdown.isOpen} />
        <Dropdown.Menu align="start" className="topbar-dropdown-menu medium">
          <Dropdown.Item
            onClick={() => { handleImportClick(); dropdown.close(); }}
            disabled={importModal.isLoading}
          >
            <span className="d-flex align-items-center gap-2"><Upload /> {t('importClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item
            onClick={handleExport}
            disabled={!selectedClass || exportModal.isLoading}
          >
            <span className="d-flex align-items-center gap-2"><Download /> {t('exportClass')}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileSelect} />

      {/* Import Confirmation Modal */}
      <ImportConfirmModal
        show={importModal.show}
        onHide={handleCancelImport}
        onConfirm={handleConfirmImport}
        loading={importModal.isLoading}
        validationResult={importValidationResult}
      />

      {/* Export Modal */}
      <ExportModal
        show={exportModal.show}
        onHide={exportModal.close}
        onConfirmExport={handleConfirmExport}
        loading={exportModal.isLoading}
        className={selectedClass?.class_name}
        schoolName={selectedClass?.school_name}
        schoolYear={selectedClass?.school_year}
      />
    </>
  );
};

export default TopBarDataMenu;
