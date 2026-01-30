import { AppState, AppAction } from '../types';

const initialState: AppState = {
  projects: [],
  epics: [],
  stories: [],
  acceptanceCriteria: [],
  testCases: [],
  actors: [],
  loading: {
    projects: false,
    epics: false,
    stories: false,
    acceptanceCriteria: false,
    testCases: false,
    actors: false,
  },
  selectedProjectId: localStorage.getItem('selectedProjectId'),
  errors: {
    projects: null,
    epics: null,
    stories: null,
    acceptanceCriteria: null,
    testCases: null,
    actors: null,
  },
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // ... existing cases ...
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: false,
        },
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
      };

    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.projects,
        loading: { ...state.loading, projects: false },
        errors: { ...state.errors, projects: null },
      };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.project],
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.id ? { ...project, ...action.project } : project
        ),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.id),
        // Cascading delete for projects -> epics is complex in memory without back-references
        // For simplicity, we filter only epics that explicitly reference this project
        epics: state.epics.filter((epic) => epic.project_id !== action.id),
      };

    case 'SET_EPICS':
      return {
        ...state,
        epics: action.epics,
        loading: { ...state.loading, epics: false },
        errors: { ...state.errors, epics: null },
      };

    case 'ADD_EPIC':
      return {
        ...state,
        epics: [...state.epics, action.epic],
      };

    case 'UPDATE_EPIC':
      return {
        ...state,
        epics: state.epics.map((epic) =>
          epic.id === action.id ? { ...epic, ...action.epic } : epic
        ),
      };

    case 'DELETE_EPIC':
      return {
        ...state,
        epics: state.epics.filter((epic) => epic.id !== action.id),
        stories: state.stories.filter((story) => story.epic_id !== action.id),
        acceptanceCriteria: state.acceptanceCriteria.filter(
          (ac) => !state.stories.some((s) => s.id === ac.story_id && s.epic_id === action.id)
        ),
        testCases: state.testCases.filter(
          (tc) => !state.acceptanceCriteria.some(
            (ac) => ac.id === tc.acceptance_criterion_id &&
              state.stories.some((s) => s.id === ac.story_id && s.epic_id === action.id)
          )
        ),
      };

    case 'SET_STORIES':
      return {
        ...state,
        stories: action.stories,
        loading: { ...state.loading, stories: false },
        errors: { ...state.errors, stories: null },
      };

    case 'ADD_STORY':
      return {
        ...state,
        stories: [...state.stories, action.story],
      };

    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.id ? { ...story, ...action.story } : story
        ),
      };

    case 'DELETE_STORY':
      return {
        ...state,
        stories: state.stories.filter((story) => story.id !== action.id),
        acceptanceCriteria: state.acceptanceCriteria.filter(
          (ac) => ac.story_id !== action.id
        ),
        testCases: state.testCases.filter(
          (tc) => !state.acceptanceCriteria.some(
            (ac) => ac.id === tc.acceptance_criterion_id && ac.story_id === action.id
          )
        ),
      };

    case 'SET_ACCEPTANCE_CRITERIA':
      return {
        ...state,
        acceptanceCriteria: action.acceptanceCriteria,
        loading: { ...state.loading, acceptanceCriteria: false },
        errors: { ...state.errors, acceptanceCriteria: null },
      };

    case 'ADD_ACCEPTANCE_CRITERION':
      return {
        ...state,
        acceptanceCriteria: [...state.acceptanceCriteria, action.acceptanceCriterion],
      };

    case 'UPDATE_ACCEPTANCE_CRITERION':
      return {
        ...state,
        acceptanceCriteria: state.acceptanceCriteria.map((ac) =>
          ac.id === action.id ? { ...ac, ...action.acceptanceCriterion } : ac
        ),
      };

    case 'DELETE_ACCEPTANCE_CRITERION':
      return {
        ...state,
        acceptanceCriteria: state.acceptanceCriteria.filter(
          (ac) => ac.id !== action.id
        ),
        testCases: state.testCases.filter(
          (tc) => tc.acceptance_criterion_id !== action.id
        ),
      };

    case 'SET_TEST_CASES':
      return {
        ...state,
        testCases: action.testCases,
        loading: { ...state.loading, testCases: false },
        errors: { ...state.errors, testCases: null },
      };

    case 'ADD_TEST_CASE':
      return {
        ...state,
        testCases: [...state.testCases, action.testCase],
      };

    case 'UPDATE_TEST_CASE':
      return {
        ...state,
        testCases: state.testCases.map((testCase) =>
          testCase.id === action.id ? { ...testCase, ...action.testCase } : testCase
        ),
      };

    case 'DELETE_TEST_CASE':
      return {
        ...state,
        testCases: state.testCases.filter((testCase) => testCase.id !== action.id),
      };

    case 'SET_SELECTED_PROJECT_ID':
      if (action.id) {
        localStorage.setItem('selectedProjectId', action.id);
      } else {
        localStorage.removeItem('selectedProjectId');
      }
      return {
        ...state,
        selectedProjectId: action.id,
      };

    case 'SET_ACTORS':
      return {
        ...state,
        actors: action.actors,
        loading: { ...state.loading, actors: false },
        errors: { ...state.errors, actors: null },
      };

    case 'ADD_ACTOR':
      return {
        ...state,
        actors: [...state.actors, action.actor],
      };

    case 'UPDATE_ACTOR':
      return {
        ...state,
        actors: state.actors.map((actor) =>
          actor.id === action.id ? { ...actor, ...action.actor } : actor
        ),
      };

    case 'DELETE_ACTOR':
      return {
        ...state,
        actors: state.actors.filter((actor) => actor.id !== action.id),
      };

    default:
      return state;
  }
};

export { initialState };