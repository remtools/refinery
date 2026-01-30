import { useState, useMemo } from 'react';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useAppContext } from '../context/AppContext';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';
import FilterBar from './FilterBar';

interface StoriesListViewProps {
    onViewAcceptanceCriteria: (storyId: string) => void;
}

const StoriesListView = ({ onViewAcceptanceCriteria }: StoriesListViewProps) => {
    const { state } = useAppContext();
    const { selectedProjectId } = state;
    const { stories, loading: storiesLoading, error: storiesError, createStory, updateStory, deleteStory } = useStories();
    const { epics, loading: epicsLoading } = useEpics();

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
            const matchesSearch = s.actor.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.action.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.outcome.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || s.status === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [stories, epics, selectedProjectId, filters]);

    if (storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading stories...</div>;
    if (storiesError) return <div className="p-8 text-center text-red-500">Error: {storiesError}</div>;

    return (
        <div className="container mx-auto px-6 py-8">
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
                        onSubmit={async (data) => {
                            if (editingStory) {
                                await updateStory(editingStory.id, data);
                                setEditingStory(null);
                            } else {
                                await createStory(data);
                                setShowCreateForm(false);
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
