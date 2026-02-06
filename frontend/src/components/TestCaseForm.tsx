import { useAppContext } from '../context/AppContext';
import ModernForm from './ModernForm';

interface TestCaseFormProps {
    onSubmit: (data: any) => void;
    initialData?: any;
    acceptanceCriterionId?: string;
    onCancel?: () => void;
}

const TestCaseForm = ({ onSubmit, initialData, acceptanceCriterionId, onCancel }: TestCaseFormProps) => {
    const { state } = useAppContext();
    const { acceptanceCriteria } = state;

    const fields = [
        {
            name: 'acceptance_criterion_id',
            label: 'Parent Criterion',
            type: 'select' as const,
            options: acceptanceCriteria.map(ac => ({ value: ac.id, label: `${ac.key}: Given ${ac.given.substring(0, 50)}...` })),
            required: true,
            fullWidth: true
        },
        { name: 'preconditions', label: 'Preconditions', type: 'textarea' as const, required: true, placeholder: 'Initial context or setup' },
        { name: 'steps', label: 'Test Steps', type: 'textarea' as const, required: true, placeholder: '1. Open app\n2. Click login...' },
        { name: 'expected_result', label: 'Expected Result', type: 'textarea' as const, required: true, placeholder: 'What should happen?' },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select' as const,
            options: ['Low', 'Medium', 'High']
        },

    ];

    return (
        <ModernForm
            title={initialData ? "Edit Test Case" : "Create New Test Case"}
            submitButtonText={initialData ? "Update Test Case" : "Create Test Case"}
            initialData={initialData || { acceptance_criterion_id: acceptanceCriterionId, priority: 'Medium' }}
            onSubmit={onSubmit}
            onCancel={onCancel}
            fields={fields}
        />
    );
};

export default TestCaseForm;
