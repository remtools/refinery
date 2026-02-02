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
    {
      name: 'story_id',
      label: 'Parent Story',
      type: 'select' as const,
      options: stories.map(s => ({ value: s.id, label: `${s.key || 'STORY'} - As a ${getActorName(s.actor_id)}, I want to ${s.action}` })),
      required: true
    },
    { name: 'given', label: 'Given', type: 'textarea' as const, required: true, placeholder: 'Initial context' },
    { name: 'when', label: 'When', type: 'textarea' as const, required: true, placeholder: 'Action/Event' },
    { name: 'then', label: 'Then', type: 'textarea' as const, required: true, placeholder: 'Expected outcome' },
    {
      name: 'risk',
      label: 'Risk Level',
      type: 'select' as const,
      options: ['Low', 'Medium', 'High']
    },
    { name: 'comments', label: 'Comments', type: 'textarea' as const, placeholder: 'Additional notes' }
  ];

  return (
    <ModernForm
      title=""
      submitButtonText={initialData ? "Update Criterion" : "Create Criterion"}
      initialData={initialData || { story_id: storyId, risk: 'Medium' }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      fields={fields}
    />
  );
};

export default AcceptanceCriterionForm;