import { db } from '../database/index.js';
import { AcceptanceCriterion } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { StatusService } from './Status.js';

const statusService = new StatusService();

export class AcceptanceCriterionService {
  // ... (existing methods kept same until delete) ...

  async getAll(): Promise<AcceptanceCriterion[]> {
    return db.all<AcceptanceCriterion>('SELECT * FROM acceptance_criteria ORDER BY created_at DESC');
  }

  async getById(id: string): Promise<AcceptanceCriterion | undefined> {
    return db.get<AcceptanceCriterion>('SELECT * FROM acceptance_criteria WHERE id = ?', [id]);
  }

  async getByStoryId(storyId: string): Promise<AcceptanceCriterion[]> {
    return db.all<AcceptanceCriterion>('SELECT * FROM acceptance_criteria WHERE story_id = ? ORDER BY created_at DESC', [storyId]);
  }

  async generateNextKey(): Promise<string> {
    const last = await db.get<{ key: string }>('SELECT key FROM acceptance_criteria WHERE key LIKE \'AC-%\' ORDER BY length(key) DESC, key DESC LIMIT 1');
    if (!last || !last.key) return 'AC-001';
    const match = last.key.match(/AC-(\d+)/);
    if (!match) return 'AC-001';
    const nextNum = parseInt(match[1]) + 1;
    return `AC-${nextNum.toString().padStart(3, '0')}`;
  }

  async create(data: {
    story_id: string;
    key?: string; // Optional
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
    const key = data.key || await this.generateNextKey();

    const ac: AcceptanceCriterion = {
      id,
      story_id: data.story_id,
      key,
      given: data.given,
      when: data.when,
      then: data.then,
      status: 'Drafted',
      valid: 1,
      risk: data.risk,
      comments: '',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO acceptance_criteria (id, story_id, key, given, "when", "then", status, valid, risk, comments, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ac.id, ac.story_id, ac.key, ac.given, ac.when, ac.then, ac.status, ac.valid ? 1 : 0,
      ac.risk, ac.comments, ac.created_at, ac.created_by, ac.updated_at, ac.updated_by
    ]);

    return ac;
  }

  async update(id: string, data: {
    given?: string;
    when?: string;
    then?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
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
    const ac = await this.getById(id);
    if (!ac) return false;

    // Check deletion rules based on status configuration
    const statusConfig = await statusService.getByKey(ac.status);
    if (!statusConfig?.is_deletable) {
      throw new Error(`Acceptance Criteria in status '${ac.status}' cannot be deleted`);
    }

    // Cascade delete: Test Cases -> Test Runs
    // 1. Delete all TCs for this AC
    const testCases = await db.all<{ id: string }>('SELECT id FROM test_cases WHERE acceptance_criterion_id = ?', [id]);

    // 2. Cleanup orphan test runs for these test cases (if needed)
    // Assuming TestRun links to TestCase. We should clean them up to avoid orphans.
    await db.run('DELETE FROM test_runs WHERE test_case_id IN (SELECT id FROM test_cases WHERE acceptance_criterion_id = ?)', [id]);

    // 3. Delete Test Cases
    await db.run('DELETE FROM test_cases WHERE acceptance_criterion_id = ?', [id]);

    // 4. Delete AC
    const result = await db.run('DELETE FROM acceptance_criteria WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }
}