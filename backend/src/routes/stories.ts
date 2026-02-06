import { Router } from 'express';
import { StoryService } from '../models/Story.js';
import { validate } from '../middleware/index.js';
import { storySchema, updateStorySchema } from '../middleware/validation.js';

const router = Router();
const storyService = new StoryService();

// GET /api/stories
router.get('/', async (req, res, next) => {
  try {
    const stories = await storyService.getAll();
    return res.json(stories);
  } catch (error) {
    return next(error);
  }
});

// GET /api/stories/:id/export
router.get('/:id/export', async (req, res, next) => {
  try {
    const data = await storyService.export(req.params.id);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="story-${data.key}-${new Date().toISOString()}.json"`);

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

// GET /api/stories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const story = await storyService.getById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    return res.json(story);
  } catch (error) {
    return next(error);
  }
});

// GET /api/stories/epic/:epicId
router.get('/epic/:epicId', async (req, res, next) => {
  try {
    const stories = await storyService.getByEpicId(req.params.epicId);
    return res.json(stories);
  } catch (error) {
    return next(error);
  }
});

// POST /api/stories/import
router.post('/import', async (req, res, next) => {
  try {
    const { data, epic_id } = req.body;
    if (!data || !epic_id) {
      return res.status(400).json({ error: 'Missing data or epic_id' });
    }
    const story = await storyService.import(data, epic_id);
    return res.status(201).json(story);
  } catch (error) {
    return next(error);
  }
});

// POST /api/stories
router.post('/', validate(storySchema), async (req, res, next) => {
  try {
    const story = await storyService.create(req.body);
    return res.status(201).json(story);
  } catch (error) {
    if (error.message.includes('Referenced epic does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

// PUT /api/stories/:id
router.put('/:id', validate(updateStorySchema), async (req, res, next) => {
  try {
    const story = await storyService.update(req.params.id, req.body);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    return res.json(story);
  } catch (error) {
    if (error.message.includes('locked')) {
      return res.status(423).json({ error: error.message });
    }
    return next(error);
  }
});

// DELETE /api/stories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await storyService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Story not found' });
    }
    return res.status(204).send();
  } catch (error) {
    if (error.message.includes('Cannot delete story') || error.message.includes('Only archived stories can be deleted')) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

export default router;