import { Epic } from '../types';
import { useStatuses } from '../hooks/useStatuses';

interface ModernEpicCardProps {
  epic: Epic;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewStories?: () => void;
}

const ModernEpicCard = ({ epic, onEdit, onDelete, onViewStories }: ModernEpicCardProps) => {
  const { isDeletable, getStatusColor } = useStatuses('Epic');
  const isLocked = epic.status === 'Locked';
  const createdDate = new Date(epic.created_at);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'Approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-4h1a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2h1m6 0V7a2 2 0 012-2h1a2 2 0 012 2v6" />
          </svg>
        );
      case 'Locked':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 012-2h1m6 0V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };


  const editButtonProps = isLocked
    ? "p-2 text-gray-400 cursor-not-allowed bg-gray-50 rounded-lg"
    : "p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200";
  const deleteButtonProps = isDeletable(epic.status)
    ? "p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-200"
    : "p-2 text-gray-300 cursor-not-allowed bg-gray-50 rounded-lg";

  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-200 overflow-hidden hover-lift">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary-600 font-mono text-sm font-medium bg-white px-2 py-1 rounded-md shadow-soft">
              {epic.key}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(epic.status)}`}>
              {getStatusIcon(epic.status)}
              <span>{epic.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              disabled={isLocked}
              className={editButtonProps}
              title={isLocked ? 'Cannot edit locked epic' : 'Edit epic'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              disabled={!isDeletable(epic.status)}
              className={deleteButtonProps}
              title={!isDeletable(epic.status) ? 'Epic status prevents deletion' : 'Delete epic'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {epic.title}
          </h3>
          <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
            {epic.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{createdDate.toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onViewStories}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
          >
            View Stories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernEpicCard;