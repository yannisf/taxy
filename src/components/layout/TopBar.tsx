                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import React, { useState, useRef } from 'react';
import { Navbar, Container, Button, Form, Alert, Dropdown, Modal } from 'react-bootstrap';
import { PlusCircle, MoonStars, Sun, PencilSquare, BoxArrowLeft, ChevronDown, Download, Upload, FilePdf, Envelope } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { useKids } from '../../contexts/KidsContext';
import ClassModal from '../classes/ClassModal';
import LanguageSelector from '../common/LanguageSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { exportClassData, exportGuardianEmails } from '../../utils/exportUtils';
import { generateClassCatalogPDF } from '../../utils/pdfUtils';
import { validateImportFile, performImport, type ImportValidationResult } from '../../utils/importUtils';

const TopBar: React.FC = () => {
  const { t } = useTranslation(['common', 'classes', 'messages', 'navigation']);
  const { classes, selectedClass, selectClass, createClass, updateClass, clearSelectedClass } = useClass();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [importExportDropdownOpen, setImportExportDropdownOpen] = useState(false);
  const classKids = useClassKids();
  const { refreshKids } = useKids();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClassSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = event.target.value;
    if (classId) {
      // Check if a kid is currently loaded (routes like /kids/:kidId or /kids/:kidId/edit)
      const isKidLoaded = location.pathname.match(/^\/kids\/[^/]+($|\/edit$)/);
      
      // If a kid is loaded, navigate to the class welcome page first
      if (isKidLoaded) {
        navigate('/kids');
      }
      
      await selectClass(classId);
    }
  };

  const handleCreateClass = async (classData: {
    school_name: string;
    class_name: string;
    school_year: string;
  }) => {
    setIsCreating(true);
    try {
      const newClass = await createClass(classData);
      toast.success(t('messages:success.classCreated'));
      // Automatically select the newly created class
      await selectClass(newClass.class_id);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(t('messages:error.failedToCreateClass'));
      throw error; // Re-throw to let the modal handle it
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = () => {
    if (!selectedClass) {
      toast.info(t('classes:messages.needSelectOrCreate'));
      return;
    }
    setShowEditModal(true);
  };

  const handleUpdateClass = async (classData: { school_name: string; class_name: string; school_year: string; }) => {
    if (!selectedClass) return;
    setIsUpdating(true);
    try {
      await updateClass(selectedClass.class_id, classData);
      toast.success(t('messages:success.classUpdated'));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(t('messages:error.unexpectedError'));
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseClass = async () => {
    clearSelectedClass();
    navigate('/kids');
  };

  const formatClassDisplay = (classObj: typeof selectedClass) => {
    if (!classObj) return '';
    return `${classObj.school_name} - ${classObj.class_name} (${classObj.school_year})`;
  };

  // Import/Export handlers
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

  const handleGenerateCatalog = async () => {
    if (!selectedClass) {
      toast.error(t('messages:error.selectClassToExport'));
      return;
    }

    setIsGeneratingCatalog(true);
    try {
      const classRecord = { ...selectedClass, kids: classKids };
      await generateClassCatalogPDF(classRecord, classKids, t);
      toast.success(t('messages:success.catalogGenerated'));
    } catch (error) {
      console.error('Catalog generation failed:', error);
      toast.error(t('messages:error.failedToGenerateCatalog'));
    } finally {
      setIsGeneratingCatalog(false);
    }
  };

  const handleExportGuardianEmails = async () => {
    if (!selectedClass) {
      toast.error(t('messages:error.selectClassToExport'));
      return;
    }

    setIsExportingEmails(true);
    try {
      const result = await exportGuardianEmails(classKids, selectedClass.class_name, selectedClass.school_name);
      toast.success(t('messages:success.guardianEmailsExported', { count: result.count }));
    } catch (error) {
      console.error('Guardian emails export failed:', error);
      if (error instanceof Error && error.message === 'No guardians with email addresses found') {
        toast.error(t('messages:error.noGuardianEmailsFound'));
      } else {
        toast.error(t('messages:error.failedToExportGuardianEmails'));
      }
    } finally {
      setIsExportingEmails(false);
    }
  };

  return (
    <>
      <Navbar fixed='top' bg={theme === 'light' ? 'light' : 'dark'} variant={theme === 'light' ? 'light' : 'dark'} expand="lg">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <img src="/logo.png" alt="Logo" style={{ height: '36px', paddingRight: '0.75rem' }}/>{' '}
            <span className='fs-5'>{t('common:appName')}</span>
          </Navbar.Brand>
          
          {/* Class dropdown placed near the brand on the left for wider menu */}
          <div className="d-flex align-items-center gap-2 me-3 topbar-nav">
            <Dropdown show={classDropdownOpen} onToggle={(show: boolean) => setClassDropdownOpen(show)}>
              <Dropdown.Toggle
                as="a"
                id="class-actions-dropdown"
                className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
                role="button"
                aria-haspopup="menu"
                aria-expanded={classDropdownOpen}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <span>{t('classes:title.classes')}</span>
                <ChevronDown size={14} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="start" className={`topbar-dropdown-menu wide ${theme === 'light' ? 'light' : 'dark'}`}>
                <Dropdown.ItemText onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{padding: '0.5rem 1rem'}}>
                  <Form.Select value={selectedClass?.class_id || ''} onChange={async (e) => {
                    await handleClassSelect(e);
                    // close the dropdown after selection
                    setClassDropdownOpen(false);
                  }} size="sm" style={{ width: '100%' }}>
                    <option value="">{t('classes:title.selectClass')}</option>
                    {classes.map(classObj => (
                      <option key={classObj.class_id} value={classObj.class_id}>
                        {formatClassDisplay(classObj)}
                      </option>
                    ))}
                  </Form.Select>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => { setShowCreateModal(true); setClassDropdownOpen(false); }}>
                  <span className="d-flex align-items-center gap-2"><PlusCircle /> {t('classes:actions.newClass')}</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => { handleEditClick(); setClassDropdownOpen(false); }} disabled={!selectedClass}>
                  <span className="d-flex align-items-center gap-2"><PencilSquare /> {t('classes:actions.editClass')}</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => { handleCloseClass(); setClassDropdownOpen(false); }} disabled={!selectedClass} title={t('navigation:closeClassTooltip')}>
                  <span className="d-flex align-items-center gap-2"><BoxArrowLeft /> {t('common:buttons.close')}</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            {/* Import/Export dropdown (moved to left) */}
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
                {/* Reports actions are in the Reports dropdown now */}
              </Dropdown.Menu>
            </Dropdown>

            {/* Hidden file input for import handled by Import/Export menu */}
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

            {/* Reports dropdown placed next to Classes */}
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
                <span>{t('navigation:menu.reports')}</span>
                <ChevronDown size={14} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="start" className={`topbar-dropdown-menu narrow ${theme === 'light' ? 'light' : 'dark'}`}>
                <Dropdown.Item onClick={() => { handleGenerateCatalog(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isGeneratingCatalog || classKids.length === 0}>
                  <span className="d-flex align-items-center gap-2"><FilePdf /> {t('navigation:generateCatalog')}</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => { handleExportGuardianEmails(); setReportsDropdownOpen(false); }} disabled={!selectedClass || isExportingEmails || classKids.length === 0}>
                  <span className="d-flex align-items-center gap-2"><Envelope /> {t('navigation:exportGuardianEmails')}</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto topbar-actions">
            {!selectedClass && classes.length === 0 && (
              <Alert variant="warning" className="mb-0 py-1 px-2 small">
                {t('classes:messages.noClassesAvailable')}
              </Alert>
            )}
            
            
            
            {/* Removed duplicate Import/Export dropdown on the right */}

            <Button variant="outline-secondary" size="sm" onClick={toggleTheme} title={theme === 'light' ? t('common:darkMode') : t('common:lightMode')}>
              {theme === 'light' ? <MoonStars/> : <Sun/>}
            </Button>
            
            <LanguageSelector />
          </div>
        </Container>
      </Navbar>

            <ClassModal show={showCreateModal} onHide={() => setShowCreateModal(false)} onSubmit={handleCreateClass} loading={isCreating}/>
            <ClassModal
              show={showEditModal}
              onHide={() => setShowEditModal(false)}
              onSubmit={handleUpdateClass}
              loading={isUpdating}
              mode="edit"
              initialData={selectedClass ? {
                school_name: selectedClass.school_name,
                class_name: selectedClass.class_name,
                school_year: selectedClass.school_year
              } : undefined}
            />
    </>
  );
};

export default TopBar;
