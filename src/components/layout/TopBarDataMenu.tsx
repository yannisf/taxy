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

interface TopBarDataMenuProps {
  theme: 'light' | 'dark';
}

const TopBarDataMenu: React.FC<TopBarDataMenuProps> = ({ theme }) => {
  const { t } = useTranslation(['common', 'messages', 'navigation']);
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const { refreshKids } = useKids();
  const [importExportDropdownOpen, setImportExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!selectedClass) {
      toast.error(t('messages:error.selectClassToExport'));
      return;
    }

    setIsExporting(true);
    try {
      await exportClassData(selectedClass.class_id);
      toast.success(t('messages:success.classDataExported'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('messages:error.failedToExportClassData'));
    } finally {
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
      toast.error(t('messages:error.selectClassToImport'));
      return;
    }

    setIsImporting(true);
    try {
      const validationResult = await validateImportFile(file, selectedClass.class_id);

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
          <span>{t('navigation:importExport')}</span>
          <ChevronDown size={14} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="start" className={`topbar-dropdown-menu medium ${theme === 'light' ? 'light' : 'dark'}`}>
          <Dropdown.Item onClick={() => { handleImportClick(); setImportExportDropdownOpen(false); }} disabled={!selectedClass || isImporting}>
            <span className="d-flex align-items-center gap-2"><Upload /> {t('navigation:importClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleExport(); setImportExportDropdownOpen(false); }} disabled={!selectedClass || isExporting || classKids.length === 0}>
            <span className="d-flex align-items-center gap-2"><Download /> {t('navigation:exportClass')}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileSelect} />

      {/* Import Confirmation Modal */}
      <Modal show={showImportConfirmModal} onHide={handleCancelImport} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('navigation:dialogs.confirmImport')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importValidationResult?.statistics && (
            <>
              <Alert variant="info">
                <h6>{t('navigation:dialogs.importSummary')}:</h6>
                <ul className="mb-0">
                  <li><strong>{importValidationResult.statistics.newKids}</strong> {t('navigation:dialogs.newKidsWillBeAdded')}</li>
                  <li><strong>{importValidationResult.statistics.updatedKids}</strong> {t('navigation:dialogs.existingKidsWillBeUpdated')}</li>
                  <li><strong>{importValidationResult.statistics.unchangedKids}</strong> {t('navigation:dialogs.kidsWillRemainUnchanged')}</li>
                  {importValidationResult.statistics.conflictingKids > 0 && (
                    <li><strong>{importValidationResult.statistics.conflictingKids}</strong> kids have IDs that exist in other classes (will be imported with new IDs)</li>
                  )}
                </ul>
              </Alert>
              {importValidationResult.statistics.conflictingKids > 0 && (
                <Alert variant="warning">
                  <strong>⚠️ ID Conflicts Detected</strong>
                  <div className="mt-2">
                    {importValidationResult.statistics.conflictingKids} kid(s) in the import file have IDs that already exist in other classes. These kids will be imported with new unique IDs to avoid conflicts, while the original kids in other classes remain intact.
                  </div>
                </Alert>
              )}
              <p className="mb-0">
                {t('navigation:dialogs.importFileStats', {
                  totalInFile: importValidationResult.statistics.totalInFile,
                  totalInDatabase: importValidationResult.statistics.totalInDatabase
                })}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelImport} disabled={isImporting}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="success" onClick={handleConfirmImport} disabled={isImporting}>
            {isImporting ? t('common:buttons.importing') : t('navigation:actions.confirmImport')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TopBarDataMenu;
