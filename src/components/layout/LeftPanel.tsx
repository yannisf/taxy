import React, { useState, useEffect, useRef } from 'react';
import { ListGroup, Button, Modal, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, XLg, PersonFill, Plus, Download, Upload } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import type { Kid } from '../../types/models';
import { exportClassData } from '../../utils/exportUtils';
import { 
  validateImportFile, 
  performImport,
  type ImportValidationResult
} from '../../utils/importUtils';

const LeftPanel: React.FC = () => {
  const { kids, refreshKids } = useKids();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const [hoveredKidId, setHoveredKidId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importValidationResult, setImportValidationResult] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshKids();
  }, [refreshKids]);

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
    setIsExporting(true);
    try {
      await exportClassData();
      toast.success('Class data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export class data');
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
    if (!importValidationResult?.validatedKids) return;

    setIsImporting(true);
    try {
      const result = await performImport(importValidationResult.validatedKids);
      
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

  // Sort kids by preferred name (if exists) or legal name, then by surname
  const sortedKids = [...kids].sort((a, b) => {
    const aFirstName = a.preferred_name || a.name;
    const bFirstName = b.preferred_name || b.name;
    
    if (aFirstName.toLowerCase() !== bFirstName.toLowerCase()) {
      return aFirstName.toLowerCase().localeCompare(bFirstName.toLowerCase());
    }
    
    return a.surname.toLowerCase().localeCompare(b.surname.toLowerCase());
  });

  return (
    <>
      <div className="left-panel p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Class</h5>
          <Button 
            variant="link" 
            className="p-0 text-decoration-none"
            onClick={() => navigate('/kids/add')}
            title="Add Kid"
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
                  {(kid.preferred_name || kid.name)} {kid.surname}
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
                  title="Edit"
                >
                  <PencilSquare size={16} />
                </Button>
                <Button 
                  variant="link" 
                  size="sm"
                  className={`p-1 text-decoration-none icon-button delete-icon ${hoveredKidId === kid.kid_id ? 'visible' : 'invisible'}`}
                  onClick={(e) => handleDeleteClick(kid, e)}
                  title="Delete"
                >
                  <XLg size={16} />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {kids.length === 0 && (
            <ListGroup.Item variant="light" className="text-center border-0">
              No kids added yet
            </ListGroup.Item>
          )}
        </ListGroup>
        
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
              onClick={handleExport}
              disabled={isExporting || kids.length === 0}
              title="Export class data as JSON"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export Class'}
            </Button>
            <Button 
              variant="outline-success" 
              size="sm"
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
              onClick={handleImportClick}
              disabled={isImporting}
              title="Import class data from JSON"
            >
              <Upload size={16} />
              {isImporting ? 'Importing...' : 'Import Class'}
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{kidToDelete?.name} {kidToDelete?.surname}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Confirmation Modal */}
      <Modal show={showImportConfirmModal} onHide={handleCancelImport} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importValidationResult?.statistics && (
            <>
              <Alert variant="info">
                <h6>Import Summary:</h6>
                <ul className="mb-0">
                  <li><strong>{importValidationResult.statistics.newKids}</strong> new kids will be added</li>
                  <li><strong>{importValidationResult.statistics.updatedKids}</strong> existing kids will be updated</li>
                  <li><strong>{importValidationResult.statistics.unchangedKids}</strong> kids will remain unchanged</li>
                </ul>
              </Alert>
              <p className="mb-0">
                The import file contains <strong>{importValidationResult.statistics.totalInFile}</strong> kids. 
                Your current database has <strong>{importValidationResult.statistics.totalInDatabase}</strong> kids.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelImport} disabled={isImporting}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmImport} disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Confirm Import'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LeftPanel;
