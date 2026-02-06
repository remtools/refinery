import { useStories } from '../hooks/useStories';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import ModernForm from './ModernForm';

interface AcceptanceCriterionFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  storyId?: string;
  onCancel?: () => void;
}

const AcceptanceCriterionForm = ({ onSubmit, initialData, storyId, onCancel }: AcceptanceCriterionFormProps) => {
  const { state } = useAppContext();
  const { stories } = useStories();
  const { actors } = useActors(state.selectedProjectId || undefined);

  const getActorName = (actorId: string) => {
    const actor = actors.find(a => a.id === actorId);
    return actor ? actor.name : 'Unknown Actor';
  };

  const fields = [
    // Only show Story selection if we don't have a specific storyId passed down
    ...(!storyId ? [{
      name: 'story_id',
      label: 'Parent Story',
      type: 'select' as const,
      options: stories
        .filter(s => s.status !== 'Archived' || (initialData?.story_id && s.id === initialData.story_id))
        .map(s => ({ value: s.id, label: `${s.key || 'STORY'} - As a ${getActorName(s.actor_id)}, I want to ${s.action}` })),
      required: true,
      fullWidth: true
    }] : []),
    { name: 'given', label: 'Given', type: 'textarea' as const, required: true, placeholder: 'Initial context' },
    { name: 'when', label: 'When', type: 'textarea' as const, required: true, placeholder: 'Action/Event' },
    { name: 'then', label: 'Then', type: 'textarea' as const, required: true, placeholder: 'Expected outcome' },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: ['Drafted', 'Reviewed', 'Locked', 'Archived']
    },
    {
      name: 'risk',
      label: 'Risk Level',
      type: 'select' as const,
      options: ['Low', 'Medium', 'High']
    },
    { name: 'comments', label: 'Comments', type: 'textarea' as const, placeholder: 'Additional notes' }
  ];

  const currentStory = stories.find(s => s.id === storyId);

  return (
    <div className="space-y-4">
      {storyId && currentStory && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-blue-800 font-medium">Adding Criteria to Story</h3>
            <p className="text-blue-700 text-sm mt-1">
              <span className="font-semibold">{currentStory.key || 'STORY'}</span> - As a {getActorName(currentStory.actor_id)}, I want to {currentStory.action}
            </p>
          </div>
        </div>
      )}
      <ModernForm
        title={initialData ? "Edit Criterion" : "Create New Criterion"}
        submitButtonText={initialData ? "Update Criterion" : "Create Criterion"}
        initialData={initialData || { story_id: storyId, risk: 'Medium', status: 'Drafted' }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        fields={fields}
      />
    </div>
  );
};

export default AcceptanceCriterionForm;