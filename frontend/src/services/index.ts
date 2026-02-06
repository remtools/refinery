// import { api } from '../utils/api';
import { type Project, type Epic, type Story, type AcceptanceCriterion, type TestCase, type Actor } from '../types';
import { Status } from '../types/Status';

const API_URL = 'http://localhost:3000/api';

export const api = {
  // Statuses
  getStatuses: async (): Promise<Status[]> => {
    const res = await fetch(`${API_URL}/statuses`);
    return res.json();
  },

  getStatusesByEntity: async (entityType: string): Promise<Status[]> => {
    const res = await fetch(`${API_URL}/statuses?entity_type=${entityType}`);
    return res.json();
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_URL}/projects`);
    return res.json();
  },

  getProject: async (id: string): Promise<Project> => {
    const res = await fetch(`${API_URL}/projects/${id}`);
    return res.json();
  },

  createProject: async (data: {
    name: string;
    description: string;
    status: 'Active' | 'Archived' | 'Planned';
    created_by: string;
  }): Promise<Project> => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateProject: async (id: string, data: {
    name?: string;
    description?: string;
    status?: 'Active' | 'Archived' | 'Planned';
    updated_by: string;
  }): Promise<Project> => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteProject: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
    });
  },

  importProject: async (data: any): Promise<Project> => {
    const res = await fetch(`${API_URL}/projects/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  exportProject: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/projects/${id}/export`);
    return res.json();
  },

  // Epics
  getEpics: async (projectId?: string): Promise<Epic[]> => {
    const url = projectId ? `${API_URL}/epics?project_id=${projectId}` : `${API_URL}/epics`;
    const res = await fetch(url);
    return res.json();
  },

  getEpic: async (id: string): Promise<Epic> => {
    const res = await fetch(`${API_URL}/epics/${id}`);
    return res.json();
  },

  createEpic: async (data: {
    project_id?: string;
    key: string;
    title: string;
    description: string;
    created_by: string;
  }): Promise<Epic> => {
    const res = await fetch(`${API_URL}/epics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateEpic: async (id: string, data: {
    project_id?: string;
    key?: string;
    title?: string;
    description?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    updated_by: string;
  }): Promise<Epic> => {
    const res = await fetch(`${API_URL}/epics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteEpic: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/epics/${id}`, {
      method: 'DELETE',
    });
  },

  // Stories
  getStories: async (): Promise<Story[]> => {
    const res = await fetch(`${API_URL}/stories`);
    return res.json();
  },

  getStoriesByEpic: async (epicId: string): Promise<Story[]> => {
    const res = await fetch(`${API_URL}/stories?epic_id=${epicId}`);
    return res.json();
  },

  createStory: async (data: {
    epic_id: string;
    actor: string;
    action: string;
    outcome: string;
    created_by: string;
  }): Promise<Story> => {
    const res = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateStory: async (id: string, data: {
    actor?: string;
    action?: string;
    outcome?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    updated_by: string;
  }): Promise<Story> => {
    const res = await fetch(`${API_URL}/stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteStory: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/stories/${id}`, {
      method: 'DELETE',
    });
  },

  // Acceptance Criteria
  getAcceptanceCriteria: async (): Promise<AcceptanceCriterion[]> => {
    const res = await fetch(`${API_URL}/acceptance-criteria`);
    return res.json();
  },

  getAcceptanceCriteriaByStory: async (storyId: string): Promise<AcceptanceCriterion[]> => {
    const res = await fetch(`${API_URL}/acceptance-criteria?story_id=${storyId}`);
    return res.json();
  },

  createAcceptanceCriterion: async (data: {
    story_id: string;
    given: string;
    when: string;
    then: string;
    risk: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<AcceptanceCriterion> => {
    const res = await fetch(`${API_URL}/acceptance-criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateAcceptanceCriterion: async (id: string, data: {
    given?: string;
    when?: string;
    then?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    valid?: number;
    risk?: 'Low' | 'Medium' | 'High';
    comments?: string;
    updated_by: string;
  }): Promise<AcceptanceCriterion> => {
    const res = await fetch(`${API_URL}/acceptance-criteria/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteAcceptanceCriterion: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/acceptance-criteria/${id}`, {
      method: 'DELETE',
    });
  },

  // Test Cases
  getTestCases: async (): Promise<TestCase[]> => {
    const res = await fetch(`${API_URL}/test-cases`);
    return res.json();
  },

  getTestCasesByAcceptanceCriterion: async (acId: string): Promise<TestCase[]> => {
    const res = await fetch(`${API_URL}/test-cases?acceptance_criterion_id=${acId}`);
    return res.json();
  },

  createTestCase: async (data: {
    acceptance_criterion_id: string;
    preconditions: string;
    steps: string;
    expected_result: string;
    priority: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<TestCase> => {
    const res = await fetch(`${API_URL}/test-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateTestCase: async (id: string, data: {
    preconditions?: string;
    steps?: string;
    expected_result?: string;
    priority?: 'Low' | 'Medium' | 'High';
    test_status?: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
    updated_by: string;
  }): Promise<TestCase> => {
    const res = await fetch(`${API_URL}/test-cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteTestCase: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/test-cases/${id}`, {
      method: 'DELETE',
    });
  },

  // Actors
  getActors: async (projectId?: string): Promise<Actor[]> => {
    const url = projectId ? `${API_URL}/actors?project_id=${projectId}` : `${API_URL}/actors`;
    const res = await fetch(url);
    return res.json();
  },

  createActor: async (data: {
    project_id: string;
    name: string;
  }): Promise<Actor> => {
    const res = await fetch(`${API_URL}/actors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateActor: async (id: string, data: {
    project_id?: string;
    name?: string;
    description?: string;
    updated_by: string;
  }): Promise<Actor> => {
    const res = await fetch(`${API_URL}/actors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteActor: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/actors/${id}`, {
      method: 'DELETE',
    });
  },
};

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
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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