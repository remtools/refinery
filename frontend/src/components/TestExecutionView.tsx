import { useEffect, useState, useMemo } from 'react';
import { useTestRuns } from '../hooks/useTestRuns';
import { useTestSets } from '../hooks/useTestSets';
import { useTestCases } from '../hooks/useTestCases';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';

interface TestExecutionViewProps {
    testSetId: string;
    onBack: () => void;
}

const TestExecutionView = ({ testSetId, onBack }: TestExecutionViewProps) => {
    const { testRuns, loading: runsLoading, fetchTestRuns, updateTestRun } = useTestRuns();
    const { testSets } = useTestSets();
    const { testCases } = useTestCases();
    const { acceptanceCriteria } = useAcceptanceCriteria();
    const { stories } = useStories();
    const { epics } = useEpics();

    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterEpic, setFilterEpic] = useState<string>('All');
    const [filterStory, setFilterStory] = useState<string>('All');
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

    useEffect(() => {
        if (testSetId) {
            fetchTestRuns(testSetId);
        }
    }, [testSetId, fetchTestRuns]);

    const testSet = useMemo(() => testSets.find(ts => ts.id === testSetId), [testSets, testSetId]);

    // Get unique Epics and Stories from test runs
    const availableEpics = useMemo(() => {
        const epicIds = new Set<string>();
        testRuns.forEach(run => {
            const tc = testCases.find(t => t.id === run.test_case_id);
            const ac = tc ? acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id) : null;
            const story = ac ? stories.find(s => s.id === ac.story_id) : null;
            if (story?.epic_id) epicIds.add(story.epic_id);
        });
        return epics.filter(e => epicIds.has(e.id));
    }, [testRuns, testCases, acceptanceCriteria, stories, epics]);

    const availableStories = useMemo(() => {
        const storyIds = new Set<string>();
        testRuns.forEach(run => {
            const tc = testCases.find(t => t.id === run.test_case_id);
            const ac = tc ? acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id) : null;
            if (ac?.story_id) storyIds.add(ac.story_id);
        });
        let filteredStories = stories.filter(s => storyIds.has(s.id));
        // If Epic filter is active, only show stories from that Epic
        if (filterEpic !== 'All') {
            filteredStories = filteredStories.filter(s => s.epic_id === filterEpic);
        }
        return filteredStories;
    }, [testRuns, testCases, acceptanceCriteria, stories, filterEpic]);

    const filteredRuns = useMemo(() => {
        let filtered = testRuns;

        // Filter by status
        if (filterStatus !== 'All') {
            filtered = filtered.filter(tr => tr.status === filterStatus);
        }

        // Filter by Epic
        if (filterEpic !== 'All') {
            filtered = filtered.filter(run => {
                const tc = testCases.find(t => t.id === run.test_case_id);
                const ac = tc ? acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id) : null;
                const story = ac ? stories.find(s => s.id === ac.story_id) : null;
                return story?.epic_id === filterEpic;
            });
        }

        // Filter by Story
        if (filterStory !== 'All') {
            filtered = filtered.filter(run => {
                const tc = testCases.find(t => t.id === run.test_case_id);
                const ac = tc ? acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id) : null;
                return ac?.story_id === filterStory;
            });
        }

        return filtered;
    }, [testRuns, filterStatus, filterEpic, filterStory, testCases, acceptanceCriteria, stories]);

    const stats = useMemo(() => {
        const total = testRuns.length;
        const passed = testRuns.filter(tr => tr.status === 'Pass').length;
        const failed = testRuns.filter(tr => tr.status === 'Fail').length;
        const blocked = testRuns.filter(tr => tr.status === 'Blocked').length;
        const notRun = testRuns.filter(tr => tr.status === 'Not Run').length;
        return { total, passed, failed, blocked, notRun };
    }, [testRuns]);

    const handleStatusUpdate = async (runId: string, status: 'Pass' | 'Fail' | 'Blocked') => {
        await updateTestRun(runId, {
            status,
            updated_by: 'user' // TODO: user
        });
    };

    const handleActualResultUpdate = async (runId: string, actualResult: string) => {
        await updateTestRun(runId, {
            actual_result: actualResult,
            updated_by: 'user'
        });
    };

    if (runsLoading && testRuns.length === 0) return <div className="p-8 text-center text-gray-500">Loading test runs...</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{testSet?.key || 'SET-XXX'}</span>
                        <h1 className="text-2xl font-bold text-gray-900">{testSet?.title || 'Test Execution'}</h1>
                    </div>
                    <p className="text-gray-500 text-sm">{testSet?.description}</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Total</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setFilterStatus('Pass')}>
                    <div className="text-green-700 text-xs uppercase tracking-wider font-semibold mb-1">Passed</div>
                    <div className="text-2xl font-bold text-green-700">{stats.passed}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setFilterStatus('Fail')}>
                    <div className="text-red-700 text-xs uppercase tracking-wider font-semibold mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setFilterStatus('Not Run')}>
                    <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Not Run</div>
                    <div className="text-2xl font-bold text-gray-700">{stats.notRun}</div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Epic:</label>
                    <select
                        value={filterEpic}
                        onChange={(e) => {
                            setFilterEpic(e.target.value);
                            setFilterStory('All'); // Reset story filter when epic changes
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="All">All Epics</option>
                        {availableEpics.map(epic => (
                            <option key={epic.id} value={epic.id}>
                                {epic.key || 'EP'} - {epic.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Story:</label>
                    <select
                        value={filterStory}
                        onChange={(e) => setFilterStory(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                        disabled={availableStories.length === 0}
                    >
                        <option value="All">All Stories</option>
                        {availableStories.map(story => (
                            <option key={story.id} value={story.id}>
                                {story.key || 'ST'} - {story.action.substring(0, 40)}...
                            </option>
                        ))}
                    </select>
                </div>

                {(filterEpic !== 'All' || filterStory !== 'All' || filterStatus !== 'All') && (
                    <button
                        onClick={() => {
                            setFilterEpic('All');
                            setFilterStory('All');
                            setFilterStatus('All');
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredRuns.map(run => {
                    const tc = testCases.find(t => t.id === run.test_case_id);
                    const ac = tc ? acceptanceCriteria.find(a => a.id === tc.acceptance_criterion_id) : null;
                    const story = ac ? stories.find(s => s.id === ac.story_id) : null;
                    const epic = story ? epics.find(e => e.id === story.epic_id) : null;
                    const isExpanded = expandedRunId === run.id;

                    return (
                        <div key={run.id} className={`bg-white rounded-xl shadow-sm border transaction-all duration-200 ${run.status === 'Pass' ? 'border-green-200' :
                            run.status === 'Fail' ? 'border-red-200' :
                                'border-gray-200'
                            }`}>
                            <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedRunId(isExpanded ? null : run.id)}>
                                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${run.status === 'Pass' ? 'bg-green-500' :
                                    run.status === 'Fail' ? 'bg-red-500' :
                                        run.status === 'Blocked' ? 'bg-gray-500' :
                                            'bg-gray-200'
                                    }`}></div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                    {tc?.key || 'TC-XXX'}
                                                </span>
                                                <h3 className="font-medium text-gray-900">{tc?.steps.substring(0, 100)}...</h3>
                                            </div>
                                            <div className="text-xs text-gray-500 space-y-0.5">
                                                {epic && (
                                                    <p className="flex items-center gap-1">
                                                        <span className="font-semibold">Epic:</span>
                                                        <span className="font-mono">{epic.key}</span> - {epic.title.substring(0, 40)}...
                                                    </p>
                                                )}
                                                {story && (
                                                    <p className="flex items-center gap-1">
                                                        <span className="font-semibold">Story:</span>
                                                        <span className="font-mono">{story.key}</span> - {story.action.substring(0, 40)}...
                                                    </p>
                                                )}
                                                <p><span className="font-semibold">AC:</span> {ac?.key} - {ac?.given.substring(0, 50)}...</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 pb-4 pt-0 border-t border-gray-100 mt-2">
                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preconditions</h4>
                                                <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">{tc?.preconditions || 'None'}</div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Test Steps</h4>
                                                <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">{tc?.steps}</div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Result</h4>
                                                <div className="p-3 bg-blue-50 text-blue-900 rounded text-sm whitespace-pre-wrap">{tc?.expected_result}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-l border-gray-100 pl-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Actual Result</h4>
                                                <textarea
                                                    className="w-full p-3 border border-gray-200 rounded text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    rows={4}
                                                    placeholder="Describe the actual result..."
                                                    value={run.actual_result || ''}
                                                    onChange={(e) => handleActualResultUpdate(run.id, e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(run.id, 'Pass')}
                                                        className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${run.status === 'Pass' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                                    >
                                                        Pass
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(run.id, 'Fail')}
                                                        className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${run.status === 'Fail' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                                                    >
                                                        Fail
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(run.id, 'Blocked')}
                                                        className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${run.status === 'Blocked' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        Block
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TestExecutionView;
