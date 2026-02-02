
import { TestCase } from '../types';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';

interface TestCaseCardProps {
    testCase: TestCase;
    onEdit: () => void;
    onDelete: () => void;
}

const TestCaseCard = ({ testCase, onEdit, onDelete }: TestCaseCardProps) => {
    const { acceptanceCriteria } = useAcceptanceCriteria();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low':
                return 'bg-blue-100 text-blue-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Critical':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pass':
                return 'bg-green-100 text-green-800';
            case 'Fail':
                return 'bg-red-100 text-red-800';
            case 'Blocked':
                return 'bg-orange-100 text-orange-800';
            case 'Not Run':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAcTitle = () => {
        const ac = acceptanceCriteria.find(a => a.id === testCase.acceptance_criterion_id);
        return ac ? `Given ${ac.given.substring(0, 50)}...` : 'Unknown Acceptance Criterion';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary-600 font-mono text-xs font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {testCase.key || 'TC'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(testCase.priority)}`}>
                            {testCase.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(testCase.test_status)}`}>
                            {testCase.test_status}
                        </span>
                    </div>
                    <h3 className="text-sm text-blue-600 font-medium mb-2">{getAcTitle()}</h3>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Preconditions</h4>
                    <p className="text-gray-700 text-sm">{testCase.preconditions}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Steps</h4>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{testCase.steps}</div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Expected Result</h4>
                    <p className="text-gray-700 text-sm">{testCase.expected_result}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 text-[10px] text-gray-400 italic">
                <span>Updated: {new Date(testCase.updated_at).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default TestCaseCard;
