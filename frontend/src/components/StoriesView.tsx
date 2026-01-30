import { useState } from 'react';
import { useEpics } from '../hooks/useEpics';
import { useStories } from '../hooks/useStories';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';

interface StoriesViewProps {
  epicId: string;
  onBack: () => void;
}

const StoriesView = ({ epicId, onBack }: StoriesViewProps) => {
  const { epics } = useEpics();
  const { stories, loading, error, createStory, updateStory, deleteStory } = useStories(epicId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  const epic = epics.find(e => e.id === epicId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!epic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Epic not found</div>
      </div>
    );
  }

  const handleCreateStory = async (data: any) => {
    try {
      await createStory(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleUpdateStory = async (id: string, data: any) => {
    try {
      await updateStory(id, data);
      setEditingStory(null);
    } catch (error) {
      console.error('Failed to update story:', error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory(id);
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Epics
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{epic.title}</h1>
          <p className="text-gray-600">{epic.key} - {epic.description}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">
          Stories ({stories.length})
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={epic.status === 'Locked'}
          className={`px-4 py-2 rounded-md ${
            epic.status === 'Locked'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Create Story
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Story</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <StoryForm onSubmit={handleCreateStory} epicId={epicId} />
        </div>
      )}

      {editingStory && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Story</h3>
            <button
              onClick={() => setEditingStory(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <StoryForm 
            onSubmit={(data) => handleUpdateStory(editingStory.id, data)} 
            initialData={editingStory}
          />
        </div>
      )}

      <div className="grid gap-6">
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No stories found for this epic. Create the first story to get started.</p>
          </div>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={() => setEditingStory(story)}
              onDelete={() => handleDeleteStory(story.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StoriesView;