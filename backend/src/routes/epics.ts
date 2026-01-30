import { Router } from 'express';
import { EpicService } from '../models/Epic.js';
import { validate } from '../middleware/index.js';
import { epicSchema, updateEpicSchema } from '../middleware/validation.js';

const router = Router();
const epicService = new EpicService();

// GET /api/epics
router.get('/', async (req, res, next) => {
  try {
    const { project_id } = req.query;
    if (project_id) {
      const epics = await epicService.getByProjectId(project_id as string);
      return res.json(epics);
    }
    const epics = await epicService.getAll();
    return res.json(epics);
  } catch (error) {
    return next(error);
  }
});

// GET /api/epics/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const epics = await epicService.getByProjectId(req.params.projectId);
    return res.json(epics);
  } catch (error) {
    return next(error);
  }
});

// GET /api/epics/:id
router.get('/:id', async (req, res, next) => {
  try {
    const epic = await epicService.getById(req.params.id);
    if (!epic) {
      return res.status(404).json({ error: 'Epic not found' });
    }
    return res.json(epic);
  } catch (error) {
    return next(error);
  }
});

// POST /api/epics
router.post('/', validate(epicSchema), async (req, res, next) => {
  try {
    let epicData = req.body;

    // Use provided key or auto-generate
    if (!epicData.key) {
      const nextKey = await epicService.generateNextKey();
      epicData = { ...epicData, key: nextKey };
    } else {
      // Check for duplicate key only if manually provided
      const existing = await epicService.getByKey(epicData.key);
      if (existing) {
        return res.status(409).json({ error: 'Epic with this key already exists' });
      }
    }

    const epic = await epicService.create(epicData);
    return res.status(201).json(epic);
  } catch (error) {
    return next(error);
  }
});

// PUT /api/epics/:id
router.put('/:id', validate(updateEpicSchema), async (req, res, next) => {
  try {
    const epic = await epicService.update(req.params.id, req.body);
    if (!epic) {
      return res.status(404).json({ error: 'Epic not found' });
    }
    return res.json(epic);
  } catch (error) {
    if (error.message.includes('locked')) {
      return res.status(423).json({ error: error.message });
    }
    return next(error);
  }
});

// DELETE /api/epics/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await epicService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Epic not found' });
    }
    return res.status(204).send();
  } catch (error) {
    if (error.message.includes('Cannot delete epic')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

export default router;