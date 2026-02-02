import express from 'express';
import { db } from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/index.js';
import { actorSchema, updateActorSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all actors (optionally filtered by project_id)
router.get('/', async (req, res, next) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM actors';
        const params: any[] = [];

        if (project_id) {
            query += ' WHERE project_id = ?';
            params.push(project_id);
        }

        query += ' ORDER BY created_at DESC';

        const actors = await db.all(query, params);
        res.json(actors);
    } catch (error) {
        next(error);
    }
});

// Create a new actor
router.post('/', validate(actorSchema), async (req, res, next) => {
    try {
        const { project_id, name, role, description, created_by } = req.body;

        // Check if project exists
        const project = await db.get('SELECT id FROM projects WHERE id = ?', [project_id]);
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO actors (id, project_id, name, role, description, created_at, created_by, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, project_id, name, role, description, now, created_by, now, created_by]
        );

        const newActor = await db.get('SELECT * FROM actors WHERE id = ?', [id]);
        res.status(201).json(newActor);
    } catch (error) {
        next(error);
    }
});

// Update an actor
router.put('/:id', validate(updateActorSchema), async (req, res, next) => {
    try {
        const { name, role, description, updated_by } = req.body;
        const { id } = req.params;

        const actor = await db.get('SELECT * FROM actors WHERE id = ?', [id]);
        if (!actor) {
            res.status(404).json({ error: 'Actor not found' });
            return;
        }

        const now = new Date().toISOString();

        // Build dynamic update query
        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (role !== undefined) { updates.push('role = ?'); params.push(role); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }

        updates.push('updated_at = ?'); params.push(now);
        updates.push('updated_by = ?'); params.push(updated_by);

        params.push(id);

        await db.run(
            `UPDATE actors SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const updatedActor = await db.get('SELECT * FROM actors WHERE id = ?', [id]);
        res.json(updatedActor);
    } catch (error) {
        next(error);
    }
});

// Delete an actor
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const actor = await db.get('SELECT * FROM actors WHERE id = ?', [id]);

        if (!actor) {
            res.status(404).json({ error: 'Actor not found' });
            return;
        }

        await db.run('DELETE FROM actors WHERE id = ?', [id]);
        res.json({ message: 'Actor deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
