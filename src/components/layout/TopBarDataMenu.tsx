import React, { useState, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Download, Upload, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { useKids } from '../../contexts/KidsContext';
import { useModalState, useDropdownState } from '../../hooks/useModalState';
import { exportClassData } from '../../utils/exportUtils';
import { validateImportFile, performImport, type ImportValidationResult } from '../../utils/importUtils';
import ExportModal, { type ExportOptions } from '../classes/ExportModal';
import ImportConfirmModal from '../classes/ImportConfirmModal';

interface TopBarDataMenuProps {
  theme: 'light' | 'dark';
}

const TopBarDataMenu: React.FC<TopBarDataMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { selectedClass, selectClass, refreshClasses } = useClass();
  const classKids = useClassKids();
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

  const handleConfirmExport = async (options: ExportOptions) => {
    if (!selectedClass) return;

    exportModal.setLoading(true);
    try {
      await exportClassData(selectedClass.class_id, options);

      // Clear password from options object immediately after use
      if (options.password) {
        options.password = '';
      }

      toast.success(
        options.encrypt
          ? t('encryptedClassDataExported')
          : t('classDataExported')
      );
      exportModal.close();
    } catch (error) {
      // Clear password even on error
      if (options.password) {
        options.password = '';
      }

      // Specific error messages based on error type
      if (error instanceof Error) {
        if (error.name === 'CryptoError' || error.name === 'CompressionError') {
          toast.error(t('encryptionFailed'));
        } else if (error.name === 'InvalidPasswordError') {
          toast.error(t('invalidPassword'));
        } else {
          toast.error(t('failedToExportClassData'));
        }
      } else {
        toast.error(t('failedToExportClassData'));
      }
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
        console.error('Import validation errors:', validationResult.errors);
        return;
      }

      setImportValidationResult(validationResult);
      importModal.open();
    } catch (error) {
      console.error('Import validation failed:', error);
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
      console.error('Import failed:', error);
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
      <Dropdown show={dropdown.isOpen} onToggle={dropdown.toggle} className="me-2">
        <Dropdown.Toggle
          as="a"
          id="import-export-dropdown"
          className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
          role="button"
          aria-haspopup="menu"
          aria-expanded={dropdown.isOpen}
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <span>{t('importExport')}</span>
          <ChevronDown size={14} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="start" className={`topbar-dropdown-menu medium ${theme === 'light' ? 'light' : 'dark'}`}>
          <Dropdown.Item
            onClick={() => { handleImportClick(); dropdown.close(); }}
            disabled={importModal.isLoading}
          >
            <span className="d-flex align-items-center gap-2"><Upload /> {t('importClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item
            onClick={handleExport}
            disabled={!selectedClass || exportModal.isLoading || classKids.length === 0}
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
        className={selectedClass?.class_name}
      />

      {/* Export Modal */}
      <ExportModal
        show={exportModal.show}
        onHide={exportModal.close}
        onConfirmExport={handleConfirmExport}
        loading={exportModal.isLoading}
        className={selectedClass?.class_name}
        schoolName={selectedClass?.school_name}
      />
    </>
  );
};

export default TopBarDataMenu;
