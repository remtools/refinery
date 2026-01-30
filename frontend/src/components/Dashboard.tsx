import { useEpics } from '../hooks/useEpics';
import EpicForm from './EpicForm';
import StoriesView from './StoriesView';
import SimpleEpicCard from './SimpleEpicCard';
import { useState } from 'react';

const Dashboard = () => {
  const { epics, loading, error, createEpic, updateEpic, deleteEpic } = useEpics();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);

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

  const handleCreateEpic = async (data: any) => {
    try {
      await createEpic(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  };

  const handleUpdateEpic = async (id: string, data: any) => {
    try {
      // Include required created_by field from the original epic
      const updateData = {
        ...data,
        created_by: editingEpic?.created_by || 'system',
        updated_by: 'user'
      };
      await updateEpic(id, updateData);
      setEditingEpic(null);
    } catch (error) {
      console.error('Failed to update epic:', error);
    }
  };

  const handleDeleteEpic = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this epic?')) {
      try {
        await deleteEpic(id);
      } catch (error) {
        console.error('Failed to delete epic:', error);
      }
    }
  };



  // Show stories view if an epic is selected
  if (selectedEpicId) {
    return (
      <StoriesView 
        epicId={selectedEpicId} 
        onBack={() => setSelectedEpicId(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Requirements Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Epic
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Epic</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <EpicForm onSubmit={handleCreateEpic} />
        </div>
      )}

      {editingEpic && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Epic</h2>
            <button
              onClick={() => setEditingEpic(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <EpicForm 
            onSubmit={(data) => handleUpdateEpic(editingEpic.id, data)} 
            initialData={editingEpic}
          />
        </div>
      )}

      <div className="grid gap-6">
        {epics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No epics found. Create your first epic to get started.</p>
          </div>
        ) : (
          epics.map((epic) => (
            <SimpleEpicCard
              key={epic.id}
              epic={epic}
              onEdit={() => setEditingEpic(epic)}
              onDelete={() => handleDeleteEpic(epic.id)}
              onViewStories={() => setSelectedEpicId(epic.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;