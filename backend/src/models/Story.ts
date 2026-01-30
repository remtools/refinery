import { db } from '../database/index.js';
import { Story } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class StoryService {
  async getAll(): Promise<Story[]> {
    return db.all<Story>('SELECT * FROM stories ORDER BY created_at DESC');
  }

  async getById(id: string): Promise<Story | undefined> {
    return db.get<Story>('SELECT * FROM stories WHERE id = ?', [id]);
  }

  async getByEpicId(epicId: string): Promise<Story[]> {
    return db.all<Story>('SELECT * FROM stories WHERE epic_id = ? ORDER BY created_at DESC', [epicId]);
  }

  async create(data: {
    epic_id: string;
    actor: string;
    action: string;
    outcome: string;
    created_by: string;
  }): Promise<Story> {
    // Verify epic exists
    const epic = await db.get('SELECT id FROM epics WHERE id = ?', [data.epic_id]);
    if (!epic) {
      throw new Error('Referenced epic does not exist');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const story: Story = {
      id,
      epic_id: data.epic_id,
      actor: data.actor,
      action: data.action,
      outcome: data.outcome,
      status: 'Draft',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO stories (id, epic_id, actor, action, outcome, status, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      story.id, story.epic_id, story.actor, story.action, story.outcome, story.status,
      story.created_at, story.created_by, story.updated_at, story.updated_by
    ]);

    return story;
  }

  async update(id: string, data: {
    actor?: string;
    action?: string;
    outcome?: string;
    status?: 'Draft' | 'Approved' | 'Locked';
    updated_by: string;
  }): Promise<Story | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    // Check if story is locked
    if (existing.status === 'Locked') {
      throw new Error('Cannot modify locked story');
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.actor !== undefined) {
      updates.push('actor = ?');
      values.push(data.actor);
    }
    if (data.action !== undefined) {
      updates.push('action = ?');
      values.push(data.action);
    }
    if (data.outcome !== undefined) {
      updates.push('outcome = ?');
      values.push(data.outcome);
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
      UPDATE stories SET ${updates.join(', ')} WHERE id = ?
    `, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Check if story has acceptance criteria
    const acs = await db.all('SELECT id FROM acceptance_criteria WHERE story_id = ?', [id]);
    if (acs.length > 0) {
      throw new Error('Cannot delete story with existing acceptance criteria');
    }

    const result = await db.run('DELETE FROM stories WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }
}