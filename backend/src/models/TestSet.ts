import { db } from '../database/index.js';
import { TestSet } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class TestSetService {
    async getAll(): Promise<TestSet[]> {
        return db.all<TestSet>('SELECT * FROM test_sets ORDER BY created_at DESC');
    }

    async getById(id: string): Promise<TestSet | undefined> {
        return db.get<TestSet>('SELECT * FROM test_sets WHERE id = ?', [id]);
    }

    async generateNextKey(): Promise<string> {
        const last = await db.get<{ key: string }>('SELECT key FROM test_sets WHERE key LIKE "SET-%" ORDER BY length(key) DESC, key DESC LIMIT 1');
        if (!last || !last.key) return 'SET-001';
        const match = last.key.match(/SET-(\d+)/);
        if (!match) return 'SET-001';
        const nextNum = parseInt(match[1]) + 1;
        return `SET-${nextNum.toString().padStart(3, '0')}`;
    }

    async create(data: {
        title: string;
        description: string;
        status: 'Planned' | 'In Progress' | 'Completed';
        created_by: string;
    }): Promise<TestSet> {
        const id = uuidv4();
        const now = new Date().toISOString();
        const key = await this.generateNextKey();

        const testSet: TestSet = {
            id,
            key,
            title: data.title,
            description: data.description,
            status: data.status,
            created_at: now,
            created_by: data.created_by,
            updated_at: now,
            updated_by: data.created_by
        };

        await db.run(`
      INSERT INTO test_sets (id, key, title, description, status, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            testSet.id, testSet.key, testSet.title, testSet.description, testSet.status,
            testSet.created_at, testSet.created_by, testSet.updated_at, testSet.updated_by
        ]);

        return testSet;
    }

    async update(id: string, data: {
        title?: string;
        description?: string;
        status?: 'Planned' | 'In Progress' | 'Completed';
        updated_by: string;
    }): Promise<TestSet | undefined> {
        const existing = await this.getById(id);
        if (!existing) return undefined;

        const now = new Date().toISOString();
        const updates: string[] = [];
        const values: any[] = [];

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
      UPDATE test_sets SET ${updates.join(', ')} WHERE id = ?
    `, values);

        return this.getById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await db.run('DELETE FROM test_sets WHERE id = ?', [id]);
        return (result.changes || 0) > 0;
    }
}
