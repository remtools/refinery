import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { appReducer, initialState } from './appReducer';
import { type AppAction } from '../types';
import {
  projectService,
  epicService,
  storyService,
  acceptanceCriterionService,
  testCaseService,
  actorService,
} from '../services';

interface AppContextType {
  state: ReturnType<typeof appReducer>;
  dispatch: React.Dispatch<AppAction>;
  setSelectedProjectId: (id: string | null) => void;
  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (data: any) => Promise<void>;
  updateProject: (id: string, data: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  importProject: (data: any) => Promise<void>;
  exportProject: (id: string) => Promise<any>;
  // Epic actions
  fetchEpics: (projectId?: string) => Promise<void>;
  createEpic: (data: any) => Promise<void>;
  updateEpic: (id: string, data: any) => Promise<void>;
  deleteEpic: (id: string) => Promise<void>;
  // Story actions
  fetchStoriesByEpic: (epicId: string) => Promise<void>;
  createStory: (data: any) => Promise<void>;
  updateStory: (id: string, data: any) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  // Acceptance Criteria actions
  fetchAcceptanceCriteriaByStory: (storyId: string) => Promise<void>;
  createAcceptanceCriterion: (data: any) => Promise<void>;
  updateAcceptanceCriterion: (id: string, data: any) => Promise<void>;
  deleteAcceptanceCriterion: (id: string) => Promise<void>;
  // Test Case actions
  fetchTestCasesByAcceptanceCriterion: (acId: string) => Promise<void>;
  createTestCase: (data: any) => Promise<void>;
  updateTestCase: (id: string, data: any) => Promise<void>;
  deleteTestCase: (id: string) => Promise<void>;
  // Actor actions
  fetchActors: (projectId?: string) => Promise<void>;
  createActor: (data: any) => Promise<void>;
  updateActor: (id: string, data: any) => Promise<void>;
  deleteActor: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch initial data
  useEffect(() => {
    fetchProjects();
  }, []);

  // Project functions
  const fetchProjects = async () => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'projects', loading: true });
      const projects = await projectService.fetchProjects();
      dispatch({ type: 'SET_PROJECTS', projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createProject = async (data: any) => {
    try {
      const project = await projectService.createProject(data);
      dispatch({ type: 'ADD_PROJECT', project });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateProject = async (id: string, data: any) => {
    try {
      const project = await projectService.updateProject(id, data);
      dispatch({ type: 'UPDATE_PROJECT', id, project });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      dispatch({ type: 'DELETE_PROJECT', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const importProject = async (data: any) => {
    try {
      const project = await projectService.importProject(data);
      dispatch({ type: 'ADD_PROJECT', project });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const exportProject = async (id: string) => {
    try {
      return await projectService.exportProject(id);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  // Epic functions
  const fetchEpics = async (projectId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'epics', loading: true });
      const epics = await epicService.fetchEpics(projectId);
      dispatch({ type: 'SET_EPICS', epics });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'epics', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createEpic = async (data: any) => {
    try {
      const epic = await epicService.createEpic(data);
      dispatch({ type: 'ADD_EPIC', epic });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'epics', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateEpic = async (id: string, data: any) => {
    try {
      const epic = await epicService.updateEpic(id, data);
      dispatch({ type: 'UPDATE_EPIC', id, epic });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'epics', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteEpic = async (id: string) => {
    try {
      await epicService.deleteEpic(id);
      dispatch({ type: 'DELETE_EPIC', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'epics', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  // Story functions
  const fetchStoriesByEpic = async (epicId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'stories', loading: true });
      const stories = await storyService.fetchStoriesByEpic(epicId);
      dispatch({ type: 'SET_STORIES', stories });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createStory = async (data: any) => {
    try {
      const story = await storyService.createStory(data);
      dispatch({ type: 'ADD_STORY', story });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateStory = async (id: string, data: any) => {
    try {
      const story = await storyService.updateStory(id, data);
      dispatch({ type: 'UPDATE_STORY', id, story });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteStory = async (id: string) => {
    try {
      await storyService.deleteStory(id);
      dispatch({ type: 'DELETE_STORY', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'stories', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  // Acceptance Criteria functions
  const fetchAcceptanceCriteriaByStory = async (storyId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'acceptanceCriteria', loading: true });
      const criteria = await acceptanceCriterionService.fetchAcceptanceCriteriaByStory(storyId);
      dispatch({ type: 'SET_ACCEPTANCE_CRITERIA', acceptanceCriteria: criteria });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createAcceptanceCriterion = async (data: any) => {
    try {
      const criterion = await acceptanceCriterionService.createAcceptanceCriterion(data);
      dispatch({ type: 'ADD_ACCEPTANCE_CRITERION', acceptanceCriterion: criterion });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateAcceptanceCriterion = async (id: string, data: any) => {
    try {
      const criterion = await acceptanceCriterionService.updateAcceptanceCriterion(id, data);
      dispatch({ type: 'UPDATE_ACCEPTANCE_CRITERION', id, acceptanceCriterion: criterion });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteAcceptanceCriterion = async (id: string) => {
    try {
      await acceptanceCriterionService.deleteAcceptanceCriterion(id);
      dispatch({ type: 'DELETE_ACCEPTANCE_CRITERION', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'acceptanceCriteria', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  // Test Case functions
  const fetchTestCasesByAcceptanceCriterion = async (acId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'testCases', loading: true });
      const testCases = await testCaseService.fetchTestCasesByAcceptanceCriterion(acId);
      dispatch({ type: 'SET_TEST_CASES', testCases });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createTestCase = async (data: any) => {
    try {
      const testCase = await testCaseService.createTestCase(data);
      dispatch({ type: 'ADD_TEST_CASE', testCase });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateTestCase = async (id: string, data: any) => {
    try {
      const testCase = await testCaseService.updateTestCase(id, data);
      dispatch({ type: 'UPDATE_TEST_CASE', id, testCase });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteTestCase = async (id: string) => {
    try {
      await testCaseService.deleteTestCase(id);
      dispatch({ type: 'DELETE_TEST_CASE', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'testCases', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  // Actor functions
  const fetchActors = async (projectId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', entity: 'actors', loading: true });
      const actors = await actorService.fetchActors(projectId);
      dispatch({ type: 'SET_ACTORS', actors });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'actors', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createActor = async (data: any) => {
    try {
      const actor = await actorService.createActor(data);
      dispatch({ type: 'ADD_ACTOR', actor });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'actors', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const updateActor = async (id: string, data: any) => {
    try {
      const actor = await actorService.updateActor(id, data);
      dispatch({ type: 'UPDATE_ACTOR', id, actor });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'actors', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const deleteActor = async (id: string) => {
    try {
      await actorService.deleteActor(id);
      dispatch({ type: 'DELETE_ACTOR', id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', entity: 'actors', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const setSelectedProjectId = (id: string | null) => {
    dispatch({ type: 'SET_SELECTED_PROJECT_ID', id });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        importProject,
        exportProject,
        fetchEpics,
        createEpic,
        updateEpic,
        deleteEpic,
        fetchStoriesByEpic,
        createStory,
        updateStory,
        deleteStory,
        fetchAcceptanceCriteriaByStory,
        createAcceptanceCriterion,
        updateAcceptanceCriterion,
        deleteAcceptanceCriterion,
        fetchTestCasesByAcceptanceCriterion,
        createTestCase,
        updateTestCase,
        deleteTestCase,
        fetchActors,
        createActor,
        updateActor,
        deleteActor,
        setSelectedProjectId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};