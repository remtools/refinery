import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useTestRuns = () => {
    const [testRuns, setTestRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTestRuns = useCallback(async (testSetId: string) => {
        setLoading(true);
        try {
            const data = await api.getTestRunsBySet(testSetId);
            setTestRuns(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch test runs');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTestRun = async (id: string, data: any) => {
        // Optimistic update
        setTestRuns(prev => prev.map(tr => tr.id === id ? { ...tr, ...data } : tr));

        try {
            const updated = await api.updateTestRun(id, data);
            setTestRuns(prev => prev.map(tr => tr.id === id ? updated : tr));
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update test run');
            // Revert
            fetchTestRuns(data.test_set_id); // Assuming data actually doesn't have test_set_id? We might need to handle revert better
            throw err;
        }
    };

    return {
        testRuns,
        loading,
        error,
        fetchTestRuns,
        updateTestRun
    };
};
