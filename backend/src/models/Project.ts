import { db } from '../database/index.js';
import { Project } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
    async getAll(): Promise<Project[]> {
        return db.all<Project>('SELECT * FROM projects ORDER BY created_at DESC');
    }

    async getById(id: string): Promise<Project | undefined> {
        return db.get<Project>('SELECT * FROM projects WHERE id = ?', [id]);
    }

    async create(data: Partial<Project>): Promise<Project> {
        const id = uuidv4();
        const now = new Date().toISOString();
        const project: Project = {
            id,
            name: data.name || '',
            description: data.description || '',
            status: data.status || 'Planned',
            created_at: now,
            created_by: data.created_by || 'system',
            updated_at: now,
            updated_by: data.updated_by || 'system',
        };

        await db.run(
            `INSERT INTO projects (id, name, description, status, created_at, created_by, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [project.id, project.name, project.description, project.status, project.created_at, project.created_by, project.updated_at, project.updated_by]
        );

        return project;
    }

    async update(id: string, data: Partial<Project>): Promise<Project | undefined> {
        const existing = await this.getById(id);
        if (!existing) return undefined;

        const now = new Date().toISOString();
        const updated = {
            ...existing,
            ...data,
            updated_at: now,
        };

        await db.run(
            `UPDATE projects SET name = ?, description = ?, status = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
            [updated.name, updated.description, updated.status, updated.updated_at, updated.updated_by, id]
        );

        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const result = await db.run('DELETE FROM projects WHERE id = ?', [id]);
        return result.changes > 0;
    }
}
