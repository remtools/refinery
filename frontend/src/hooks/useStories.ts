import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import { useEffect } from 'react';

export const useStories = (epicId?: string) => {
  const { state, dispatch } = useAppContext();

  const loadStories = async () => {
    dispatch({ type: 'SET_LOADING', entity: 'stories', loading: true });
    try {
      const stories = epicId 
        ? await api.getStoriesByEpic(epicId)
        : await api.getStories();
      dispatch({ type: 'SET_STORIES', stories });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: (error as Error).message });
    }
  };

  const createStory = async (data: any) => {
    try {
      const story = await api.createStory(data);
      dispatch({ type: 'ADD_STORY', story });
      return story;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: (error as Error).message });
      throw error;
    }
  };

  const updateStory = async (id: string, data: any) => {
    try {
      const story = await api.updateStory(id, data);
      dispatch({ type: 'UPDATE_STORY', id, story });
      return story;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: (error as Error).message });
      throw error;
    }
  };

  const deleteStory = async (id: string) => {
    try {
      await api.deleteStory(id);
      dispatch({ type: 'DELETE_STORY', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: (error as Error).message });
      throw error;
    }
  };

  useEffect(() => {
    loadStories();
  }, [epicId]);

  const stories = epicId 
    ? state.stories.filter(story => story.epic_id === epicId)
    : state.stories;

  return {
    stories,
    loading: state.loading.stories,
    error: state.errors.stories,
    loadStories,
    createStory,
    updateStory,
    deleteStory,
  };
};