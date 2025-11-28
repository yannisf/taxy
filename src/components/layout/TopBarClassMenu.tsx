import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { PlusCircle, PencilSquare, BoxArrowLeft, ChevronDown, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useModalState, useDropdownState } from '../../hooks/useModalState';
import ClassModal from '../classes/ClassModal';
import DeleteClassModal from '../classes/DeleteClassModal';

interface TopBarClassMenuProps {
  theme: 'light' | 'dark';
}

const TopBarClassMenu: React.FC<TopBarClassMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { classes, selectedClass, selectClass, createClass, updateClass, deleteClass, clearSelectedClass } = useClass();
  const navigate = useNavigate();
  const location = useLocation();

  const dropdown = useDropdownState();
  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const deleteWithKidsModal = useModalState();

  const [kidsCount, setKidsCount] = useState(0);

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
    createModal.setLoading(true);
    try {
      const newClass = await createClass(classData);
      toast.success(t('classCreated'));
      // Automatically select the newly created class
      await selectClass(newClass.class_id);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(t('failedToCreateClass'));
      throw error; // Re-throw to let the modal handle it
    } finally {
      createModal.setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!selectedClass) {
      toast.info(t('needSelectOrCreate'));
      return;
    }
    editModal.open();
  };

  const handleUpdateClass = async (classData: { school_name: string; class_name: string; school_year: string; }) => {
    if (!selectedClass) return;
    editModal.setLoading(true);
    try {
      await updateClass(selectedClass.class_id, classData);
      toast.success(t('classUpdated'));
      editModal.close();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(t('unexpectedError'));
      throw error;
    } finally {
      editModal.setLoading(false);
    }
  };

  const handleCloseClass = async () => {
    clearSelectedClass();
    navigate('/kids');
  };

  const handleDeleteClick = async () => {
    if (!selectedClass) {
      toast.info(t('needSelectOrCreate'));
      return;
    }

    // Check if class has kids by querying database
    const { db } = await import('../../services/database');
    const count = await db.getKidsCountByClassId(selectedClass.class_id);
    setKidsCount(count);

    if (count > 0) {
      deleteWithKidsModal.open();
    } else {
      deleteModal.open();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    deleteModal.setLoading(true);
    try {
      await deleteClass(selectedClass.class_id);
      toast.success(t('classDeleted'));
      deleteModal.close();
      navigate('/kids');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(t('failedToDeleteClass'));
    } finally {
      deleteModal.setLoading(false);
    }
  };

  const handleConfirmDeleteWithKids = async () => {
    if (!selectedClass) return;

    deleteWithKidsModal.setLoading(true);
    try {
      // Import db to delete kids first
      const { db } = await import('../../services/database');

      // Get all kids in this class
      const kids = await db.getKidsByClassId(selectedClass.class_id);

      // Delete all kids in this class
      for (const kid of kids) {
        await db.deleteKid(kid.kid_id);
      }

      // Now delete the class
      await deleteClass(selectedClass.class_id);
      toast.success(t('classAndKidsDeleted'));
      deleteWithKidsModal.close();
      navigate('/kids');
    } catch (error) {
      console.error('Error deleting class with kids:', error);
      toast.error(t('failedToDeleteClass'));
    } finally {
      deleteWithKidsModal.setLoading(false);
    }
  };

  const formatClassDisplay = (classObj: typeof selectedClass) => {
    if (!classObj) return '';
    return `${classObj.school_name} - ${classObj.class_name} (${classObj.school_year})`;
  };

  return (
    <>
      <Dropdown show={dropdown.isOpen} onToggle={dropdown.toggle}>
        <Dropdown.Toggle
          as="a"
          id="class-actions-dropdown"
          className={`nav-link no-caret text-decoration-none d-flex align-items-center gap-1 topbar-nav-item ${theme === 'light' ? 'text-dark' : 'text-white'}`}
          role="button"
          aria-haspopup="menu"
          aria-expanded={dropdown.isOpen}
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <span>{t('classes')}</span>
          <ChevronDown size={14} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="start" className={`topbar-dropdown-menu wide ${theme === 'light' ? 'light' : 'dark'}`}>
          <Dropdown.ItemText onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{padding: '0.5rem 1rem'}}>
            <Form.Select value={selectedClass?.class_id || ''} onChange={async (e) => {
              await handleClassSelect(e);
              dropdown.close();
            }} size="sm" style={{ width: '100%' }}>
              <option value="">{t('selectClassPlaceholder')}</option>
              {classes.map(classObj => (
                <option key={classObj.class_id} value={classObj.class_id}>
                  {formatClassDisplay(classObj)}
                </option>
              ))}
            </Form.Select>
          </Dropdown.ItemText>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => { createModal.open(); dropdown.close(); }}>
            <span className="d-flex align-items-center gap-2"><PlusCircle /> {t('newClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleEditClick(); dropdown.close(); }} disabled={!selectedClass}>
            <span className="d-flex align-items-center gap-2"><PencilSquare /> {t('editClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleCloseClass(); dropdown.close(); }} disabled={!selectedClass} title={t('closeClassTooltip')}>
            <span className="d-flex align-items-center gap-2"><BoxArrowLeft /> {t('close')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleDeleteClick(); dropdown.close(); }} disabled={!selectedClass}>
            <span className="d-flex align-items-center gap-2 text-danger"><Trash /> {t('deleteClass')}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Create Class Modal */}
      <ClassModal
        show={createModal.show}
        onHide={createModal.close}
        onSubmit={handleCreateClass}
        loading={createModal.isLoading}
      />

      {/* Edit Class Modal */}
      <ClassModal
        show={editModal.show}
        onHide={editModal.close}
        onSubmit={handleUpdateClass}
        loading={editModal.isLoading}
        mode="edit"
        initialData={selectedClass ? {
          school_name: selectedClass.school_name,
          class_name: selectedClass.class_name,
          school_year: selectedClass.school_year
        } : undefined}
      />

      {/* Delete Confirmation Modal (empty class) */}
      <DeleteClassModal
        show={deleteModal.show}
        onHide={deleteModal.close}
        onConfirm={handleConfirmDelete}
        loading={deleteModal.isLoading}
        classData={selectedClass}
        hasKids={false}
      />

      {/* Delete Confirmation Modal (class with kids) */}
      <DeleteClassModal
        show={deleteWithKidsModal.show}
        onHide={deleteWithKidsModal.close}
        onConfirm={handleConfirmDeleteWithKids}
        loading={deleteWithKidsModal.isLoading}
        classData={selectedClass}
        hasKids={true}
        kidsCount={kidsCount}
      />
    </>
  );
};

export default TopBarClassMenu;
