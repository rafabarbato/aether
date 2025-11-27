import { Router } from 'express';
import ProjectController from '../controllers/ProjectController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createProjectSchema = Joi.object({
  groupId: Joi.number().integer().optional(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  color: Joi.string().max(20).optional(),
  teamId: Joi.number().integer().optional(),
  startDate: Joi.date().allow('', null).optional(),
  endDate: Joi.date().allow('', null).optional(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'archived').default('planning'),
});

const updateProjectSchema = Joi.object({
  groupId: Joi.number().integer().allow(null).optional(),
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  color: Joi.string().max(20).optional(),
  teamId: Joi.number().integer().allow(null).optional(),
  startDate: Joi.date().allow(null).optional(),
  endDate: Joi.date().allow(null).optional(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'archived').optional(),
});

router.post('/', validate(createProjectSchema), ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/group/:groupId', ProjectController.getProjectsByGroup);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', validate(updateProjectSchema), ProjectController.updateProject);
router.patch('/:id/status', ProjectController.updateProjectStatus);
router.delete('/:id', ProjectController.deleteProject);

export default router;
