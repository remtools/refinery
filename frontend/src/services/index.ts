import { api } from '../utils/api';
import { type Project, type Epic, type Story, type AcceptanceCriterion, type TestCase, type Actor } from '../types';

// Project services
export const projectService = {
  async fetchProjects(): Promise<Project[]> {
    return api.getProjects();
  },

  async fetchProject(id: string): Promise<Project> {
    return api.getProject(id);
  },

  async createProject(data: {
    name: string;
    description: string;
    status: 'Active' | 'Archived' | 'Planned';
    created_by: string;
  }): Promise<Project> {
    return api.createProject(data);
  },

  async updateProject(id: string, data: {
    name?: string;
    description?: string;
    status?: 'Active' | 'Archived' | 'Planned';
    updated_by: string;
  }): Promise<Project> {
    return api.updateProject(id, data);
  },

  async deleteProject(id: string): Promise<void> {
    return api.deleteProject(id);
  },

  async importProject(data: any): Promise<Project> {
    return api.importProject(data);
  },

  async exportProject(id: string): Promise<any> {
    return api.exportProject(id);
  },
};

// Epic services
export const epicService = {
  async fetchEpics(projectId?: string): Promise<Epic[]> {
    const result = await api.getEpics(projectId);
    return result as Epic[];
  },

  async fetchEpic(id: string): Promise<Epic> {
    return api.getEpic(id);
  },

  async createEpic(data: {
    project_id?: string;
    key: string;
    title: string;
    description: string;
    created_by: string;
  }): Promise<Epic> {
    return api.createEpic(data);
  },

  async updateEpic(id: string, data: {
    project_id?: string;
    key?: string;
    title?: string;
    description?: string;
    status?: 'Draft' | 'Approved' | 'Locked';
    updated_by: string;
  }): Promise<Epic> {
    return api.updateEpic(id, data);
  },

  async deleteEpic(id: string): Promise<void> {
    return api.deleteEpic(id);
  },
};

// Story services
export const storyService = {
  async fetchStories(): Promise<Story[]> {
    return api.getStories();
  },

  async fetchStoriesByEpic(epicId: string): Promise<Story[]> {
    return api.getStoriesByEpic(epicId);
  },

  async createStory(data: {
    epic_id: string;
    actor: string;
    action: string;
    outcome: string;
    created_by: string;
  }): Promise<Story> {
    return api.createStory(data);
  },

  async updateStory(id: string, data: {
    actor?: string;
    action?: string;
    outcome?: string;
    status?: 'Draft' | 'Approved' | 'Locked';
    updated_by: string;
  }): Promise<Story> {
    return api.updateStory(id, data);
  },

  async deleteStory(id: string): Promise<void> {
    return api.deleteStory(id);
  },
};

// Acceptance Criteria services
export const acceptanceCriterionService = {
  async fetchAcceptanceCriteria(): Promise<AcceptanceCriterion[]> {
    return api.getAcceptanceCriteria();
  },

  async fetchAcceptanceCriteriaByStory(storyId: string): Promise<AcceptanceCriterion[]> {
    return api.getAcceptanceCriteriaByStory(storyId);
  },

  async createAcceptanceCriterion(data: {
    story_id: string;
    given: string;
    when: string;
    then: string;
    risk: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<AcceptanceCriterion> {
    return api.createAcceptanceCriterion(data);
  },

  async updateAcceptanceCriterion(id: string, data: {
    given?: string;
    when?: string;
    then?: string;
    status?: 'Draft' | 'Approved' | 'Locked';
    valid?: number;
    risk?: 'Low' | 'Medium' | 'High';
    comments?: string;
    updated_by: string;
  }): Promise<AcceptanceCriterion> {
    return api.updateAcceptanceCriterion(id, data);
  },

  async deleteAcceptanceCriterion(id: string): Promise<void> {
    return api.deleteAcceptanceCriterion(id);
  },
};

// Test Case services
export const testCaseService = {
  async fetchTestCases(): Promise<TestCase[]> {
    return api.getTestCases();
  },

  async fetchTestCasesByAcceptanceCriterion(acId: string): Promise<TestCase[]> {
    return api.getTestCasesByAcceptanceCriterion(acId);
  },

  async createTestCase(data: {
    acceptance_criterion_id: string;
    preconditions: string;
    steps: string;
    expected_result: string;
    priority: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<TestCase> {
    return api.createTestCase(data);
  },

  async updateTestCase(id: string, data: {
    preconditions?: string;
    steps?: string;
    expected_result?: string;
    priority?: 'Low' | 'Medium' | 'High';
    test_status?: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
    updated_by: string;
  }): Promise<TestCase> {
    return api.updateTestCase(id, data);
  },

  async deleteTestCase(id: string): Promise<void> {
    return api.deleteTestCase(id);
  },
};

// Actor services
export const actorService = {
  async fetchActors(projectId?: string): Promise<Actor[]> {
    const result = await api.getActors(projectId);
    return result as Actor[];
  },

  async createActor(data: {
    project_id: string;
    name: string;
    role?: string;
    description?: string;
    created_by: string;
  }): Promise<Actor> {
    return api.createActor(data);
  },

  async updateActor(id: string, data: {
    name?: string;
    role?: string;
    description?: string;
    updated_by: string;
  }): Promise<Actor> {
    return api.updateActor(id, data);
  },

  async deleteActor(id: string): Promise<void> {
    return api.deleteActor(id);
  },
};