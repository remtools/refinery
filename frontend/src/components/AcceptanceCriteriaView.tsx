import { useState, useMemo } from 'react';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
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
    const { state } = useAppContext();
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

    if (acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading criteria...</div>;
    if (acError) return <div className="p-8 text-center text-red-500">Error: {acError}</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {parentStory ? 'Acceptance Criteria' : 'Acceptance Criteria'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {parentStory ? (
                                <>For Story: <span className="font-medium">As a {parentStory.actor}, I want to {parentStory.action} so that {parentStory.outcome}</span></>
                            ) : selectedProjectId ? (
                                "Criteria for the selected project"
                            ) : (
                                "Full list across all projects"
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium"
                >
                    Add Criterion
                </button>
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
