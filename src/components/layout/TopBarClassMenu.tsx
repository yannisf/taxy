import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { PlusCircle, PencilSquare, BoxArrowLeft, ChevronDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import ClassModal from '../classes/ClassModal';

interface TopBarClassMenuProps {
  theme: 'light' | 'dark';
}

const TopBarClassMenu: React.FC<TopBarClassMenuProps> = ({ theme }) => {
  const { t } = useTranslation();
  const { classes, selectedClass, selectClass, createClass, updateClass, clearSelectedClass } = useClass();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

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
      toast.success(t('classCreated'));
      // Automatically select the newly created class
      await selectClass(newClass.class_id);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(t('failedToCreateClass'));
      throw error; // Re-throw to let the modal handle it
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = () => {
    if (!selectedClass) {
      toast.info(t('needSelectOrCreate'));
      return;
    }
    setShowEditModal(true);
  };

  const handleUpdateClass = async (classData: { school_name: string; class_name: string; school_year: string; }) => {
    if (!selectedClass) return;
    setIsUpdating(true);
    try {
      await updateClass(selectedClass.class_id, classData);
      toast.success(t('classUpdated'));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(t('unexpectedError'));
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

  return (
    <>
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
          <span>{t('classes')}</span>
          <ChevronDown size={14} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="start" className={`topbar-dropdown-menu wide ${theme === 'light' ? 'light' : 'dark'}`}>
          <Dropdown.ItemText onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{padding: '0.5rem 1rem'}}>
            <Form.Select value={selectedClass?.class_id || ''} onChange={async (e) => {
              await handleClassSelect(e);
              // close the dropdown after selection
              setClassDropdownOpen(false);
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
          <Dropdown.Item onClick={() => { setShowCreateModal(true); setClassDropdownOpen(false); }}>
            <span className="d-flex align-items-center gap-2"><PlusCircle /> {t('newClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleEditClick(); setClassDropdownOpen(false); }} disabled={!selectedClass}>
            <span className="d-flex align-items-center gap-2"><PencilSquare /> {t('editClass')}</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => { handleCloseClass(); setClassDropdownOpen(false); }} disabled={!selectedClass} title={t('closeClassTooltip')}>
            <span className="d-flex align-items-center gap-2"><BoxArrowLeft /> {t('close')}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

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

export default TopBarClassMenu;
