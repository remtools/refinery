import { useStories } from '../hooks/useStories';
import ModernForm from './ModernForm';

interface AcceptanceCriterionFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  storyId?: string;
  onCancel?: () => void;
}

const AcceptanceCriterionForm = ({ onSubmit, initialData, storyId, onCancel }: AcceptanceCriterionFormProps) => {
  const { stories } = useStories();

  const fields = [
    {
      name: 'story_id',
      label: 'Parent Story',
      type: 'select' as const,
      options: stories.map(s => ({ value: s.id, label: `As a ${s.actor}, I want to ${s.action}` })),
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