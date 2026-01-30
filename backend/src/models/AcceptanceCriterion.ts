import { db } from '../database/index.js';
import { AcceptanceCriterion } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class AcceptanceCriterionService {
  async getAll(): Promise<AcceptanceCriterion[]> {
    return db.all<AcceptanceCriterion>('SELECT * FROM acceptance_criteria ORDER BY created_at DESC');
  }

  async getById(id: string): Promise<AcceptanceCriterion | undefined> {
    return db.get<AcceptanceCriterion>('SELECT * FROM acceptance_criteria WHERE id = ?', [id]);
  }

  async getByStoryId(storyId: string): Promise<AcceptanceCriterion[]> {
    return db.all<AcceptanceCriterion>('SELECT * FROM acceptance_criteria WHERE story_id = ? ORDER BY created_at DESC', [storyId]);
  }

  async create(data: {
    story_id: string;
    given: string;
    when: string;
    then: string;
    risk: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<AcceptanceCriterion> {
    // Verify story exists
    const story = await db.get('SELECT id FROM stories WHERE id = ?', [data.story_id]);
    if (!story) {
      throw new Error('Referenced story does not exist');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const ac: AcceptanceCriterion = {
      id,
      story_id: data.story_id,
      given: data.given,
      when: data.when,
      then: data.then,
      status: 'Draft',
      valid: 1,
      risk: data.risk,
      comments: '',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO acceptance_criteria (id, story_id, given, "when", "then", status, valid, risk, comments, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ac.id, ac.story_id, ac.given, ac.when, ac.then, ac.status, ac.valid ? 1 : 0,
      ac.risk, ac.comments, ac.created_at, ac.created_by, ac.updated_at, ac.updated_by
    ]);

    return ac;
  }

  async update(id: string, data: {
    given?: string;
    when?: string;
    then?: string;
    status?: 'Draft' | 'Approved' | 'Locked';
    valid?: boolean;
    risk?: 'Low' | 'Medium' | 'High';
    comments?: string;
    updated_by: string;
  }): Promise<AcceptanceCriterion | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    // Check if AC is locked
    if (existing.status === 'Locked') {
      throw new Error('Cannot modify locked acceptance criterion');
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.given !== undefined) {
      updates.push('given = ?');
      values.push(data.given);
    }
    if (data.when !== undefined) {
      updates.push('"when" = ?');
      values.push(data.when);
    }
    if (data.then !== undefined) {
      updates.push('"then" = ?');
      values.push(data.then);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.valid !== undefined) {
      updates.push('valid = ?');
      values.push(data.valid ? 1 : 0);
    }
    if (data.risk !== undefined) {
      updates.push('risk = ?');
      values.push(data.risk);
    }
    if (data.comments !== undefined) {
      updates.push('comments = ?');
      values.push(data.comments);
    }

    updates.push('updated_at = ?');
    updates.push('updated_by = ?');
    values.push(now, data.updated_by);

    values.push(id);

    await db.run(`
      UPDATE acceptance_criteria SET ${updates.join(', ')} WHERE id = ?
    `, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Check if AC has test cases
    const testCases = await db.all('SELECT id FROM test_cases WHERE acceptance_criterion_id = ?', [id]);
    if (testCases.length > 0) {
      throw new Error('Cannot delete acceptance criterion with existing test cases');
    }

    const result = await db.run('DELETE FROM acceptance_criteria WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }
}