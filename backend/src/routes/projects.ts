import { Router } from 'express';
import { ProjectService } from '../models/Project.js';
import { validate } from '../middleware/index.js';
import { projectSchema, updateProjectSchema } from '../middleware/validation.js';

const router = Router();
const projectService = new ProjectService();

// GET /api/projects
router.get('/', async (req, res, next) => {
    try {
        const projects = await projectService.getAll();
        return res.json(projects);
    } catch (error) {
        return next(error);
    }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
    try {
        const project = await projectService.getById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.json(project);
    } catch (error) {
        return next(error);
    }
});

// POST /api/projects
router.post('/', validate(projectSchema), async (req, res, next) => {
    try {
        const project = await projectService.create(req.body);
        return res.status(201).json(project);
    } catch (error) {
        return next(error);
    }
});

// PUT /api/projects/:id
router.put('/:id', validate(updateProjectSchema), async (req, res, next) => {
    try {
        const project = await projectService.update(req.params.id, req.body);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.json(project);
    } catch (error) {
        return next(error);
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const success = await projectService.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
});

export default router;
