import { AppState, AppAction } from '../types';

const initialState: AppState = {
  epics: [],
  stories: [],
  acceptanceCriteria: [],
  testCases: [],
  loading: {
    epics: false,
    stories: false,
    acceptanceCriteria: false,
    testCases: false,
  },
  errors: {
    epics: null,
    stories: null,
    acceptanceCriteria: null,
    testCases: null,
  },
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
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
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
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

    default:
      return state;
  }
};

export { initialState };