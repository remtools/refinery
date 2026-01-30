export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Archived' | 'Planned';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Epic {
  id: string;
  project_id: string;
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
  key?: string;
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
  key?: string;
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
  key?: string;
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

export interface Actor {
  id: string;
  project_id: string;
  name: string;
  role?: string;
  description?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface AppState {
  projects: Project[];
  epics: Epic[];
  stories: Story[];
  acceptanceCriteria: AcceptanceCriterion[];
  testCases: TestCase[];
  actors: Actor[];
  selectedProjectId: string | null;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

export type AppAction =
  | { type: 'SET_LOADING'; entity: string; loading: boolean }
  | { type: 'SET_ERROR'; entity: string; error: string | null }
  // Projects
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; id: string; project: Partial<Project> }
  | { type: 'DELETE_PROJECT'; id: string }
  // Epics
  | { type: 'SET_EPICS'; epics: Epic[] }
  | { type: 'ADD_EPIC'; epic: Epic }
  | { type: 'UPDATE_EPIC'; id: string; epic: Partial<Epic> }
  | { type: 'DELETE_EPIC'; id: string }
  // Stories
  | { type: 'SET_STORIES'; stories: Story[] }
  | { type: 'ADD_STORY'; story: Story }
  | { type: 'UPDATE_STORY'; id: string; story: Partial<Story> }
  | { type: 'DELETE_STORY'; id: string }
  // Acceptance Criteria
  | { type: 'SET_ACCEPTANCE_CRITERIA'; acceptanceCriteria: AcceptanceCriterion[] }
  | { type: 'ADD_ACCEPTANCE_CRITERION'; acceptanceCriterion: AcceptanceCriterion }
  | { type: 'UPDATE_ACCEPTANCE_CRITERION'; id: string; acceptanceCriterion: Partial<AcceptanceCriterion> }
  | { type: 'DELETE_ACCEPTANCE_CRITERION'; id: string }
  // Test Cases
  | { type: 'SET_TEST_CASES'; testCases: TestCase[] }
  | { type: 'ADD_TEST_CASE'; testCase: TestCase }
  | { type: 'UPDATE_TEST_CASE'; id: string; testCase: Partial<TestCase> }
  | { type: 'DELETE_TEST_CASE'; id: string }
  | { type: 'SET_SELECTED_PROJECT_ID'; id: string | null }
  // Actors
  | { type: 'SET_ACTORS'; actors: Actor[] }
  | { type: 'ADD_ACTOR'; actor: Actor }
  | { type: 'UPDATE_ACTOR'; id: string; actor: Partial<Actor> }
  | { type: 'DELETE_ACTOR'; id: string };