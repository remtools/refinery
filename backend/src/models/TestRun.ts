import { db } from '../database/index.js';
import { TestRun } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class TestRunService {
    async getByTestSetId(testSetId: string): Promise<TestRun[]> {
        return db.all<TestRun>('SELECT * FROM test_runs WHERE test_set_id = ?', [testSetId]);
    }

    async createBulk(testSetId: string, testCaseIds: string[], createdBy: string): Promise<void> {
        const now = new Date().toISOString();

        // Using transaction for bulk insert
        await db.run('BEGIN TRANSACTION');

        try {
            for (const tcId of testCaseIds) {
                const id = uuidv4();
                await db.run(`
          INSERT INTO test_runs (id, test_set_id, test_case_id, status, created_at, created_by, updated_at, updated_by)
          VALUES (?, ?, ?, 'Not Run', ?, ?, ?, ?)
        `, [id, testSetId, tcId, now, createdBy, now, createdBy]);
            }
            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    async update(id: string, data: {
        status?: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
        actual_result?: string;
        notes?: string;
        updated_by: string;
    }): Promise<TestRun | undefined> {
        const existing = await db.get<TestRun>('SELECT * FROM test_runs WHERE id = ?', [id]);
        if (!existing) return undefined;

        const now = new Date().toISOString();
        const updates: string[] = [];
        const values: any[] = [];

        if (data.status !== undefined) {
            updates.push('status = ?');
            values.push(data.status);

            // Update executed info if status changes to something other than Not Run
            if (data.status !== 'Not Run') {
                updates.push('executed_at = ?');
                updates.push('executed_by = ?');
                values.push(now, data.updated_by);
            }
        }
        if (data.actual_result !== undefined) {
            updates.push('actual_result = ?');
            values.push(data.actual_result);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }

        updates.push('updated_at = ?');
        updates.push('updated_by = ?');
        values.push(now, data.updated_by);

        values.push(id);

        await db.run(`
      UPDATE test_runs SET ${updates.join(', ')} WHERE id = ?
    `, values);

        return db.get<TestRun>('SELECT * FROM test_runs WHERE id = ?', [id]);
    }
}
