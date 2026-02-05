import { useState, useMemo } from 'react';
import { useEpics } from '../hooks/useEpics';
import { useStories } from '../hooks/useStories';
import { useTestCases } from '../hooks/useTestCases';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useAppContext } from '../context/AppContext';

interface CreateTestSetModalProps {
    onClose: () => void;
    onCreate: (data: { title: string; description: string; status: 'Planned' | 'In Progress' | 'Completed'; created_by: string }, testCaseIds: string[]) => void;
}

const CreateTestSetModal = ({ onClose, onCreate }: CreateTestSetModalProps) => {
    const { state } = useAppContext();
    const { epics } = useEpics();
    const { stories } = useStories();
    const { acceptanceCriteria } = useAcceptanceCriteria();
    const { testCases } = useTestCases();

    const [step, setStep] = useState(1);
    const [selectedEpicId, setSelectedEpicId] = useState<string>('');
    const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
    const [storyStatusFilter, setStoryStatusFilter] = useState<string>('All');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // The Basket
    const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<Set<string>>(new Set());

    // Filter Stories based on Epic + Status
    const filteredStories = useMemo(() => {
        if (!selectedEpicId) return [];
        let list = stories.filter(s => s.epic_id === selectedEpicId);
        if (storyStatusFilter && storyStatusFilter !== 'All') {
            list = list.filter(s => s.status === storyStatusFilter);
        }
        return list;
    }, [selectedEpicId, stories, storyStatusFilter]);

    // Calculate test case counts per story for the table
    const storyTestCaseCounts = useMemo(() => {
        const counts = new Map<string, number>();
        filteredStories.forEach(story => {
            const acIds = new Set(acceptanceCriteria.filter(ac => ac.story_id === story.id).map(ac => ac.id));
            const count = testCases.filter(tc => acIds.has(tc.acceptance_criterion_id)).length;
            counts.set(story.id, count);
        });
        return counts;
    }, [filteredStories, acceptanceCriteria, testCases]);

    // Filter Logic for CURRENT SELECTION (to add to basket)
    const matchingTestCasesForSelection = useMemo(() => {
        if (!selectedEpicId && selectedStoryIds.size === 0) return [];
        if (selectedStoryIds.size === 0) return []; // Only add what is selected

        const acIds = new Set(acceptanceCriteria.filter(ac => selectedStoryIds.has(ac.story_id)).map(ac => ac.id));
        return testCases.filter(tc => acIds.has(tc.acceptance_criterion_id));
    }, [selectedEpicId, selectedStoryIds, testCases, acceptanceCriteria]);

    // Hierarchy Logic for Basket
    const basketHierarchy = useMemo(() => {
        const hierarchy: Record<string, { epic: any, stories: Record<string, { story: any, testCases: any[] }> }> = {};

        selectedTestCaseIds.forEach(tcId => {
            const tc = testCases.find(t => t.id === tcId);
            if (!tc) return;

            const ac = acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id);
            if (!ac) return;

            const story = stories.find(s => s.id === ac.story_id);
            if (!story) return;

            const epic = epics.find(e => e.id === story.epic_id);
            if (!epic) return;

            if (!hierarchy[epic.id]) {
                hierarchy[epic.id] = { epic, stories: {} };
            }
            if (!hierarchy[epic.id].stories[story.id]) {
                hierarchy[epic.id].stories[story.id] = { story, testCases: [] };
            }
            hierarchy[epic.id].stories[story.id].testCases.push(tc);
        });

        return hierarchy;
    }, [selectedTestCaseIds, testCases, acceptanceCriteria, stories, epics]);


    const handleEpicChange = (epicId: string) => {
        setSelectedEpicId(epicId);
        setSelectedStoryIds(new Set());
    };

    const handleToggleStory = (storyId: string) => {
        const newSet = new Set(selectedStoryIds);
        if (newSet.has(storyId)) {
            newSet.delete(storyId);
        } else {
            newSet.add(storyId);
        }
        setSelectedStoryIds(newSet);
    };

    const handleSelectAllStories = () => {
        if (selectedStoryIds.size === filteredStories.length) {
            setSelectedStoryIds(new Set());
        } else {
            setSelectedStoryIds(new Set(filteredStories.map(s => s.id)));
        }
    };

    const handleRemoveStoryFromBasket = (storyId: string) => {
        const acIds = new Set(acceptanceCriteria.filter(ac => ac.story_id === storyId).map(ac => ac.id));
        const tcsToRemove = testCases.filter(tc => acIds.has(tc.acceptance_criterion_id) && selectedTestCaseIds.has(tc.id));

        if (tcsToRemove.length > 0) {
            const newSet = new Set(selectedTestCaseIds);
            tcsToRemove.forEach(tc => newSet.delete(tc.id));
            setSelectedTestCaseIds(newSet);
        }
    };

    const handleAddToBasket = () => {
        const newSet = new Set(selectedTestCaseIds);
        matchingTestCasesForSelection.forEach(tc => newSet.add(tc.id));
        setSelectedTestCaseIds(newSet);
    };

    const handleRemoveFromBasket = (id: string) => {
        const newSet = new Set(selectedTestCaseIds);
        newSet.delete(id);
        setSelectedTestCaseIds(newSet);
    };

    const handleSubmit = () => {
        onCreate({
            title,
            description,
            status: 'Planned',
            created_by: 'user'
        }, Array.from(selectedTestCaseIds));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!title) {
                // Determine title based on primary epic in basket if any
                const epicIds = Object.keys(basketHierarchy);
                if (epicIds.length === 1) {
                    const epic = epics.find(e => e.id === epicIds[0]);
                    setTitle(`Test Set: ${epic?.key} - ${new Date().toLocaleDateString()}`);
                } else {
                    setTitle(`Test Set - ${new Date().toLocaleDateString()}`);
                }
            }
            setStep(2);
        }
    };

    const filteredEpics = state.selectedProjectId
        ? epics.filter(e => e.project_id === state.selectedProjectId)
        : epics;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className={`bg-white rounded-xl shadow-2xl w-full ${step === 1 ? 'max-w-6xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col transition-all duration-300`}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Create New Test Set</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Stepper */}
                    <div className="flex items-center mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-primary-600 text-white shadow-md transform scale-110' : step > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} font-bold text-sm transition-all`}>
                            {step > 1 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '1'}
                        </div>
                        <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-primary-600 text-white shadow-md transform scale-110' : 'bg-gray-200 text-gray-500'} font-bold text-sm transition-all`}>2</div>
                    </div>

                    {step === 1 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                            {/* Left Column: Scope Selection */}
                            <div className="flex flex-col h-full space-y-4">
                                <h3 className="font-semibold text-lg text-gray-900">1. Browse & Select Scope</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Epic</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={selectedEpicId}
                                            onChange={(e) => handleEpicChange(e.target.value)}
                                        >
                                            <option value="">Select an Epic...</option>
                                            {filteredEpics.map(e => (
                                                <option key={e.id} value={e.id}>{e.key}: {e.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedEpicId && (
                                        <>
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                <span className="text-sm font-medium text-gray-700">Filter Stories</span>
                                                <select
                                                    className="text-xs border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1"
                                                    value={storyStatusFilter}
                                                    onChange={(e) => setStoryStatusFilter(e.target.value)}
                                                >
                                                    <option value="All">All Statuses</option>
                                                    <option value="Draft">Draft</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Locked">Locked</option>
                                                </select>
                                            </div>

                                            <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filteredStories.length > 0 && selectedStoryIds.size === filteredStories.length}
                                                                        onChange={handleSelectAllStories}
                                                                        className="rounded text-primary-600 focus:ring-primary-500"
                                                                    />
                                                                </th>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Story</th>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {filteredStories.map(s => (
                                                                <tr key={s.id} className={`hover:bg-gray-50 cursor-pointer ${selectedStoryIds.has(s.id) ? 'bg-blue-50' : ''}`} onClick={() => handleToggleStory(s.id)}>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedStoryIds.has(s.id)}
                                                                            onChange={() => handleToggleStory(s.id)}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="rounded text-primary-600 focus:ring-primary-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="text-xs font-mono text-gray-500">{s.key}</div>
                                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={s.action}>{s.action}</div>
                                                                    </td>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                            {s.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
                                                                        {storyTestCaseCounts.get(s.id) || 0}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {filteredStories.length === 0 && (
                                                        <div className="p-4 text-center text-gray-500 text-sm">No stories found.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-4 mt-auto border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            {matchingTestCasesForSelection.length} test cases ready to add
                                        </div>
                                        <button
                                            onClick={handleAddToBasket}
                                            disabled={matchingTestCasesForSelection.length === 0}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add to Basket
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Basket */}
                            <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        Basket
                                    </h3>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-600 border border-gray-200">
                                        {selectedTestCaseIds.size} Items
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {selectedTestCaseIds.size === 0 ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            <p>Your basket is empty.</p>
                                            <p className="text-sm mt-1">Select stories on the left and click "Add to Basket".</p>
                                        </div>
                                    ) : (
                                        Object.values(basketHierarchy).map(({ epic, stories }) => (
                                            <div key={epic.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
                                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded border border-primary-100">{epic.key}</span>
                                                    <span className="text-sm font-semibold text-gray-800">{epic.title}</span>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {Object.values(stories).map(({ story, testCases }) => (
                                                        <div key={story.id} className="p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                                    <span className="text-xs font-mono text-gray-500">{story.key}</span>
                                                                    <span className="text-sm font-medium text-gray-700">{story.action}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveStoryFromBasket(story.id)}
                                                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-colors"
                                                                    title="Remove entire story from basket"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                            <ul className="pl-6 space-y-1">
                                                                {testCases.map((tc: any) => (
                                                                    <li key={tc.id} className="group flex justify-between items-start text-sm text-gray-600 hover:bg-gray-50 p-1 rounded">
                                                                        <span className="line-clamp-2 flex-1 mr-2">{tc.steps}</span>
                                                                        <button
                                                                            onClick={() => handleRemoveFromBasket(tc.id)}
                                                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            title="Remove"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <h3 className="font-semibold text-lg">2. Finalize Test Set Details</h3>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Regression Test Cycle 3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Optional description for this test set..."
                                        />
                                    </div>
                                    <div className="pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
                                        <span>Total Test Cases:</span>
                                        <span className="font-bold text-gray-900 text-lg">{selectedTestCaseIds.size}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        {step > 1 ? 'Back to Selection' : 'Cancel'}
                    </button>
                    <button
                        onClick={() => step === 2 ? handleSubmit() : handleNext()}
                        disabled={step === 1 && selectedTestCaseIds.size === 0}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 2 ? 'Create Test Set' : 'Next: Review Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTestSetModal;
