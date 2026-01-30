import { Story } from '../types';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';

interface StoryCardProps {
  story: Story;
  onEdit: () => void;
  onDelete: () => void;
  onViewAcceptanceCriteria?: () => void;
}

const StoryCard = ({ story, onEdit, onDelete, onViewAcceptanceCriteria }: StoryCardProps) => {
  const { epics } = useEpics();
  const epic = epics.find(e => e.id === story.epic_id);
  const { actors } = useActors(epic?.project_id);

  const getActorName = () => {
    if (!story.actor_id) return 'Unknown Actor';
    const actor = actors.find(a => a.id === story.actor_id);
    return actor ? actor.name : 'Unknown Actor';
  };

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

  const getEpicTitle = () => {
    return epic?.title || 'Unknown Epic';
  };

  const isLocked = story.status === 'Locked';
  const actorName = getActorName();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary-600 font-mono text-xs font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {story.key || 'STORY'}
            </span>
            <span className="text-sm text-blue-600">{getEpicTitle()}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(story.status)}`}>
              {story.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            As a {actorName}, I want to {story.action.toLowerCase()}, so that {story.outcome.toLowerCase()}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            disabled={isLocked}
            className={`p-2 rounded-md ${isLocked
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            title={isLocked ? 'Cannot edit locked story' : 'Edit story'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={isLocked}
            className={`p-2 rounded-md ${isLocked
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            title={isLocked ? 'Cannot delete locked story' : 'Delete story'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
        <div>
          <span className="font-medium text-gray-700">Actor:</span>
          <span className="ml-2 text-gray-600">{actorName}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Action:</span>
          <span className="ml-2 text-gray-600">{story.action}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Outcome:</span>
          <span className="ml-2 text-gray-600">{story.outcome}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="flex flex-col text-xs text-gray-500">
          <span>Created: {new Date(story.created_at).toLocaleDateString()}</span>
        </div>

        {onViewAcceptanceCriteria && (
          <button
            onClick={onViewAcceptanceCriteria}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
          >
            View Criteria
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryCard;