import express from 'express';
import { StatusService } from '../models/Status.js';

const router = express.Router();
const statusService = new StatusService();

// GET all statuses or filter by entity_type
router.get('/', async (req, res, next) => {
    try {
        const { entity_type } = req.query;
        if (entity_type) {
            const statuses = await statusService.getByEntity(entity_type as string);
            return res.json(statuses);
        } else {
            const statuses = await statusService.getAll();
            return res.json(statuses);
        }
    } catch (error) {
        next(error);
    }
});

// GET default status by entity_type
router.get('/default', async (req, res, next) => {
    try {
        const { entity_type } = req.query;
        if (!entity_type) {
            return res.status(400).json({ error: 'entity_type query parameter is required' });
        }
        const status = await statusService.getDefault(entity_type as string);
        if (!status) {
            return res.status(404).json({ error: 'Default status not found' });
        }
        return res.json(status);
    } catch (error) {
        next(error);
    }
});

// GET status by key
router.get('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const status = await statusService.getByKey(key);
        if (!status) {
            return res.status(404).json({ error: 'Status not found' });
        }
        return res.json(status);
    } catch (error) {
        next(error);
    }
});

export default router;
