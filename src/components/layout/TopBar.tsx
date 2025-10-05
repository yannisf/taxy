import React, { useState } from 'react';
import { Navbar, Container, Button, Form, Alert } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import ClassModal from '../classes/ClassModal';
import LanguageSelector from '../common/LanguageSelector';

const TopBar: React.FC = () => {
  const { t } = useTranslation(['common', 'classes', 'messages']);
  const { classes, selectedClass, selectClass, createClass } = useClass();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleClassSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = event.target.value;
    if (classId) {
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

  const formatClassDisplay = (classObj: typeof selectedClass) => {
    if (!classObj) return '';
    return `${classObj.school_name} - ${classObj.class_name} (${classObj.school_year})`;
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand>{t('common:appName')}</Navbar.Brand>
          
          <div className="d-flex align-items-center gap-3 ms-auto">
            {!selectedClass && classes.length === 0 && (
              <Alert variant="warning" className="mb-0 py-1 px-2 small">
                {t('classes:messages.noClassesAvailable')}
              </Alert>
            )}
            
            {!selectedClass && classes.length > 0 && (
              <Alert variant="info" className="mb-0 py-1 px-2 small">
                {t('classes:messages.selectClassToManage')}
              </Alert>
            )}

            {classes.length > 0 && (
              <Form.Select
                value={selectedClass?.class_id || ''}
                onChange={handleClassSelect}
                style={{ width: '300px' }}
                className="me-2"
              >
                <option value="">{t('classes:title.selectClass')}</option>
                {classes.map(classObj => (
                  <option key={classObj.class_id} value={classObj.class_id}>
                    {formatClassDisplay(classObj)}
                  </option>
                ))}
              </Form.Select>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <PlusCircle size={16} />
              {t('classes:actions.newClass')}
            </Button>
            
            <LanguageSelector />
          </div>
        </Container>
      </Navbar>

      <ClassModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
        loading={isCreating}
      />
    </>
  );
};

export default TopBar;
