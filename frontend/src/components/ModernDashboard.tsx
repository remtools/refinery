import { useState, useEffect, useMemo } from 'react';
import { useEpics } from '../hooks/useEpics';
import { useAppContext } from '../context/AppContext';
import ProjectsView from './ProjectsView';
import ModernLayout from './ModernLayout';
import ModernForm from './ModernForm';
import ModernEpicCard from './ModernEpicCard';
import StoriesView from './StoriesView';
import StoriesListView from './StoriesListView';
import AcceptanceCriteriaView from './AcceptanceCriteriaView';
import TestCasesView from './TestCasesView';
import FilterBar from './FilterBar';

const ModernDashboard = () => {
  const { state, setSelectedProjectId } = useAppContext();
  const { selectedProjectId, projects } = state;
  const { epics, createEpic, updateEpic, deleteEpic, fetchEpics } = useEpics();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [currentView, setCurrentView] = useState('projects');

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedAcId, setSelectedAcId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  // Sync epics with selected project
  useEffect(() => {
    fetchEpics(selectedProjectId || undefined);
    // If we've selected a project, move to Epics view if we were on Projects list
    if (selectedProjectId && currentView === 'projects') {
      setCurrentView('epics');
    }
    // If we have no project selected, force Projects view
    if (!selectedProjectId) {
      setCurrentView('projects');
    }
  }, [selectedProjectId]);

  const filteredEpics = useMemo(() => {
    return epics.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.key.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || e.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [epics, filters]);

  const handleCreateEpic = async (data: any, keepOpen?: boolean) => {
    try {
      await createEpic(data);
      if (!keepOpen) {
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  };

  const handleUpdateEpic = async (id: string, data: any) => {
    try {
      const updateData = {
        project_id: data.project_id,
        key: data.key,
        title: data.title,
        description: data.description,
        status: data.status,
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

  const handleViewStories = (id: string) => {
    setSelectedEpicId(id);
    setCurrentView('stories');
  };

  const renderContent = () => {
    if (!selectedProjectId || currentView === 'projects') {
      return (
        <ProjectsView
          onViewEpics={(projectId) => {
            setSelectedProjectId(projectId);
          }}
        />
      );
    }

    if (currentView === 'stories') {
      if (selectedEpicId) {
        return (
          <StoriesView
            epicId={selectedEpicId}
            onBack={() => setCurrentView('epics')}
            onViewAcceptanceCriteria={(storyId) => {
              setSelectedStoryId(storyId);
              setCurrentView('acceptance-criteria');
            }}
          />
        );
      }
      return <StoriesListView onViewAcceptanceCriteria={(storyId) => {
        setSelectedStoryId(storyId);
        setCurrentView('acceptance-criteria');
      }} />;
    }

    if (currentView === 'acceptance-criteria') {
      return (
        <AcceptanceCriteriaView
          storyId={selectedStoryId || undefined}
          onBack={() => {
            if (selectedStoryId && selectedEpicId) {
              setCurrentView('stories');
            } else {
              setCurrentView('epics');
              setSelectedStoryId(null);
            }
          }}
          onViewTestCases={(acId) => {
            setSelectedAcId(acId);
            setCurrentView('test-cases');
          }}
        />
      );
    }

    if (currentView === 'test-cases') {
      return (
        <TestCasesView
          acceptanceCriterionId={selectedAcId || undefined}
          onBack={() => {
            if (selectedAcId && selectedStoryId) {
              setCurrentView('acceptance-criteria');
            } else {
              setCurrentView('epics');
              setSelectedAcId(null);
            }
          }}
          onNavigate={(view, id) => {
            if (view === 'epics') {
              // id here is project id (assuming breadcrumb logic sends project.id)
              // or just go to epics view if we know the project is selected
              // The breadcrumb sends project.id
              setSelectedProjectId(id);
              setCurrentView('epics');
            } else if (view === 'stories') {
              // id is epic id
              setSelectedEpicId(id);
              setCurrentView('stories');
            } else if (view === 'acceptance-criteria') {
              // id is story id
              setSelectedStoryId(id);
              setCurrentView('acceptance-criteria');
            }
          }}
        />
      );
    }

    // Default: Epics View for selected project
    const activeProject = projects.find(p => p.id === selectedProjectId);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="hover:text-primary-600 font-medium"
                >
                  Projects
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-semibold truncate max-w-[200px]">
                  {activeProject?.name}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Epics</h1>
                  <p className="text-gray-600">
                    {epics.length === 0
                      ? 'No epics yet for this project.'
                      : `${filteredEpics.length} epic${filteredEpics.length !== 1 ? 's' : ''} in this project`
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

            <FilterBar
              placeholder="Search epics in this project..."
              statusOptions={['Draft', 'Approved', 'Locked']}
              onFilterChange={setFilters}
            />

            {(showCreateForm || editingEpic) && (
              <div className="mb-8 animate-fade-in">
                <ModernForm
                  title={editingEpic ? "Edit Epic" : "Create New Epic"}
                  submitButtonText={editingEpic ? "Update Epic" : "Create Epic"}
                  initialData={editingEpic || { project_id: selectedProjectId }}
                  onSubmit={editingEpic ? (data) => handleUpdateEpic(editingEpic.id, data) : handleCreateEpic}
                  onCancel={() => { setShowCreateForm(false); setEditingEpic(null); }}
                  fields={[
                    {
                      name: 'project_id',
                      label: 'Project',
                      type: 'select',
                      options: projects.map(p => ({ value: p.id, label: p.name })),
                      required: true
                    },
                    { name: 'key', label: 'Epic Key (e.g. REF-1)', type: 'text', required: true, disabled: !!editingEpic },
                    { name: 'title', label: 'Epic Title', type: 'text', required: true },
                    { name: 'description', label: 'Description', type: 'textarea', required: true },
                    { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Approved', 'Locked'] }
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEpics.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {epics.length === 0 ? "No Epics Yet" : "No Epics Found"}
                  </h3>
                  <p className="text-gray-500">
                    {epics.length === 0
                      ? "Start by creating an epic for this project."
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
              ) : (
                filteredEpics.map((epic) => (
                  <ModernEpicCard
                    key={epic.id}
                    epic={epic}
                    onEdit={() => setEditingEpic(epic)}
                    onDelete={() => handleDeleteEpic(epic.id, epic.title)}
                    onViewStories={() => handleViewStories(epic.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModernLayout currentView={currentView} onNavigate={(view) => {
      setCurrentView(view);
      // Reset hierarchical filters when switching tabs
      if (view === 'projects') {
        setSelectedProjectId(null);
      }
    }}>
      {renderContent()}
    </ModernLayout>
  );
};

export default ModernDashboard;