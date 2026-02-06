import { useEffect } from 'react';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useStatuses } from '../hooks/useStatuses';
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
  const { activeStatuses } = useStatuses('Global'); // Or 'Story' if we had specific types

  useEffect(() => {
    if (selectedProjectId) {
      fetchActors(selectedProjectId);
    }
  }, [selectedProjectId, fetchActors]);

  const currentEpic = epics.find(e => e.id === epicId);

  const fields = [
    // Only show Epic selection if we don't have a specific epicId passed down
    ...(!epicId ? [{
      name: 'epic_id',
      label: 'Parent Epic',
      type: 'select' as const,
      options: epics
        .filter(e => e.status !== 'Archived' || (initialData?.epic_id && e.id === initialData.epic_id))
        .map(e => ({ value: e.id, label: `${e.key || 'EP'} - ${e.title}` })),
      required: true
    }] : []),
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      fullWidth: true,
      options: activeStatuses.map(s => ({ value: s.key, label: s.label }))
    },
    {
      name: 'actor_id',
      label: 'Actor (As a...)',
      type: 'select' as const,
      required: true,
      fullWidth: true,
      options: actors.map(a => ({ value: a.id, label: a.name })),
      placeholder: 'Select an actor...'
    },
    { name: 'action', label: 'Action (I want to...)', type: 'textarea' as const, required: true, placeholder: 'e.g. log in' },
    { name: 'outcome', label: 'Outcome (So that...)', type: 'textarea' as const, required: true, placeholder: 'e.g. I can access my dashboard' },
  ];

  return (
    <div className="space-y-4">
      {epicId && currentEpic && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-blue-800 font-medium">Adding Story to Epic</h3>
            <p className="text-blue-700 text-sm mt-1">
              <span className="font-semibold">{currentEpic.key || 'EP'}</span> - {currentEpic.title}
            </p>
          </div>
        </div>
      )}
      <ModernForm
        title={initialData ? "Edit Story" : "Create New Story"}
        submitButtonText={initialData ? "Update Story" : "Create Story"}
        initialData={initialData || { epic_id: epicId, status: 'Drafted' }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        fields={fields}
      />
    </div>
  );
};

export default StoryForm;