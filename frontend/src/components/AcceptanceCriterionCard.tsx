import { AcceptanceCriterion } from '../types';
import { useStories } from '../hooks/useStories';

interface AcceptanceCriterionCardProps {
  acceptanceCriterion: AcceptanceCriterion;
  onEdit: () => void;
  onDelete: () => void;
}

const AcceptanceCriterionCard = ({ 
  acceptanceCriterion, 
  onEdit, 
  onDelete 
}: AcceptanceCriterionCardProps) => {
  const { stories } = useStories();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoryTitle = () => {
    const story = stories.find(s => s.id === acceptanceCriterion.story_id);
    return story ? `As a ${story.actor}, I want to ${story.action.toLowerCase()}` : 'Unknown Story';
  };

  const isLocked = acceptanceCriterion.status === 'Locked';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-600">{getStoryTitle()}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(acceptanceCriterion.status)}`}>
              {acceptanceCriterion.status}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(acceptanceCriterion.risk)}`}>
              {acceptanceCriterion.risk} Risk
            </span>
            {!acceptanceCriterion.valid && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                Invalid
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            disabled={isLocked}
            className={`p-2 rounded-md ${
              isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={isLocked ? 'Cannot edit locked acceptance criterion' : 'Edit acceptance criterion'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={isLocked}
            className={`p-2 rounded-md ${
              isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title={isLocked ? 'Cannot delete locked acceptance criterion' : 'Delete acceptance criterion'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <span className="font-semibold text-gray-700">Given:</span>
          <p className="text-gray-600 mt-1">{acceptanceCriterion.given}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">When:</span>
          <p className="text-gray-600 mt-1">{acceptanceCriterion.when}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Then:</span>
          <p className="text-gray-600 mt-1">{acceptanceCriterion.then}</p>
        </div>
      </div>
      
      {acceptanceCriterion.comments && (
        <div className="mb-4">
          <span className="font-semibold text-gray-700">Comments:</span>
          <p className="text-gray-600 mt-1 text-sm">{acceptanceCriterion.comments}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Created: {new Date(acceptanceCriterion.created_at).toLocaleDateString()}</span>
        <span>Updated: {new Date(acceptanceCriterion.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AcceptanceCriterionCard;