import { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAppContext } from '../context/AppContext';
import ProjectCard from './ProjectCard';
import ModernForm from './ModernForm';
import FilterBar from './FilterBar';
import ActorsListView from './ActorsListView';

interface ProjectsViewProps {
    onViewEpics: (projectId: string) => void;
}

const ProjectEditTabs = ({ project, onUpdate }: { project: any, onUpdate: (data: any) => Promise<void> }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'actors'>('general');

    return (
        <div className="h-full flex flex-col">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 self-start">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'general'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('actors')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'actors'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Actors
                </button>
            </div>

            <div className="flex-1">
                {activeTab === 'general' ? (
                    <ModernForm
                        title=""
                        submitButtonText="Update Project"
                        initialData={project}
                        onSubmit={onUpdate}
                        onCancel={() => { }} // Hidden cancel in tabs
                        hideCancel={true}
                        className="shadow-none border-0 p-0"
                        fields={[
                            { name: 'name', label: 'Project Name', type: 'text', required: true },
                            { name: 'description', label: 'Description', type: 'textarea', required: true },
                            { name: 'status', label: 'Status', type: 'select', options: ['Planned', 'Active', 'Archived'] }
                        ]}
                    />
                ) : (
                    <ActorsListView projectId={project.id} isEmbedded={true} />
                )}
            </div>
        </div>
    );
};

const ProjectsView = ({ onViewEpics }: ProjectsViewProps) => {
    const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
    const { dispatch } = useAppContext();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [filters, setFilters] = useState({ search: '', status: '' });

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.description.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || p.status === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [projects, filters]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;

    const clearError = () => {
        dispatch({ type: 'SET_ERROR', entity: 'projects', error: null });
    };

    const handleCreate = async (data: any) => {
        await createProject({ ...data, created_by: 'user' });
        setShowCreateForm(false);
    };

    const handleUpdate = async (data: any) => {
        const updatePayload = {
            name: data.name,
            description: data.description,
            status: data.status,
            updated_by: 'user'
        };
        await updateProject(editingProject.id, updatePayload);
        setEditingProject(null);
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in flex justify-between items-start">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-medium">Action Failed</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-red-500 hover:text-red-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-1">Select a project to manage its requirements hierarchy</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </button>
            </div>

            <FilterBar
                placeholder="Search projects..."
                statusOptions={['Active', 'Planned', 'Archived']}
                onFilterChange={setFilters}
            />

            {(showCreateForm || editingProject) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </h2>
                            <button
                                onClick={() => { setShowCreateForm(false); setEditingProject(null); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto p-6">
                            {editingProject ? (
                                <ProjectEditTabs
                                    project={editingProject}
                                    onUpdate={handleUpdate}
                                />
                            ) : (
                                <ModernForm
                                    title=""
                                    submitButtonText="Create Project"
                                    initialData={{}}
                                    onSubmit={handleCreate}
                                    onCancel={() => setShowCreateForm(false)}
                                    // Remove shadow/border for embedded form
                                    className="shadow-none border-0 p-0"
                                    fields={[
                                        { name: 'name', label: 'Project Name', type: 'text', required: true },
                                        { name: 'description', label: 'Description', type: 'textarea', required: true },
                                        { name: 'status', label: 'Status', type: 'select', options: ['Planned', 'Active', 'Archived'] }
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {projects.length === 0 ? "No Projects Yet" : "No Projects Found"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {projects.length === 0
                                ? "Start by creating a project to organize your Epics and Stories."
                                : "Try adjusting your search or filters."}
                        </p>
                        {projects.length === 0 && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Create Your First Project
                            </button>
                        )}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={() => setEditingProject(project)}
                            onDelete={async () => {
                                if (window.confirm(`Delete project "${project.name}" and all its data ? `)) {
                                    await deleteProject(project.id);
                                }
                            }}
                            onViewEpics={() => onViewEpics(project.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsView;
