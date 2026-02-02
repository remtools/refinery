import { db } from '../database/index.js';
import { Actor } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ActorService {
    async create(data: Partial<Actor>): Promise<Actor> {
        const id = uuidv4();
        const now = new Date().toISOString();

        const actor: Actor = {
            id,
            project_id: data.project_id!,
            name: data.name!,
            role: data.role || '',
            description: data.description || '',
            created_at: now,
            created_by: data.created_by || 'system',
            updated_at: now,
            updated_by: data.updated_by || 'system',
        };

        await db.run(
            `INSERT INTO actors (id, project_id, name, role, description, created_at, created_by, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [actor.id, actor.project_id, actor.name, actor.role, actor.description, actor.created_at, actor.created_by, actor.updated_at, actor.updated_by]
        );

        return actor;
    }
}
