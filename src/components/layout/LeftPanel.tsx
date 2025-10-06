import React, { useState, useRef } from 'react';
import { ListGroup, Button, Modal, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, XLg, PersonFill, Plus, Download, Upload, FilePdf, Envelope, BoxArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import type { Kid } from '../../types/models';
import { exportClassData, exportGuardianEmails } from '../../utils/exportUtils';
import { generateClassCatalogPDF } from '../../utils/pdfUtils';
import { 
  validateImportFile, 
  performImport,
  type ImportValidationResult
} from '../../utils/importUtils';
import ClassModal from '../../components/classes/ClassModal';

const LeftPanel: React.FC = () => {
  const { t } = useTranslation(['navigation', 'kids', 'common', 'messages']);
  const { refreshKids } = useKids();
  const { selectedClass, clearSelectedClass, updateClass } = useClass();
  
  const handleCloseClass = () => {
    clearSelectedClass();
    // Navigate to default kids route to clear the main panel
    navigate('/kids');
  };
  const classKids = useClassKids();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const [hoveredKidId, setHoveredKidId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleKidClick = (kid: Kid) => {
    navigate(`/kids/${kid.kid_id}`);
  };

  const handleEdit = (kid: Kid, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/kids/${kid.kid_id}/edit`);
  };

  const handleDeleteClick = (kid: Kid, event: React.MouseEvent) => {
    event.stopPropagation();
    setKidToDelete(kid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (kidToDelete) {
      try {
        await db.deleteKid(kidToDelete.kid_id);
        await refreshKids(); // Refresh the list using context
        setShowDeleteModal(false);
        setKidToDelete(null);
        // Navigate to default view if the deleted kid was currently selected
        navigate('/kids');
      } catch (error) {
        console.error('Error deleting kid:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setKidToDelete(null);
  };

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
      // Create a ClassRecord object from the selected class and kids
      const classRecord = {
        ...selectedClass,
        kids: classKids
      };
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

  const handleEditClass = () => {
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async (classData: { school_name: string; class_name: string; school_year: string }) => {
    if (!selectedClass) return;

    setIsUpdatingClass(true);
    try {
      await updateClass(selectedClass.class_id, classData);
      toast.success(t('messages:success.classUpdated'));
      setShowEditClassModal(false);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    } finally {
      setIsUpdatingClass(false);
    }
  };

  // Kids are already sorted by the useClassKids hook
  const sortedKids = classKids;

  return (
    <>
      <div className="left-panel p-3">
        {/* Selected Class Display */}
        {selectedClass && (
          <div className="mb-3 p-3 bg-light rounded">
            <div className="mb-2">
              <div className="text-primary fw-bold">{selectedClass.school_name}</div>
              <div className="text-dark">
                {selectedClass.class_name} 
                <small className="text-muted ms-2">({selectedClass.school_year})</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleEditClass}
                title={t('classes:actions.editClass')}
              >
                <PencilSquare size={18} />
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleExport}
                disabled={isExporting || classKids.length === 0}
                title={isExporting ? t('common:buttons.exporting') : t('navigation:exportClassDataTooltip')}
              >
                <Download size={18} />
              </Button>
              <Button 
                variant="outline-success" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleImportClick}
                disabled={isImporting}
                title={isImporting ? t('common:buttons.importing') : t('navigation:importClassDataTooltip')}
              >
                <Upload size={18} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleGenerateCatalog}
                disabled={isGeneratingCatalog || classKids.length === 0}
                title={isGeneratingCatalog ? t('common:buttons.generating') : t('navigation:generateCatalogTooltip')}
              >
                <FilePdf size={18} />
              </Button>
              <Button 
                variant="outline-info" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleExportGuardianEmails}
                disabled={isExportingEmails || classKids.length === 0}
                title={isExportingEmails ? t('common:buttons.exporting') : t('navigation:exportGuardianEmailsTooltip')}
              >
                <Envelope size={18} />
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={handleCloseClass}
                title={t('navigation:closeClassTooltip')}
              >
                <BoxArrowLeft size={18} />
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                className="icon-action-button d-flex align-items-center justify-content-center"
                onClick={() => navigate('/kids/add')}
                disabled={!selectedClass}
                title={t('kids:actions.addKid')}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{t('navigation:kids')}</h5>
        </div>
        
        <ListGroup variant="flush">
          {sortedKids.map(kid => (
            <ListGroup.Item 
              key={kid.kid_id} 
              className="kid-list-item d-flex justify-content-between align-items-center py-2 px-0 border-0"
              style={{ 
                cursor: 'pointer',
                backgroundColor: hoveredKidId === kid.kid_id ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={() => setHoveredKidId(kid.kid_id)}
              onMouseLeave={() => setHoveredKidId(null)}
              onClick={() => handleKidClick(kid)}
            >
              <div className="kid-name-area flex-grow-1 d-flex align-items-center gap-2">
                <span className="text-truncate">
                  {(kid.preferred_name || kid.first_name)} {kid.last_name}
                </span>
                <Badge bg="secondary" className="d-flex align-items-center gap-1">
                  <PersonFill size={12} />
                  {kid.guardians.length}
                </Badge>
              </div>
              <div className="action-icons d-flex gap-1">
                <Button 
                  variant="link" 
                  size="sm"
                  className={`p-1 text-decoration-none icon-button edit-icon ${hoveredKidId === kid.kid_id ? 'visible' : 'invisible'}`}
                  onClick={(e) => handleEdit(kid, e)}
                  title={t('common:actions.edit')}
                >
                  <PencilSquare size={16} />
                </Button>
                <Button 
                  variant="link" 
                  size="sm"
                  className={`p-1 text-decoration-none icon-button delete-icon ${hoveredKidId === kid.kid_id ? 'visible' : 'invisible'}`}
                  onClick={(e) => handleDeleteClick(kid, e)}
                  title={t('common:actions.delete')}
                >
                  <XLg size={16} />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {sortedKids.length === 0 && selectedClass && (
            <ListGroup.Item variant="light" className="text-center border-0">
              {t('kids:messages.noKidsInClass')}
            </ListGroup.Item>
          )}
          {!selectedClass && (
            <ListGroup.Item variant="light" className="text-center border-0">
              {t('navigation:selectClassToViewKids')}
            </ListGroup.Item>
          )}
        </ListGroup>
        
        {selectedClass && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:dialogs.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('kids:dialogs.confirmDeleteKid', { 
            firstName: kidToDelete?.first_name, 
            lastName: kidToDelete?.last_name 
          })}
          <br />
          {t('common:dialogs.actionCannotBeUndone')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>

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

      {/* Edit Class Modal */}
      <ClassModal
        show={showEditClassModal}
        onHide={() => setShowEditClassModal(false)}
        onSubmit={handleUpdateClass}
        loading={isUpdatingClass}
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

export default LeftPanel;
