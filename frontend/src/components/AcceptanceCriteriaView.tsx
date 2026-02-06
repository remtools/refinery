import { useState, useMemo } from 'react';
import { useAcceptanceCriteria } from '../hooks/useAcceptanceCriteria';
import { useStories } from '../hooks/useStories';
import { useEpics } from '../hooks/useEpics';
import { useActors } from '../hooks/useActors';
import { useStatuses } from '../hooks/useStatuses';
import { useAppContext } from '../context/AppContext';
import AcceptanceCriterionForm from './AcceptanceCriterionForm';
import FilterBar from './FilterBar';
import Modal from './Modal';

interface AcceptanceCriteriaViewProps {
    storyId?: string;
    onBack?: () => void;
    onViewTestCases: (acId: string) => void;
}

const AcceptanceCriteriaView = ({ storyId, onBack, onViewTestCases }: AcceptanceCriteriaViewProps) => {
    const { state, dispatch } = useAppContext();
    const { selectedProjectId, stories } = state;
    const { epics } = useEpics();
    const { statuses, isDeletable, getStatusColor } = useStatuses();
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
    const [filters, setFilters] = useState({ search: '', status: '', risk: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // getStatusColor provided by useStatuses hook

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'bg-blue-100 text-blue-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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

        let result = list.filter(ac => {
            const matchesSearch = ac.given.toLowerCase().includes(filters.search.toLowerCase()) ||
                ac.when.toLowerCase().includes(filters.search.toLowerCase()) ||
                ac.then.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || ac.status === filters.status;
            const matchesRisk = !filters.risk || ac.risk === filters.risk;
            return matchesSearch && matchesStatus && matchesRisk;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = '';
                let bValue: any = '';

                switch (sortConfig.key) {
                    case 'key':
                        aValue = a.key || '';
                        bValue = b.key || '';
                        break;
                    case 'status':
                        aValue = a.status;
                        bValue = b.status;
                        break;
                    case 'risk':
                        aValue = a.risk;
                        bValue = b.risk;
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
    }, [acceptanceCriteria, storyId, selectedProjectId, epics, stories, filters, sortConfig]);

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

    const parentStory = storyId ? stories.find(s => s.id === storyId) : null;
    const parentEpic = parentStory ? epics.find(e => e.id === parentStory.epic_id) : null;

    //if (acLoading || storiesLoading || epicsLoading) return <div className="p-8 text-center text-gray-500">Loading criteria...</div>;
    if (acLoading)
        return <div className="p-8 text-center text-gray-500">Loading criteria...</div>;

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
                statusOptions={['Drafted', 'Reviewed', 'Locked']}
                riskOptions={['Low', 'Medium', 'High']}
                onFilterChange={setFilters}
            />

            <Modal
                isOpen={showForm || !!editingItem}
                onClose={() => { setShowForm(false); setEditingItem(null); }}
            >
                {(showForm || editingItem) && (
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
                )}
            </Modal>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredCriteria.length === 0 ? (
                    <div className="text-center py-20 bg-white">
                        <p className="text-gray-500">
                            {acceptanceCriteria.length === 0 ? "No acceptance criteria found." : "No criteria match your search or project selection."}
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Criteria
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('risk')}>
                                        <div className="flex items-center gap-1">
                                            Risk
                                            <SortIcon columnKey="risk" />
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
                                {filteredCriteria.map((ac) => {
                                    const isLocked = ac.status === 'Locked';
                                    return (
                                        <tr key={ac.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                                {ac.key || 'AC'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="space-y-1">
                                                    <div><span className="font-semibold text-gray-600">Given:</span> {ac.given}</div>
                                                    <div><span className="font-semibold text-gray-600">When:</span> {ac.when}</div>
                                                    <div><span className="font-semibold text-gray-600">Then:</span> {ac.then}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(ac.risk)}`}>
                                                    {ac.risk}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ac.status)}`}>
                                                    {ac.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {onViewTestCases && (
                                                        <button
                                                            onClick={() => onViewTestCases(ac.id)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded"
                                                            title="View Test Cases"
                                                        >
                                                            Test Cases
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setEditingItem(ac)}
                                                        disabled={isLocked}
                                                        className={`px-3 py-1 rounded ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100'}`}
                                                        title={isLocked ? "Cannot edit locked criterion" : "Edit"}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!isDeletable(ac.status)) {
                                                                alert('This status cannot be deleted.');
                                                                return;
                                                            }
                                                            if (window.confirm('Delete this criterion? This will also delete all associated Test Cases.')) {
                                                                try {
                                                                    await deleteAcceptanceCriterion(ac.id);
                                                                } catch (e) {
                                                                    alert((e as Error).message);
                                                                }
                                                            }
                                                        }}
                                                        disabled={!isDeletable(ac.status)}
                                                        className={`px-3 py-1 rounded ${!isDeletable(ac.status) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'}`}
                                                        title={!isDeletable(ac.status) ? "Status prevents deletion" : "Delete"}
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

export default AcceptanceCriteriaView;
