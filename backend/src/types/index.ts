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
  status: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Story {
  id: string;
  epic_id: string;
  key?: string;
  actor_id: string;
  action: string;
  outcome: string;
  status: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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
  status: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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

export interface CreateEpicRequest {
  key: string;
  title: string;
  description: string;
  created_by: string;
}

export interface CreateStoryRequest {
  epic_id: string;
  actor_id: string;
  action: string;
  outcome: string;
  created_by: string;
}

export interface CreateAcceptanceCriterionRequest {
  story_id: string;
  given: string;
  when: string;
  then: string;
  risk: 'Low' | 'Medium' | 'High';
  created_by: string;
}

export interface CreateTestCaseRequest {
  acceptance_criterion_id: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  priority: 'Low' | 'Medium' | 'High';
  created_by: string;
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

export interface CreateActorRequest {
  project_id: string;
  name: string;
  role?: string;
  description?: string;
  created_by: string;
}

export interface TestSet {
  id: string;
  key: string;
  title: string;
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface TestRun {
  id: string;
  test_set_id: string;
  test_case_id: string;
  status: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
  actual_result?: string;
  notes?: string;
  executed_by?: string;
  executed_at?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}