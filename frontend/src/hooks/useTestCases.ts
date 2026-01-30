import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import { useEffect } from 'react';

export const useTestCases = (acceptanceCriterionId?: string) => {
  const { state, dispatch } = useAppContext();

  const loadTestCases = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'testCases', loading: true });
    try {
      const testCases = acceptanceCriterionId 
        ? await api.getTestCasesByAcceptanceCriterion(acceptanceCriterionId)
        : await api.getTestCases();
      dispatch({ type: 'SET_TEST_CASES', testCases });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: (error as Error).message });
    }
  };

  const createTestCase = async (data: any) => {
    try {
      const testCase = await api.createTestCase(data);
      dispatch({ type: 'ADD_TEST_CASE', testCase });
      return testCase;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: (error as Error).message });
      throw error;
    }
  };

  const updateTestCase = async (id: string, data: any) => {
    try {
      const testCase = await api.updateTestCase(id, data);
      dispatch({ type: 'UPDATE_TEST_CASE', id, testCase });
      return testCase;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: (error as Error).message });
      throw error;
    }
  };

  const deleteTestCase = async (id: string) => {
    try {
      await api.deleteTestCase(id);
      dispatch({ type: 'DELETE_TEST_CASE', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: (error as Error).message });
      throw error;
    }
  };

  useEffect(() => {
    loadTestCases();
  }, [acceptanceCriterionId]);

  const testCases = acceptanceCriterionId 
    ? state.testCases.filter(tc => tc.acceptance_criterion_id === acceptanceCriterionId)
    : state.testCases;

  return {
    testCases,
    loading: state.loading.testCases,
    error: state.errors.testCases,
    loadTestCases,
    createTestCase,
    updateTestCase,
    deleteTestCase,
  };
};