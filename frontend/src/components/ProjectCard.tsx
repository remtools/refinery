import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
    onViewEpics: () => void;
    onExport: () => void;
}

const ProjectCard = ({ project, onEdit, onDelete, onViewEpics, onExport }: ProjectCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-success-100 text-success-800';
            case 'Archived':
                return 'bg-gray-100 text-gray-800';
            case 'Planned':
                return 'bg-primary-100 text-primary-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Project</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {project.name}
                    </h3>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onExport}
                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        title="Export project"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                        title="Edit project"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-error-50 hover:text-error-600 transition-all duration-200"
                        title="Delete project"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                {project.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Created</span>
                    <span className="text-xs text-gray-600">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <button
                    onClick={onViewEpics}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
                >
                    View Epics
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
