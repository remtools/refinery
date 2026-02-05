import { useState, useMemo } from 'react';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
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
    const [filters, setFilters] = useState({ search: '', status: '', actor: '', risk: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Locked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const sortedStories = useMemo(() => {
        // First filter by project and search criteria (existing logic)
        let list = stories;
        if (selectedProjectId) {
            const projectEpicIds = new Set(epics.filter(e => e.project_id === selectedProjectId).map(e => e.id));
            list = list.filter(s => projectEpicIds.has(s.epic_id));
        }

        const result = list.filter(s => {
            const actorName = actors.find(a => a.id === s.actor_id)?.name || '';
            const matchesSearch = actorName.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.action.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.outcome.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || s.status === filters.status;
            const matchesActor = !filters.actor || s.actor_id === filters.actor;
            return matchesSearch && matchesStatus && matchesActor;
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = '';
                let bValue: any = '';

                switch (sortConfig.key) {
                    case 'key':
                        aValue = a.key || '';
                        bValue = b.key || '';
                        break;
                    case 'actor':
                        aValue = actors.find(act => act.id === a.actor_id)?.name || '';
                        bValue = actors.find(act => act.id === b.actor_id)?.name || '';
                        break;
                    case 'story':
                        aValue = a.action;
                        bValue = b.action;
                        break;
                    case 'status':
                        aValue = a.status;
                        bValue = b.status;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [stories, epics, selectedProjectId, filters, actors, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) {
            return (
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return (
            <svg className={`w-4 h-4 text-primary-500 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        );
    };

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
                statusOptions={['Draft', 'Approved', 'Locked']}
                actorOptions={actors.map(a => ({ id: a.id, name: a.name }))}
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {sortedStories.length === 0 ? (
                    <div className="text-center py-20 bg-white">
                        <p className="text-gray-500">
                            {stories.length === 0
                                ? "No stories found. Create one to get started."
                                : "No stories match your search or project selection."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('key')}>
                                        <div className="flex items-center gap-1">
                                            Key
                                            <SortIcon columnKey="key" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('actor')}>
                                        <div className="flex items-center gap-1">
                                            Actor
                                            <SortIcon columnKey="actor" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('story')}>
                                        <div className="flex items-center gap-1">
                                            Story
                                            <SortIcon columnKey="story" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">
                                            Status
                                            <SortIcon columnKey="status" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedStories.map((story) => {
                                    const isLocked = story.status === 'Locked';
                                    const actorName = actors.find(a => a.id === story.actor_id)?.name || 'Unknown';
                                    return (
                                        <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                                {story.key || 'STORY'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {actorName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-2xl">
                                                    <span className="font-semibold">I want to </span>
                                                    {story.action}
                                                    <span className="font-semibold"> so that </span>
                                                    {story.outcome}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(story.status)}`}>
                                                    {story.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => onViewAcceptanceCriteria(story.id)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded"
                                                        title="View Criteria"
                                                    >
                                                        Criteria
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const data = await api.exportStory(story.id);
                                                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `story-${story.key || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                                URL.revokeObjectURL(url);
                                                            } catch (err) {
                                                                console.error("Export failed:", err);
                                                                alert('Failed to export story');
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                                                        title="Export Story"
                                                    >
                                                        Export
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingStory(story)}
                                                        disabled={isLocked}
                                                        className={`px-3 py-1 rounded ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100'}`}
                                                        title={isLocked ? "Cannot edit locked story" : "Edit"}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this story?')) {
                                                                await deleteStory(story.id);
                                                            }
                                                        }}
                                                        disabled={isLocked}
                                                        className={`px-3 py-1 rounded ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'}`}
                                                        title={isLocked ? "Cannot delete locked story" : "Delete"}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoriesListView;
