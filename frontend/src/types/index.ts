export interface Epic {
  id: string;
  key: string;
  title: string;
  description: string;
  status: 'Draft' | 'Approved' | 'Locked';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Story {
  id: string;
  epic_id: string;
  actor: string;
  action: string;
  outcome: string;
  status: 'Draft' | 'Approved' | 'Locked';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface AcceptanceCriterion {
  id: string;
  story_id: string;
  given: string;
  when: string;
  then: string;
  status: 'Draft' | 'Approved' | 'Locked';
  valid: number;
  risk: 'Low' | 'Medium' | 'High';
  comments: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface TestCase {
  id: string;
  acceptance_criterion_id: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  priority: 'Low' | 'Medium' | 'High';
  test_status: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface AppState {
  epics: Epic[];
  stories: Story[];
  acceptanceCriteria: AcceptanceCriterion[];
  testCases: TestCase[];
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

export type AppAction =
  | { type: 'SET_LOADING'; entity: string; loading: boolean }
  | { type: 'SET_ERROR'; entity: string; error: string | null }
  | { type: 'SET_EPICS'; epics: Epic[] }
  | { type: 'ADD_EPIC'; epic: Epic }
  | { type: 'UPDATE_EPIC'; id: string; epic: Partial<Epic> }
  | { type: 'DELETE_EPIC'; id: string }
  | { type: 'SET_STORIES'; stories: Story[] }
  | { type: 'ADD_STORY'; story: Story }
  | { type: 'UPDATE_STORY'; id: string; story: Partial<Story> }
  | { type: 'DELETE_STORY'; id: string }
  | { type: 'SET_ACCEPTANCE_CRITERIA'; acceptanceCriteria: AcceptanceCriterion[] }
  | { type: 'ADD_ACCEPTANCE_CRITERION'; acceptanceCriterion: AcceptanceCriterion }
  | { type: 'UPDATE_ACCEPTANCE_CRITERION'; id: string; acceptanceCriterion: Partial<AcceptanceCriterion> }
  | { type: 'DELETE_ACCEPTANCE_CRITERION'; id: string }
  | { type: 'SET_TEST_CASES'; testCases: TestCase[] }
  | { type: 'ADD_TEST_CASE'; testCase: TestCase }
  | { type: 'UPDATE_TEST_CASE'; id: string; testCase: Partial<TestCase> }
  | { type: 'DELETE_TEST_CASE'; id: string };