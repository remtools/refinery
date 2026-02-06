import { useState, useMemo } from 'react';
import { useTestCases } from '../hooks/useTestCases';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useAppContext } from '../context/AppContext';
import TestCaseCard from './TestCaseCard';
import TestCaseForm from './TestCaseForm';
import FilterBar from './FilterBar';
import Modal from './Modal';


interface TestCasesViewProps {
    acceptanceCriterionId?: string;
    onBack?: () => void;
    onNavigate?: (view: string, id: string) => void;
}

const TestCasesView = ({ acceptanceCriterionId, onBack, onNavigate }: TestCasesViewProps) => {
    const { state, dispatch } = useAppContext();
    const { selectedProjectId } = state;
    const { stories, loading: storiesLoading } = useStories();
    const { epics, loading: epicsLoading } = useEpics();
    const { acceptanceCriteria, loading: acLoading } = useAcceptanceCriteria();
    const { testCases, loading: tcLoading, error: tcError, createTestCase, updateTestCase, deleteTestCase } = useTestCases();
    const { actors } = useActors(selectedProjectId || undefined);

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
            return matchesSearch;
        });
    }, [testCases, acceptanceCriterionId, selectedProjectId, epics, stories, acceptanceCriteria, filters]);

    const parentAc = useMemo(() =>
        acceptanceCriterionId ? acceptanceCriteria.find(ac => ac.id === acceptanceCriterionId) : null
        , [acceptanceCriteria, acceptanceCriterionId]);

    const parentStory = useMemo(() =>
        parentAc ? stories.find(s => s.id === parentAc.story_id) : null
        , [stories, parentAc]);

    const actorName = useMemo(() =>
        parentStory ? actors.find(a => a.id === parentStory.actor_id)?.name || 'Unknown' : 'Unknown'
        , [actors, parentStory]);

    const handleCreate = async (data: any) => {
        // Ensure acceptance_criterion_id is included when creating from AC context
        const createData = acceptanceCriterionId
            ? { ...data, acceptance_criterion_id: acceptanceCriterionId, created_by: 'user' }
            : { ...data, created_by: 'user' };
        await createTestCase(createData);
        setShowForm(false);
    };

    const handleUpdate = async (data: any) => {
        await updateTestCase(editingItem.id, { ...data, updated_by: 'user' });
        setEditingItem(null);
    };

    if (tcLoading || acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading test cases...</div>;
    const clearError = () => {
        dispatch({ type: 'SET_ERROR', entity: 'testCases', error: null });
    };

    if (tcLoading || acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading test cases...</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            {tcError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in flex justify-between items-start">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-medium">Action Failed</h3>
                            <p className="text-red-700 text-sm mt-1">{tcError}</p>
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex-col">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        {parentAc && (() => {
                            const story = parentStory;
                            const epic = story ? epics.find(e => e.id === story.epic_id) : null;
                            const project = epic ? state.projects.find(p => p.id === epic.project_id) : null;

                            return (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {project && (
                                        <div className="flex items-center gap-2 group relative">
                                            <span
                                                className="hover:text-primary-600 cursor-pointer hover:underline"
                                                onClick={() => onNavigate?.('epics', project.id)} // Navigate to Epics list for project
                                            >
                                                {project.name}
                                            </span>
                                            <span className="text-gray-300">/</span>
                                        </div>
                                    )}
                                    {epic && (
                                        <div className="flex items-center gap-2 group relative">
                                            <span
                                                className="hover:text-primary-600 cursor-pointer hover:underline"
                                                title={epic.title}
                                                onClick={() => onNavigate?.('stories', epic.id)}
                                            >
                                                {epic.key || 'EP'}
                                            </span>
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 animate-fade-in">
                                                <div className="font-bold mb-1">{epic.title}</div>
                                                <div className="line-clamp-2">{epic.description}</div>
                                            </div>
                                            <span className="text-gray-300">/</span>
                                        </div>
                                    )}
                                    {story && (
                                        <div className="flex items-center gap-2 group relative">
                                            <span
                                                className="hover:text-primary-600 cursor-pointer hover:underline"
                                                title={story.action}
                                                onClick={() => onNavigate?.('acceptance-criteria', story.id)}
                                            >
                                                {story.key || 'STORY'}
                                            </span>
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 animate-fade-in">
                                                <div className="font-bold mb-1">As a {actorName}...</div>
                                                <div className="line-clamp-2">I want to {story.action} so that {story.outcome}</div>
                                            </div>
                                            <span className="text-gray-300">/</span>
                                        </div>
                                    )}
                                    {parentAc && (
                                        <div className="flex items-center gap-2 group relative">
                                            <span className="font-medium text-gray-900 border-b border-primary-500 cursor-default">
                                                {parentAc.key || 'AC'}
                                            </span>
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 animate-fade-in">
                                                <div className="font-bold mb-1">Given {parentAc.given}...</div>
                                                <div className="line-clamp-2">When {parentAc.when}, Then {parentAc.then}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

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
                                Test Cases
                            </h1>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-gradient-accent text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium"
                >
                    Add Test Case
                </button>
            </div>

            {parentStory && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                            <span className="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                {parentStory.key}
                            </span>
                            <span>Story Context</span>
                        </h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        <span className="font-semibold text-gray-600">As a</span> {actorName}, <span className="font-semibold text-gray-600">I want to</span> {parentStory.action} <span className="font-semibold text-gray-600">so that</span> {parentStory.outcome}
                    </p>
                </div>
            )}

            {
                parentAc && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <span className="text-primary-600 font-mono text-sm bg-primary-50 px-2 py-1 rounded border border-primary-100">
                                    {parentAc.key}
                                </span>
                                <span>Acceptance Criterion Details</span>
                            </h3>
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${parentAc.risk === 'High' ? 'bg-orange-100 text-orange-800' :
                                    parentAc.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                    {parentAc.risk} Risk
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-2">Given</span>
                                <p className="text-gray-800 text-sm leading-relaxed">{parentAc.given}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-2">When</span>
                                <p className="text-gray-800 text-sm leading-relaxed">{parentAc.when}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-2">Then</span>
                                <p className="text-gray-800 text-sm leading-relaxed">{parentAc.then}</p>
                            </div>
                        </div>
                    </div>
                )
            }
            <FilterBar
                placeholder="Search test cases..."
                onFilterChange={setFilters}
            />

            <Modal
                isOpen={showForm || !!editingItem}
                onClose={() => { setShowForm(false); setEditingItem(null); }}
            >
                {(showForm || editingItem) && (
                    <TestCaseForm
                        acceptanceCriterionId={acceptanceCriterionId}
                        initialData={editingItem}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        onSubmit={editingItem ? handleUpdate : handleCreate}
                    />
                )}
            </Modal>

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
        </div >
    );
};

export default TestCasesView;
