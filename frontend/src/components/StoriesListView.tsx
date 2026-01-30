import { useState, useMemo } from 'react';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';
import FilterBar from './FilterBar';

interface StoriesListViewProps {
    onViewAcceptanceCriteria: (storyId: string) => void;
}

const StoriesListView = ({ onViewAcceptanceCriteria }: StoriesListViewProps) => {
    const { state, dispatch } = useAppContext();
    const { selectedProjectId } = state;
    const { stories, loading: storiesLoading, error: storiesError, createStory, updateStory, deleteStory } = useStories();
    const { epics, loading: epicsLoading } = useEpics();
    const { actors } = useActors(selectedProjectId || undefined);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingStory, setEditingStory] = useState<any>(null);
    const [filters, setFilters] = useState({ search: '', status: '' });

    const filteredStories = useMemo(() => {
        // First filter by project if one is selected
        let list = stories;
        if (selectedProjectId) {
            const projectEpicIds = new Set(epics.filter(e => e.project_id === selectedProjectId).map(e => e.id));
            list = list.filter(s => projectEpicIds.has(s.epic_id));
        }

        // Then apply search filters
        return list.filter(s => {
            const actorName = actors.find(a => a.id === s.actor_id)?.name || '';
            const matchesSearch = actorName.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.action.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.outcome.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || s.status === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [stories, epics, selectedProjectId, filters, actors]);

    if (storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading stories...</div>;

    const clearError = () => {
        dispatch({ type: 'SET_ERROR', entity: 'stories', error: null });
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {storiesError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in flex justify-between items-start">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-medium">Action Failed</h3>
                            <p className="text-red-700 text-sm mt-1">{storiesError}</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        {selectedProjectId
                            ? "Stories for the selected project"
                            : "Full list of user stories across all projects"}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium"
                >
                    Create Story
                </button>
            </div>

            <FilterBar
                placeholder="Search stories..."
                onFilterChange={setFilters}
            />

            {(showCreateForm || editingStory) && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingStory ? 'Edit Story' : 'Create New Story'}
                        </h2>
                        <button
                            onClick={() => { setShowCreateForm(false); setEditingStory(null); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                    <StoryForm
                        onSubmit={async (data, keepOpen) => {
                            if (editingStory) {
                                const updateData = {
                                    epic_id: data.epic_id,
                                    actor_id: data.actor_id,
                                    action: data.action,
                                    outcome: data.outcome,
                                    status: data.status,
                                    updated_by: 'user'
                                };
                                await updateStory(editingStory.id, updateData);
                                setEditingStory(null);
                            } else {
                                await createStory(data);
                                if (!keepOpen) {
                                    setShowCreateForm(false);
                                }
                            }
                        }}
                        initialData={editingStory}
                        onCancel={() => { setShowCreateForm(false); setEditingStory(null); }}
                    />
                </div>
            )}

            <div className="grid gap-6">
                {filteredStories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">
                            {stories.length === 0 ? "No stories found. Create one to get started." : "No stories match your search or project selection."}
                        </p>
                    </div>
                ) : (
                    filteredStories.map((story) => (
                        <StoryCard
                            key={story.id}
                            story={story}
                            onEdit={() => setEditingStory(story)}
                            onDelete={async () => {
                                if (window.confirm('Delete this story?')) {
                                    await deleteStory(story.id);
                                }
                            }}
                            onViewAcceptanceCriteria={() => onViewAcceptanceCriteria(story.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default StoriesListView;
