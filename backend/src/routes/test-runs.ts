import express from 'express';
import { TestRunService } from '../models/TestRun.js';

const router = express.Router();
const testRunService = new TestRunService();

// Update test run
router.put('/:id', async (req, res, next) => {
    try {
        const updated = await testRunService.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Test run not found' });
        }
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

export default router;
