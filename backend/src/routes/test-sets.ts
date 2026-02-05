import express from 'express';
import { TestSetService } from '../models/TestSet.js';
import { TestRunService } from '../models/TestRun.js';

const router = express.Router();
const testSetService = new TestSetService();
const testRunService = new TestRunService();

// Get all test sets
router.get('/', async (req, res, next) => {
    try {
        const testSets = await testSetService.getAll();
        res.json(testSets);
    } catch (error) {
        next(error);
    }
});

// Get test set by ID
router.get('/:id', async (req, res, next) => {
    try {
        const testSet = await testSetService.getById(req.params.id);
        if (!testSet) {
            return res.status(404).json({ error: 'Test set not found' });
        }
        res.json(testSet);
    } catch (error) {
        next(error);
    }
});

// Create test set
router.post('/', async (req, res, next) => {
    try {
        const { title, description, status, created_by } = req.body;

        if (!title || !status) {
            return res.status(400).json({ error: 'Title and status are required' });
        }

        const testSet = await testSetService.create({
            title,
            description: description || '',
            status,
            created_by: created_by || 'system'
        });

        res.status(201).json(testSet);
    } catch (error) {
        next(error);
    }
});

// Update test set
router.put('/:id', async (req, res, next) => {
    try {
        const updated = await testSetService.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Test set not found' });
        }
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Delete test set
router.delete('/:id', async (req, res, next) => {
    try {
        const success = await testSetService.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Test set not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Get runs for a test set
router.get('/:id/runs', async (req, res, next) => {
    try {
        const runs = await testRunService.getByTestSetId(req.params.id);
        res.json(runs);
    } catch (error) {
        next(error);
    }
});

// Create bulk runs for a test set
router.post('/:id/runs/bulk', async (req, res, next) => {
    try {
        const { testCaseIds, created_by } = req.body;
        if (!testCaseIds || !Array.isArray(testCaseIds)) {
            return res.status(400).json({ error: 'testCaseIds array is required' });
        }

        await testRunService.createBulk(req.params.id, testCaseIds, created_by || 'system');
        res.status(201).json({ message: 'Runs created successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
