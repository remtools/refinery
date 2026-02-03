const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Generic fetch wrapper
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.details) {
          const details = errorData.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          throw new Error(`${errorData.error} - ${details}`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  // Projects
  async getProjects() {
    return this.request('/projects');
  },

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  },

  async createProject(data: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async importProject(data: any) {
    return this.request('/projects/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async exportProject(id: string) {
    return this.request(`/projects/${id}/export`);
  },

  // Epics
  async getEpics(projectId?: string) {
    const endpoint = projectId ? `/epics?project_id=${projectId}` : '/epics';
    return this.request(endpoint);
  },

  async getEpic(id: string) {
    return this.request(`/epics/${id}`);
  },

  async createEpic(data: any) {
    return this.request('/epics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEpic(id: string, data: any) {
    return this.request(`/epics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEpic(id: string) {
    return this.request(`/epics/${id}`, {
      method: 'DELETE',
    });
  },

  // Stories
  async getStories() {
    return this.request('/stories');
  },

  async getStoriesByEpic(epicId: string) {
    return this.request(`/stories/epic/${epicId}`);
  },

  async createStory(data: any) {
    return this.request('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStory(id: string, data: any) {
    return this.request(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStory(id: string) {
    return this.request(`/stories/${id}`, {
      method: 'DELETE',
    });
  },

  // Acceptance Criteria
  async getAcceptanceCriteria() {
    return this.request('/acceptance-criteria');
  },

  async getAcceptanceCriteriaByStory(storyId: string) {
    return this.request(`/acceptance-criteria/story/${storyId}`);
  },

  async createAcceptanceCriterion(data: any) {
    return this.request('/acceptance-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAcceptanceCriterion(id: string, data: any) {
    return this.request(`/acceptance-criteria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAcceptanceCriterion(id: string) {
    return this.request(`/acceptance-criteria/${id}`, {
      method: 'DELETE',
    });
  },

  // Test Cases
  async getTestCases() {
    return this.request('/test-cases');
  },

  async getTestCasesByAcceptanceCriterion(acId: string) {
    return this.request(`/test-cases/acceptance-criterion/${acId}`);
  },

  async createTestCase(data: any) {
    return this.request('/test-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTestCase(id: string, data: any) {
    return this.request(`/test-cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTestCase(id: string) {
    return this.request(`/test-cases/${id}`, {
      method: 'DELETE',
    });
  },

  // Actors
  async getActors(projectId?: string) {
    const endpoint = projectId ? `/actors?project_id=${projectId}` : '/actors';
    return this.request(endpoint);
  },

  async createActor(data: any) {
    return this.request('/actors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateActor(id: string, data: any) {
    return this.request(`/actors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteActor(id: string) {
    return this.request(`/actors/${id}`, {
      method: 'DELETE',
    });
  },
};