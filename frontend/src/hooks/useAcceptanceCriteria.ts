import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import { useEffect } from 'react';

export const useAcceptanceCriteria = (storyId?: string) => {
  const { state, dispatch } = useAppContext();

  const loadAcceptanceCriteria = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'acceptanceCriteria', loading: true });
    try {
      const acceptanceCriteria = storyId 
        ? await api.getAcceptanceCriteriaByStory(storyId)
        : await api.getAcceptanceCriteria();
      dispatch({ type: 'SET_ACCEPTANCE_CRITERIA', acceptanceCriteria });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: (error as Error).message });
    }
  };

  const createAcceptanceCriterion = async (data: any) => {
    try {
      const acceptanceCriterion = await api.createAcceptanceCriterion(data);
      dispatch({ type: 'ADD_ACCEPTANCE_CRITERION', acceptanceCriterion });
      return acceptanceCriterion;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: (error as Error).message });
      throw error;
    }
  };

  const updateAcceptanceCriterion = async (id: string, data: any) => {
    try {
      const acceptanceCriterion = await api.updateAcceptanceCriterion(id, data);
      dispatch({ type: 'UPDATE_ACCEPTANCE_CRITERION', id, acceptanceCriterion });
      return acceptanceCriterion;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: (error as Error).message });
      throw error;
    }
  };

  const deleteAcceptanceCriterion = async (id: string) => {
    try {
      await api.deleteAcceptanceCriterion(id);
      dispatch({ type: 'DELETE_ACCEPTANCE_CRITERION', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: (error as Error).message });
      throw error;
    }
  };

  useEffect(() => {
    loadAcceptanceCriteria();
  }, [storyId]);

  const acceptanceCriteria = storyId 
    ? state.acceptanceCriteria.filter(ac => ac.story_id === storyId)
    : state.acceptanceCriteria;

  return {
    acceptanceCriteria,
    loading: state.loading.acceptanceCriteria,
    error: state.errors.acceptanceCriteria,
    loadAcceptanceCriteria,
    createAcceptanceCriterion,
    updateAcceptanceCriterion,
    deleteAcceptanceCriterion,
  };
};