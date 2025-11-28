import React, { useState, useRef } from 'react';
import { Dropdown, Modal, Button, Alert } from 'react-bootstrap';
import { Download, Upload, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { useKids } from '../../contexts/KidsContext';
import { exportClassData } from '../../utils/exportUtils';
import { validateImportFile, performImport, type ImportValidationResult } from '../../utils/importUtils';
import ExportModal, { type ExportOptions } from '../classes/ExportModal';

interface TopBarDataMenuProps {
  theme: 'light' | 'dark';
}

const TopBarDataMenu: React.FC<TopBarDataMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const { refreshKids } = useKids();
  const [importExportDropdownOpen, setImportExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }
    setShowExportModal(true);
    setImportExportDropdownOpen(false);
  };

  const handleConfirmExport = async (options: ExportOptions) => {
    console.log('handleConfirmExport called with options:', { encrypt: options.encrypt, hasPassword: !!options.password });
    if (!selectedClass) return;

    setIsExporting(true);
    try {
      console.log('Starting export with classId:', selectedClass.class_id);
      await exportClassData(selectedClass.class_id, options);
      console.log('Export completed successfully');

      // Clear password from options object immediately after use
      if (options.password) {
        options.password = '';
      }

      toast.success(
        options.encrypt
          ? t('encryptedClassDataExported')
          : t('classDataExported')
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);

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
      console.log('Setting isExporting to false');
      setIsExporting(false);
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
      toast.error('Please select a JSON file');
      return;
    }

    if (!selectedClass) {
      toast.error(t('selectClassToExport'));
      return;
    }

    setIsImporting(true);
    try {
      const validationResult = await validateImportFile(file);

      if (!validationResult.valid) {
        toast.error('Invalid import file');
        console.error('Import validation errors:', validationResult.errors);
        return;
      }

      setImportValidationResult(validationResult);
      setShowImportConfirmModal(true);
    } catch (error) {
      console.error('Import validation failed:', error);
      toast.error('Failed to validate import file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importValidationResult?.validatedKids || !selectedClass) return;

    setIsImporting(true);
    try {
      const result = await performImport(importValidationResult.validatedKids, selectedClass.class_id);
      if (result.success) {
        toast.success(result.message);
        await refreshKids();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import failed due to an unexpected error');
    } finally {
      setIsImporting(false);
      setShowImportConfirmModal(false);
      setImportValidationResult(null);
    }
  };

  const handleCancelImport = () => {
    setShowImportConfirmModal(false);
    setImportValidationResult(null);
  };

  return (
    <>
      <Dropdown show={importExportDropdownOpen} onToggle={(show: boolean) => setImportExportDropdownOpen(show)} className="me-2">
        <Dropdown.Toggle
          as="a"
          id="import-export-dropdown"
          className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
          role="button"
          aria-haspopup="menu"
          aria-expanded={importExportDropdownOpen}
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <span>{t('importExport')}</span>
          <ChevronDown size={14} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="start" className={`topbar-dropdown-menu medium ${theme === 'light' ? 'light' : 'dark'}`}>
          <Dropdown.Item onClick={() => { handleImportClick(); setImportExportDropdownOpen(false); }} disabled={!selectedClass || isImporting}>
            <span className="d-flex align-items-center gap-2"><Upload /> {t('importClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={handleExport} disabled={!selectedClass || isExporting || classKids.length === 0}>
            <span className="d-flex align-items-center gap-2"><Download /> {t('exportClass')}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileSelect} />

      {/* Import Confirmation Modal */}
      <Modal show={showImportConfirmModal} onHide={handleCancelImport} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmImportDialog')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <p className="mb-0">
              {importValidationResult?.validatedKids?.length} {importValidationResult?.validatedKids?.length === 1 ? 'kid' : 'kids'} will be imported to {selectedClass?.class_name}.
            </p>
          </Alert>
          <p className="text-muted">
            Any existing kids with the same ID will be overwritten with the imported data.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelImport} disabled={isImporting}>
            {t('cancel')}
          </Button>
          <Button variant="success" onClick={handleConfirmImport} disabled={isImporting}>
            {isImporting ? t('importing') : t('confirmImport')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onConfirmExport={handleConfirmExport}
        loading={isExporting}
        className={selectedClass?.class_name}
        schoolName={selectedClass?.school_name}
      />
    </>
  );
};

export default TopBarDataMenu;
