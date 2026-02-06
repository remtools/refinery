import { db } from '../database/index.js';
import { Status } from '../types/Status.js';

export class StatusService {
    async getAll(): Promise<Status[]> {
        return db.all<Status>('SELECT * FROM statuses ORDER BY rank ASC');
    }

    async getByEntity(entityType: string): Promise<Status[]> {
        return db.all<Status>(
            'SELECT * FROM statuses WHERE entity_type = ? OR entity_type = "Global" ORDER BY rank ASC',
            [entityType]
        );
    }

    async getDefault(entityType: string): Promise<Status | undefined> {
        const status = await db.get<Status>(
            'SELECT * FROM statuses WHERE (entity_type = ? OR entity_type = "Global") AND is_default = 1 LIMIT 1',
            [entityType]
        );
        return status;
    }

    async getByKey(key: string): Promise<Status | undefined> {
        return db.get<Status>('SELECT * FROM statuses WHERE key = ?', [key]);
    }
}
