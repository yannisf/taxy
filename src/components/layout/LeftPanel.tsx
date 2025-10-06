import React, { useState, useRef } from 'react';
import { ListGroup, Button, Modal, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, XLg, PersonFill, Plus, Download, Upload, FilePdf } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import type { Kid } from '../../types/models';
import { exportClassData } from '../../utils/exportUtils';
import { generateClassCatalogPDF } from '../../utils/pdfUtils';
import { formatClassDisplay } from '../../utils/classUtils';
import { 
  validateImportFile, 
  performImport,
  type ImportValidationResult
} from '../../utils/importUtils';

const LeftPanel: React.FC = () => {
  const { t } = useTranslation(['navigation', 'kids', 'common', 'messages']);
  const { refreshKids } = useKids();
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const [hoveredKidId, setHoveredKidId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
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

  // Kids are already sorted by the useClassKids hook
  const sortedKids = classKids;

  return (
    <>
      <div className="left-panel p-3">
        {/* Selected Class Display */}
        {selectedClass && (
          <div className="mb-3 p-2 bg-light rounded">
            <small className="text-muted d-block">{t('navigation:currentClass')}:</small>
            <strong className="text-primary">{formatClassDisplay(selectedClass)}</strong>
          </div>
        )}

        {/* No Class Selected Warning */}
        {!selectedClass && (
          <Alert variant="warning" className="mb-3 py-2">
            <small>{t('navigation:selectClassToManageKids')}</small>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{t('navigation:kids')}</h5>
          <Button 
            variant="link" 
            className="p-0 text-decoration-none"
            onClick={() => navigate('/kids/add')}
            title={t('kids:actions.addKid')}
            disabled={!selectedClass}
          >
            <Plus size={20} />
          </Button>
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
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex gap-2 mb-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                className="flex-fill d-flex align-items-center justify-content-center gap-2"
                onClick={handleExport}
                disabled={isExporting || classKids.length === 0}
                title={t('navigation:exportClassDataTooltip')}
              >
                <Download size={16} />
                {isExporting ? t('common:buttons.exporting') : t('navigation:exportClass')}
              </Button>
              <Button 
                variant="outline-success" 
                size="sm"
                className="flex-fill d-flex align-items-center justify-content-center gap-2"
                onClick={handleImportClick}
                disabled={isImporting}
                title={t('navigation:importClassDataTooltip')}
              >
                <Upload size={16} />
                {isImporting ? t('common:buttons.importing') : t('navigation:importClass')}
              </Button>
            </div>
            <div className="d-flex">
              <Button 
                variant="outline-danger" 
                size="sm"
                className="flex-fill d-flex align-items-center justify-content-center gap-2"
                onClick={handleGenerateCatalog}
                disabled={isGeneratingCatalog || classKids.length === 0}
                title={t('navigation:generateCatalogTooltip')}
              >
                <FilePdf size={16} />
                {isGeneratingCatalog ? t('common:buttons.generating') : t('navigation:generateCatalog')}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
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
                </ul>
              </Alert>
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

export default LeftPanel;
