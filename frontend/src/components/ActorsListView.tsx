import { useState, useMemo, useEffect } from 'react';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import ModernForm from './ModernForm';
import FilterBar from './FilterBar';

interface ActorsListViewProps {
    projectId?: string;
    isEmbedded?: boolean;
}

const ActorsListView = ({ projectId, isEmbedded = false }: ActorsListViewProps) => {
    const { state } = useAppContext();
    const { selectedProjectId } = state;
    // Use prop if provided, otherwise fallback to global selected project
    const activeProjectId = projectId || selectedProjectId;

    const { actors, loading, error, fetchActors, createActor, updateActor, deleteActor } = useActors(activeProjectId || undefined);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingActor, setEditingActor] = useState<any>(null);
    const [filters, setFilters] = useState({ search: '', status: '' });

    useEffect(() => {
        if (activeProjectId) {
            fetchActors(activeProjectId);
        }
    }, [activeProjectId, fetchActors]);

    const filteredActors = useMemo(() => {
        return actors.filter(actor => {
            const matchesSearch = actor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                (actor.role?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
                (actor.description?.toLowerCase() || '').includes(filters.search.toLowerCase());
            return matchesSearch;
        });
    }, [actors, filters]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading actors...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    const handleCreate = async (data: any) => {
        await createActor({ ...data, project_id: activeProjectId, created_by: 'user' });
        setShowCreateForm(false);
    };

    const handleUpdate = async (data: any) => {
        const updatePayload = {
            name: data.name,
            role: data.role,
            description: data.description,
            updated_by: 'user'
        };
        await updateActor(editingActor.id, updatePayload);
        setEditingActor(null);
    };

    return (
        <div className={isEmbedded ? "" : "container mx-auto px-6 py-8"}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Actors</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Define the key personas and actors for this project.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium"
                >
                    Add Actor
                </button>
            </div>

            <FilterBar
                placeholder="Search actors..."
                onFilterChange={setFilters}
            />

            {(showCreateForm || editingActor) && (
                <div className="mb-8 animate-fade-in">
                    <ModernForm
                        title={editingActor ? "Edit Actor" : "Create New Actor"}
                        submitButtonText={editingActor ? "Update Actor" : "Create Actor"}
                        initialData={editingActor || {}}
                        onSubmit={editingActor ? handleUpdate : handleCreate}
                        onCancel={() => { setShowCreateForm(false); setEditingActor(null); }}
                        fields={[
                            { name: 'name', label: 'Name (e.g. Admin, Customer)', type: 'text', required: true },
                            { name: 'role', label: 'Role / Title', type: 'text' },
                            { name: 'description', label: 'Description', type: 'textarea' }
                        ]}
                    />
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredActors.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">
                            {actors.length === 0 ? "No actors found. Add actors to use them in User Stories." : "No actors match your search."}
                        </p>
                    </div>
                ) : (
                    filteredActors.map((actor) => (
                        <div key={actor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{actor.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingActor(actor)}
                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Delete this actor?')) {
                                                await deleteActor(actor.id);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {actor.role && (
                                <div className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block mb-3">
                                    {actor.role}
                                </div>
                            )}
                            {actor.description && (
                                <p className="text-gray-600 text-sm line-clamp-3">{actor.description}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActorsListView;
