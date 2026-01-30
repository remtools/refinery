import { Router } from 'express';
import { TestCaseService } from '../models/TestCase.js';
import { validate } from '../middleware/index.js';
import { testCaseSchema, updateTestCaseSchema } from '../middleware/validation.js';

const router = Router();
const testCaseService = new TestCaseService();

// GET /api/test-cases
router.get('/', async (req, res, next) => {
  try {
    const testCases = await testCaseService.getAll();
    return res.json(testCases);
  } catch (error) {
    return next(error);
  }
});

// GET /api/test-cases/:id
router.get('/:id', async (req, res, next) => {
  try {
    const testCase = await testCaseService.getById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    return res.json(testCase);
  } catch (error) {
    return next(error);
  }
});

// GET /api/test-cases/acceptance-criterion/:acId
router.get('/acceptance-criterion/:acId', async (req, res, next) => {
  try {
    const testCases = await testCaseService.getByAcceptanceCriterionId(req.params.acId);
    return res.json(testCases);
  } catch (error) {
    return next(error);
  }
});

// POST /api/test-cases
router.post('/', validate(testCaseSchema), async (req, res, next) => {
  try {
    const testCase = await testCaseService.create(req.body);
    return res.status(201).json(testCase);
  } catch (error) {
    if (error.message.includes('Referenced acceptance criterion does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

// PUT /api/test-cases/:id
router.put('/:id', validate(updateTestCaseSchema), async (req, res, next) => {
  try {
    const testCase = await testCaseService.update(req.params.id, req.body);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    return res.json(testCase);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/test-cases/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await testCaseService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;