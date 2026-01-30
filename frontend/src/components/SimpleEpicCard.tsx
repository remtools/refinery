import { Epic } from '../types';

interface SimpleEpicCardProps {
  epic: Epic;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewStories?: () => void;
}

const SimpleEpicCard = ({ epic, onClick, onEdit, onDelete, onViewStories }: SimpleEpicCardProps) => {
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

  const isLocked = epic.status === 'Locked';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-500">{epic.key}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(epic.status)}`}>
              {epic.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{epic.title}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onViewStories?.(); }}
            className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
            title="View stories"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            disabled={isLocked}
            className={`p-2 rounded-md ${
              isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={isLocked ? 'Cannot edit locked epic' : 'Edit epic'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            disabled={isLocked}
            className={`p-2 rounded-md ${
              isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title={isLocked ? 'Cannot delete locked epic' : 'Delete epic'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{epic.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span>Created: {new Date(epic.created_at).toLocaleDateString()}</span>
        </div>
        <div className="text-xs text-gray-500">
          <span>Updated: {new Date(epic.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleEpicCard;