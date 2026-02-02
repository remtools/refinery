import { useState, useMemo } from 'react';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import AcceptanceCriterionCard from './AcceptanceCriterionCard';
import AcceptanceCriterionForm from './AcceptanceCriterionForm';
import FilterBar from './FilterBar';

interface AcceptanceCriteriaViewProps {
    storyId?: string;
    onBack?: () => void;
    onViewTestCases: (acId: string) => void;
}

const AcceptanceCriteriaView = ({ storyId, onBack, onViewTestCases }: AcceptanceCriteriaViewProps) => {
    const { state, dispatch } = useAppContext();
    const { selectedProjectId } = state;
    const { stories, loading: storiesLoading } = useStories();
    const { epics, loading: epicsLoading } = useEpics();
    const {
        acceptanceCriteria,
        loading: acLoading,
        error: acError,
        createAcceptanceCriterion,
        updateAcceptanceCriterion,
        deleteAcceptanceCriterion
    } = useAcceptanceCriteria(storyId);
    const { actors } = useActors(selectedProjectId || undefined);

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filters, setFilters] = useState({ search: '', status: '' });

    const filteredCriteria = useMemo(() => {
        let list = acceptanceCriteria;

        // Filter by project if selected and we are in "All ACs" mode
        if (selectedProjectId && !storyId) {
            const projectEpicIds = new Set(epics.filter(e => e.project_id === selectedProjectId).map(e => e.id));
            const projectStoryIds = new Set(stories.filter(s => projectEpicIds.has(s.epic_id)).map(s => s.id));
            list = list.filter(ac => projectStoryIds.has(ac.story_id));
        }

        if (storyId) {
            list = list.filter(ac => ac.story_id === storyId);
        }

        return list.filter(ac => {
            const matchesSearch = ac.given.toLowerCase().includes(filters.search.toLowerCase()) ||
                ac.when.toLowerCase().includes(filters.search.toLowerCase()) ||
                ac.then.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || ac.risk === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [acceptanceCriteria, storyId, selectedProjectId, epics, stories, filters]);

    const parentStory = storyId ? stories.find(s => s.id === storyId) : null;
    const parentEpic = parentStory ? epics.find(e => e.id === parentStory.epic_id) : null;

    if (acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading criteria...</div>;
    const clearError = () => {
        dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: null });
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {acError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in flex justify-between items-start">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-medium">Action Failed</h3>
                            <p className="text-red-700 text-sm mt-1">{acError}</p>
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
            {/* Breadcrumbs / Header */}
            <div className="mb-8">
                {parentStory && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        {onBack && (
                            <>
                                <button onClick={onBack} className="hover:text-primary-600 font-medium">
                                    {parentEpic ? parentEpic.key : 'Stories'}
                                </button>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                        <span className="text-gray-900 font-semibold">{parentStory.key}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {parentStory ? 'Acceptance Criteria' : 'Acceptance Criteria'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {parentStory ? (
                                <>For Story: <span className="font-medium">As a {actors.find(a => a.id === parentStory.actor_id)?.name || 'Unknown'}, I want to {parentStory.action} so that {parentStory.outcome}</span></>
                            ) : selectedProjectId ? (
                                "Criteria for the selected project"
                            ) : (
                                "Full list across all projects"
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Criterion
                    </button>
                </div>
            </div>

            <FilterBar
                placeholder="Search criteria..."
                statusOptions={['Low', 'Medium', 'High']}
                onFilterChange={setFilters}
            />

            {(showForm || editingItem) && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingItem ? 'Edit Criterion' : 'Create New Criterion'}
                        </h2>
                        <button
                            onClick={() => { setShowForm(false); setEditingItem(null); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                    <AcceptanceCriterionForm
                        storyId={storyId}
                        initialData={editingItem}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        onSubmit={async (data) => {
                            if (editingItem) {
                                await updateAcceptanceCriterion(editingItem.id, data);
                                setEditingItem(null);
                            } else {
                                await createAcceptanceCriterion(data);
                                setShowForm(false);
                            }
                        }}
                    />
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredCriteria.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">
                            {acceptanceCriteria.length === 0 ? "No acceptance criteria found." : "No criteria match your search or project selection."}
                        </p>
                    </div>
                ) : (
                    filteredCriteria.map((ac) => (
                        <AcceptanceCriterionCard
                            key={ac.id}
                            acceptanceCriterion={ac}
                            onEdit={() => setEditingItem(ac)}
                            onDelete={async () => {
                                if (window.confirm('Delete this criterion?')) {
                                    await deleteAcceptanceCriterion(ac.id);
                                }
                            }}
                            onViewTestCases={() => onViewTestCases(ac.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AcceptanceCriteriaView;
