import { useState } from 'react';
import { useEpics } from '../hooks/useEpics';
import ModernLayout from './ModernLayout';
import ModernForm from './ModernForm';
import ModernEpicCard from './ModernEpicCard';

const ModernDashboard = () => {
  const { epics, loading, error, createEpic, updateEpic, deleteEpic } = useEpics();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [currentView, setCurrentView] = useState('epics');

  if (loading) {
    return (
      <ModernLayout currentView={currentView} onNavigate={setCurrentView}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-primary-200 rounded-lg mx-auto mb-4"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading epics...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error) {
    return (
      <ModernLayout currentView={currentView} onNavigate={setCurrentView}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-error-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3L13.932 4c-.77-1.333-2.694-1.333-4.632 1L4.667 17c-.77 1.333.192 3 1.932 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-error-900 mb-2">Unable to Load Epics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </ModernLayout>
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

  const handleDeleteEpic = async (id: string, epicTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${epicTitle}"? This action cannot be undone.`)) {
      try {
        await deleteEpic(id);
      } catch (error) {
        console.error('Failed to delete epic:', error);
      }
    }
  };

  return (
    <ModernLayout currentView={currentView} onNavigate={setCurrentView}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Epics</h1>
              <p className="text-gray-600">
                {epics.length === 0 
                  ? 'No epics yet. Create your first epic in Refinery to get started.'
                  : `${epics.length} epic${epics.length !== 1 ? 's' : ''} in your refinery project`
                }
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-button-hover transition-all duration-200 font-medium shadow-button flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Epic
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 animate-fade-in">
            <ModernForm
              title="Create New Epic"
              submitButtonText="Create Epic"
              onSubmit={handleCreateEpic}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Edit Form */}
        {editingEpic && (
          <div className="mb-8 animate-fade-in">
            <ModernForm
              title="Edit Epic"
              submitButtonText="Update Epic"
              initialData={editingEpic}
              onSubmit={(data) => handleUpdateEpic(editingEpic.id, data)}
              onCancel={() => setEditingEpic(null)}
            />
          </div>
        )}

        {/* Epic Grid */}
        <div className="grid gap-6">
          {epics.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Epics Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Welcome to Refinery! Create your first epic to organize your requirements and track development progress.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-button-hover transition-all duration-200 font-medium shadow-button"
              >
                Create Your First Epic
              </button>
            </div>
          ) : (
            epics.map((epic) => (
              <ModernEpicCard
                key={epic.id}
                epic={epic}
                onEdit={() => setEditingEpic(epic)}
                onDelete={() => handleDeleteEpic(epic.id, epic.title)}
                onViewStories={() => setCurrentView('stories')}
              />
            ))
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default ModernDashboard;