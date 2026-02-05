import { useEffect } from 'react';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import ModernForm from './ModernForm';

interface StoryFormProps {
  onSubmit: (data: any, keepOpen?: boolean) => void;
  initialData?: any;
  epicId?: string;
  onCancel?: () => void;
}

const StoryForm = ({ onSubmit, initialData, epicId, onCancel }: StoryFormProps) => {
  const { state } = useAppContext();
  const { selectedProjectId } = state;
  const { epics } = useEpics();
  const { actors, fetchActors } = useActors(selectedProjectId || undefined);

  useEffect(() => {
    if (selectedProjectId) {
      fetchActors(selectedProjectId);
    }
  }, [selectedProjectId, fetchActors]);

  const fields = [
    {
      name: 'epic_id',
      label: 'Parent Epic',
      type: 'select' as const,
      options: epics.map(e => ({ value: e.id, label: `${e.key || 'EPIC'} - ${e.title}` })),
      required: true
    },
    {
      name: 'actor_id',
      label: 'Actor (As a...)',
      type: 'select' as const,
      required: true,
      options: actors.map(a => ({ value: a.id, label: a.name })),
      placeholder: 'Select an actor...'
    },
    { name: 'action', label: 'Action (I want to...)', type: 'text' as const, required: true, placeholder: 'e.g. log in' },
    { name: 'outcome', label: 'Outcome (So that...)', type: 'textarea' as const, required: true, placeholder: 'e.g. I can access my dashboard' },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'Draft', label: 'Draft' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Locked', label: 'Locked' }
      ]
    },
  ];

  return (
    <ModernForm
      title={initialData ? "Edit Story" : "Create New Story"}
      submitButtonText={initialData ? "Update Story" : "Create Story"}
      initialData={initialData || { epic_id: epicId }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      fields={fields}
    />
  );
};

export default StoryForm;