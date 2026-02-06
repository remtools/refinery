import { db } from '../database/index.js';
import { Epic } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { StatusService } from './Status.js';

const statusService = new StatusService();

export class EpicService {
  async getAll(): Promise<Epic[]> {
    return db.all<Epic>('SELECT * FROM epics ORDER BY created_at DESC');
  }

  async getByProjectId(projectId: string): Promise<Epic[]> {
    return db.all<Epic>('SELECT * FROM epics WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
  }

  async getById(id: string): Promise<Epic | undefined> {
    return db.get<Epic>('SELECT * FROM epics WHERE id = ?', [id]);
  }

  async getByKey(key: string): Promise<Epic | undefined> {
    return db.get<Epic>('SELECT * FROM epics WHERE key = ?', [key]);
  }

  async generateNextKey(): Promise<string> {
    const lastEpic = await db.get<{ key: string }>('SELECT key FROM epics WHERE key LIKE "EP-%" ORDER BY length(key) DESC, key DESC LIMIT 1');
    if (!lastEpic) {
      return 'EP-01';
    }
    const match = lastEpic.key.match(/EP-(\d+)/);
    if (!match) {
      return 'EP-01';
    }
    const nextNum = parseInt(match[1]) + 1;
    return `EP-${nextNum.toString().padStart(2, '0')}`;
  }

  async create(data: {
    project_id?: string;
    key?: string;
    title: string;
    description: string;
    created_by: string;
    status?: string;
  }): Promise<Epic> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const key = data.key || await this.generateNextKey();

    const epic: Epic = {
      id,
      project_id: data.project_id || '',
      key: key,
      title: data.title,
      description: data.description,
      status: (data.status || 'Drafted') as 'Drafted' | 'Reviewed' | 'Locked' | 'Archived',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO epics (id, project_id, key, title, description, status, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      epic.id, epic.project_id, epic.key, epic.title, epic.description, epic.status,
      epic.created_at, epic.created_by, epic.updated_at, epic.updated_by
    ]);

    return epic;
  }

  async update(id: string, data: {
    project_id?: string;
    key?: string;
    title?: string;
    description?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    updated_by: string;
  }): Promise<Epic | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    // Check if epic is locked
    if (existing.status === 'Locked') {
      throw new Error('Cannot modify locked epic');
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.project_id !== undefined) {
      updates.push('project_id = ?');
      values.push(data.project_id);
    }
    if (data.key !== undefined) {
      updates.push('key = ?');
      values.push(data.key);
    }
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    updates.push('updated_at = ?');
    updates.push('updated_by = ?');
    values.push(now, data.updated_by);

    values.push(id);

    await db.run(`
      UPDATE epics SET ${updates.join(', ')} WHERE id = ?
    `, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const epic = await this.getById(id);
    if (!epic) {
      throw new Error('Epic not found');
    }

    // Check deletion rules based on status configuration
    const statusConfig = await statusService.getByKey(epic.status);
    if (!statusConfig?.is_deletable) {
      throw new Error(`Epics in status '${epic.status}' cannot be deleted`);
    }

    // Cascade delete: Stories -> ACs -> TCs
    // 1. Get all stories
    const stories = await db.all<{ id: string }>('SELECT id FROM stories WHERE epic_id = ?', [id]);

    for (const story of stories) {
      // For each story, delete its dependencies (ACs, TCs)
      // We replicate StoryService.delete logic here to avoid circular dependency issues with Service imports

      // 1.1 Get all ACs
      const acs = await db.all<{ id: string }>('SELECT id FROM acceptance_criteria WHERE story_id = ?', [story.id]);

      for (const ac of acs) {
        // 1.2 Delete all TCs for this AC
        await db.run('DELETE FROM test_cases WHERE acceptance_criterion_id = ?', [ac.id]);
        // 1.3 Cleanup orphaned Test Runs linked to these TCs
        await db.run('DELETE FROM test_runs WHERE test_case_id IN (SELECT id FROM test_cases WHERE acceptance_criterion_id = ?)', [ac.id]);
      }

      // 1.4 Delete ACs
      await db.run('DELETE FROM acceptance_criteria WHERE story_id = ?', [story.id]);

      // 1.5 Delete Story
      await db.run('DELETE FROM stories WHERE id = ?', [story.id]);
    }

    const result = await db.run('DELETE FROM epics WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }
}