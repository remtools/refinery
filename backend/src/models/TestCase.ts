import { db } from '../database/index.js';
import { TestCase } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class TestCaseService {
  async getAll(): Promise<TestCase[]> {
    return db.all<TestCase>('SELECT * FROM test_cases ORDER BY created_at DESC');
  }

  async getById(id: string): Promise<TestCase | undefined> {
    return db.get<TestCase>('SELECT * FROM test_cases WHERE id = ?', [id]);
  }

  async generateNextKey(): Promise<string> {
    const last = await db.get<{ key: string }>('SELECT key FROM test_cases WHERE key LIKE "TC-%" ORDER BY length(key) DESC, key DESC LIMIT 1');
    if (!last || !last.key) return 'TC-001';
    const match = last.key.match(/TC-(\d+)/);
    if (!match) return 'TC-001';
    const nextNum = parseInt(match[1]) + 1;
    return `TC-${nextNum.toString().padStart(3, '0')}`;
  }

  async create(data: {
    acceptance_criterion_id: string;
    key?: string; // Optional
    preconditions: string;
    steps: string;
    expected_result: string;
    priority: 'Low' | 'Medium' | 'High';
    created_by: string;
  }): Promise<TestCase> {
    // Verify acceptance criterion exists
    const ac = await db.get('SELECT id FROM acceptance_criteria WHERE id = ?', [data.acceptance_criterion_id]);
    if (!ac) {
      throw new Error('Referenced acceptance criterion does not exist');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const key = data.key || await this.generateNextKey();

    const testCase: TestCase = {
      id,
      acceptance_criterion_id: data.acceptance_criterion_id,
      key,
      preconditions: data.preconditions,
      steps: data.steps,
      expected_result: data.expected_result,
      priority: data.priority,
      test_status: 'Not Run',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO test_cases (id, acceptance_criterion_id, key, preconditions, steps, expected_result, priority, test_status, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testCase.id, testCase.acceptance_criterion_id, testCase.key, testCase.preconditions, testCase.steps,
      testCase.expected_result, testCase.priority, testCase.test_status,
      testCase.created_at, testCase.created_by, testCase.updated_at, testCase.updated_by
    ]);

    return testCase;
  }

  async update(id: string, data: {
    preconditions?: string;
    steps?: string;
    expected_result?: string;
    priority?: 'Low' | 'Medium' | 'High';
    test_status?: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
    updated_by: string;
  }): Promise<TestCase | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.preconditions !== undefined) {
      updates.push('preconditions = ?');
      values.push(data.preconditions);
    }
    if (data.steps !== undefined) {
      updates.push('steps = ?');
      values.push(data.steps);
    }
    if (data.expected_result !== undefined) {
      updates.push('expected_result = ?');
      values.push(data.expected_result);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.test_status !== undefined) {
      updates.push('test_status = ?');
      values.push(data.test_status);
    }

    updates.push('updated_at = ?');
    updates.push('updated_by = ?');
    values.push(now, data.updated_by);

    values.push(id);

    await db.run(`
      UPDATE test_cases SET ${updates.join(', ')} WHERE id = ?
    `, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.run('DELETE FROM test_cases WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }
}