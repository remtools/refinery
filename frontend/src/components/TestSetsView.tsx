import { useState } from 'react';
import { useTestSets } from '../hooks/useTestSets';
import CreateTestSetModal from './CreateTestSetModal';
import ModernForm from './ModernForm';

interface TestSetsViewProps {
    onNavigate: (view: string, id: string) => void;
}

const TestSetsView = ({ onNavigate }: TestSetsViewProps) => {
    const { testSets, loading, createTestSet, createBulkTestRuns, updateTestSet, deleteTestSet } = useTestSets();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSet, setEditingSet] = useState<any>(null);

    const handleUpdate = async (data: any) => {
        if (!editingSet) return;
        try {
            await updateTestSet(editingSet.id, {
                title: data.title,
                description: data.description,
                status: data.status,
                updated_by: 'user'
            });
            setEditingSet(null);
        } catch (error) {
            console.error('Failed to update test set:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            try {
                await deleteTestSet(id);
            } catch (error) {
                console.error('Failed to delete test set:', error);
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading test sets...</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Test Sets</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and execute test runs</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-accent text-white rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Test Set
                </button>
            </div>

            {editingSet && (
                <div className="mb-8 animate-fade-in">
                    <ModernForm
                        title="Edit Test Set"
                        submitButtonText="Update Test Set"
                        initialData={editingSet}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingSet(null)}
                        fields={[
                            { name: 'key', label: 'ID', type: 'text', required: true, disabled: true },
                            { name: 'title', label: 'Title', type: 'text', required: true },
                            { name: 'description', label: 'Description', type: 'textarea', required: false },
                            {
                                name: 'status',
                                label: 'Status',
                                type: 'select',
                                options: ['Planned', 'In Progress', 'Completed']
                            }
                        ]}
                    />
                </div>
            )}

            <div className="grid gap-4">
                {testSets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No test sets created yet.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-primary-600 font-medium hover:underline mt-2"
                        >
                            Create your first test set
                        </button>
                    </div>
                ) : (
                    testSets.map(set => (
                        <div
                            key={set.id}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => onNavigate('test-run', set.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-3">
                                        <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {set.key}
                                        </span>
                                        {set.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{set.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(set.created_at).toLocaleDateString()}
                                        </span>
                                        <span>By {set.created_by}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${set.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        set.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {set.status}
                                    </span>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingSet(set); }}
                                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, set.id, set.title)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateTestSetModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={async (data, testCaseIds) => {
                        const newSet = await createTestSet(data);
                        if (testCaseIds.length > 0) {
                            await createBulkTestRuns(newSet.id, testCaseIds);
                        }
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default TestSetsView;
