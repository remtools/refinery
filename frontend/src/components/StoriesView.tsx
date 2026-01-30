import { useState, useMemo } from 'react';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';
import FilterBar from './FilterBar';

interface StoriesViewProps {
  epicId: string;
  onBack: () => void;
  onViewAcceptanceCriteria: (storyId: string) => void;
}

const StoriesView = ({ epicId, onBack, onViewAcceptanceCriteria }: StoriesViewProps) => {
  const { epics } = useEpics();
  const { stories, loading, error, createStory, updateStory, deleteStory } = useStories();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const epic = useMemo(() => epics.find(e => e.id === epicId), [epics, epicId]);

  const filteredStories = useMemo(() => {
    return stories
      .filter(s => s.epic_id === epicId)
      .filter(s => {
        const matchesSearch =
          s.actor.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.action.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.outcome.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = !filters.status || s.status === filters.status;
        return matchesSearch && matchesStatus;
      });
  }, [stories, epicId, filters]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading stories...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!epic) return <div className="p-8 text-center text-gray-500">Epic not found</div>;

  const handleCreateStory = async (data: any) => {
    await createStory({ ...data, epic_id: epicId, created_by: 'user' });
    setShowCreateForm(false);
  };

  const handleUpdateStory = async (id: string, data: any) => {
    const updateData = {
      epic_id: data.epic_id,
      actor: data.actor,
      action: data.action,
      outcome: data.outcome,
      status: data.status,
      updated_by: 'user'
    };
    await updateStory(id, updateData);
    setEditingStory(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Breadcrumbs / Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={onBack} className="hover:text-primary-600 font-medium">
            Epics
          </button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-semibold">{epic.key}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{epic.title} Stories</h1>
            <p className="text-gray-600">{epic.description}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-button-hover transition-all duration-200 font-medium shadow-button flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Story
          </button>
        </div>
      </div>

      <FilterBar
        placeholder="Search stories in this epic..."
        onFilterChange={setFilters}
      />

      {(showCreateForm || editingStory) && (
        <div className="mb-8 animate-fade-in">
          <StoryForm
            onSubmit={editingStory ? (data) => handleUpdateStory(editingStory.id, data) : handleCreateStory}
            initialData={editingStory}
            epicId={epicId}
            onCancel={() => { setShowCreateForm(false); setEditingStory(null); }}
          />
        </div>
      )}

      <div className="grid gap-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">
              {stories.filter(s => s.epic_id === epicId).length === 0
                ? "No stories for this epic yet."
                : "No stories match your search."}
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

export default StoriesView;