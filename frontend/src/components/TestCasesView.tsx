import { useState, useMemo } from 'react';
import { useTestCases } from '../hooks/useTestCases';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useAppContext } from '../context/AppContext';
import TestCaseCard from './TestCaseCard';
import TestCaseForm from './TestCaseForm';
import FilterBar from './FilterBar';

interface TestCasesViewProps {
    acceptanceCriterionId?: string;
    onBack?: () => void;
}

const TestCasesView = ({ acceptanceCriterionId, onBack }: TestCasesViewProps) => {
    const { state } = useAppContext();
    const { selectedProjectId } = state;
    const { stories, loading: storiesLoading } = useStories();
    const { epics, loading: epicsLoading } = useEpics();
    const { acceptanceCriteria, loading: acLoading } = useAcceptanceCriteria();
    const {
        testCases,
        loading: tcLoading,
        error: tcError,
        createTestCase,
        updateTestCase,
        deleteTestCase
    } = useTestCases();

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filters, setFilters] = useState({ search: '', status: '' });

    const filteredTestCases = useMemo(() => {
        let list = testCases;

        // Filter by project if selected and we are in "All Test Cases" mode
        if (selectedProjectId && !acceptanceCriterionId) {
            const projectEpicIds = new Set(epics.filter(e => e.project_id === selectedProjectId).map(e => e.id));
            const projectStoryIds = new Set(stories.filter(s => projectEpicIds.has(s.epic_id)).map(s => s.id));
            const projectAcIds = new Set(acceptanceCriteria.filter(ac => projectStoryIds.has(ac.story_id)).map(ac => ac.id));
            list = list.filter(tc => projectAcIds.has(tc.acceptance_criterion_id));
        }

        if (acceptanceCriterionId) {
            list = list.filter(tc => tc.acceptance_criterion_id === acceptanceCriterionId);
        }

        return list.filter(tc => {
            const matchesSearch =
                (tc.preconditions?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
                (tc.steps?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
                (tc.expected_result?.toLowerCase() || '').includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || tc.test_status === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [testCases, acceptanceCriterionId, selectedProjectId, epics, stories, acceptanceCriteria, filters]);

    const parentAc = useMemo(() =>
        acceptanceCriterionId ? acceptanceCriteria.find(ac => ac.id === acceptanceCriterionId) : null
        , [acceptanceCriteria, acceptanceCriterionId]);

    const handleCreate = async (data: any) => {
        await createTestCase({ ...data, created_by: 'user' });
        setShowForm(false);
    };

    const handleUpdate = async (data: any) => {
        await updateTestCase(editingItem.id, { ...data, updated_by: 'user' });
        setEditingItem(null);
    };

    if (tcLoading || acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading test cases...</div>;
    if (tcError) return <div className="p-8 text-center text-red-500">Error: {tcError}</div>;

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
                            {parentAc ? 'Test Cases' : 'Test Cases'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {parentAc ? (
                                <>For AC: <span className="font-medium italic">Given {parentAc.given.substring(0, 60)}...</span></>
                            ) : selectedProjectId ? (
                                "Test cases for the selected project"
                            ) : (
                                "Full list across all projects"
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-gradient-accent text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium"
                >
                    Add Test Case
                </button>
            </div>

            <FilterBar
                placeholder="Search test cases..."
                statusOptions={['Not Run', 'Pass', 'Fail', 'Blocked']}
                onFilterChange={setFilters}
            />

            {(showForm || editingItem) && (
                <div className="mb-8 animate-fade-in">
                    <TestCaseForm
                        acceptanceCriterionId={acceptanceCriterionId}
                        initialData={editingItem}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        onSubmit={editingItem ? handleUpdate : handleCreate}
                    />
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {filteredTestCases.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">
                            {testCases.length === 0 ? "No test cases found." : "No test cases match your search or project selection."}
                        </p>
                    </div>
                ) : (
                    filteredTestCases.map((tc) => (
                        <TestCaseCard
                            key={tc.id}
                            testCase={tc}
                            onEdit={() => setEditingItem(tc)}
                            onDelete={async () => {
                                if (window.confirm('Delete this test case?')) {
                                    await deleteTestCase(tc.id);
                                }
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TestCasesView;
