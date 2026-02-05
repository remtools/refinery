import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAppContext } from '../context/AppContext';

export const useTestSets = () => {
    const [testSets, setTestSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { dispatch } = useAppContext();

    const fetchTestSets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTestSets();
            setTestSets(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch test sets');
            dispatch({ type: 'SET_ERROR', entity: 'testSets', error: err.message });
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchTestSets();
    }, [fetchTestSets]);

    const createTestSet = async (data: any) => {
        setLoading(true);
        try {
            const newSet = await api.createTestSet(data);
            setTestSets(prev => [newSet, ...prev]);
            return newSet;
        } catch (err: any) {
            setError(err.message || 'Failed to create test set');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createBulkTestRuns = async (testSetId: string, testCaseIds: string[]) => {
        setLoading(true);
        try {
            await api.createBulkTestRuns(testSetId, testCaseIds);
        } catch (err: any) {
            setError(err.message || 'Failed to populate test runs');
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const updateTestSet = async (id: string, data: any) => {
        setLoading(true);
        try {
            const updated = await api.updateTestSet(id, data);
            setTestSets(prev => prev.map(ts => ts.id === id ? updated : ts));
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update test set');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTestSet = async (id: string) => {
        setLoading(true);
        try {
            await api.deleteTestSet(id);
            setTestSets(prev => prev.filter(ts => ts.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete test set');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        testSets,
        loading,
        error,
        fetchTestSets,
        createTestSet,
        createBulkTestRuns,
        updateTestSet,
        deleteTestSet
    };
};
