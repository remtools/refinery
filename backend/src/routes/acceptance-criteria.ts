import { Router } from 'express';
import { AcceptanceCriterionService } from '../models/AcceptanceCriterion.js';
import { validate } from '../middleware/index.js';
import { acceptanceCriterionSchema, updateAcceptanceCriterionSchema } from '../middleware/validation.js';

const router = Router();
const acService = new AcceptanceCriterionService();

// GET /api/acceptance-criteria
router.get('/', async (req, res, next) => {
  try {
    const acs = await acService.getAll();
    return res.json(acs);
  } catch (error) {
    return next(error);
  }
});

// GET /api/acceptance-criteria/:id
router.get('/:id', async (req, res, next) => {
  try {
    const ac = await acService.getById(req.params.id);
    if (!ac) {
      return res.status(404).json({ error: 'Acceptance criterion not found' });
    }
    return res.json(ac);
  } catch (error) {
    return next(error);
  }
});

// GET /api/acceptance-criteria/story/:storyId
router.get('/story/:storyId', async (req, res, next) => {
  try {
    const acs = await acService.getByStoryId(req.params.storyId);
    return res.json(acs);
  } catch (error) {
    return next(error);
  }
});

// POST /api/acceptance-criteria
router.post('/', validate(acceptanceCriterionSchema), async (req, res, next) => {
  try {
    const ac = await acService.create(req.body);
    return res.status(201).json(ac);
  } catch (error) {
    if (error.message.includes('Referenced story does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

// PUT /api/acceptance-criteria/:id
router.put('/:id', validate(updateAcceptanceCriterionSchema), async (req, res, next) => {
  try {
    const ac = await acService.update(req.params.id, req.body);
    if (!ac) {
      return res.status(404).json({ error: 'Acceptance criterion not found' });
    }
    return res.json(ac);
  } catch (error) {
    if (error.message.includes('locked')) {
      return res.status(423).json({ error: error.message });
    }
    return next(error);
  }
});

// DELETE /api/acceptance-criteria/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await acService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Acceptance criterion not found' });
    }
    return res.status(204).send();
  } catch (error) {
    if (error.message.includes('Cannot delete acceptance criterion')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

export default router;