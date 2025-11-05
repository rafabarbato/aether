import { Router } from 'express';
import MilestoneController from '../controllers/MilestoneController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createMilestoneSchema = Joi.object({
  projectId: Joi.number().integer().required(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  type: Joi.string().valid('milestone', 'sprint').default('milestone'),
  status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').default('planning'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  iconUrl: Joi.string().uri().allow('', null).optional(),
});

const updateMilestoneSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  type: Joi.string().valid('milestone', 'sprint').optional(),
  status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').optional(),
  startDate: Joi.date().allow(null).optional(),
  endDate: Joi.date().allow(null).optional(),
  iconUrl: Joi.string().uri().allow('', null).optional(),
});

router.post('/', validate(createMilestoneSchema), MilestoneController.createMilestone);
router.get('/', MilestoneController.getAllMilestones);
router.get('/project/:projectId', MilestoneController.getMilestonesByProject);
router.get('/:id/stats', MilestoneController.getMilestoneStats);
router.get('/:id', MilestoneController.getMilestoneById);
router.put('/:id', validate(updateMilestoneSchema), MilestoneController.updateMilestone);
router.patch('/:id/status', MilestoneController.updateMilestoneStatus);
router.delete('/:id', MilestoneController.deleteMilestone);

export default router;
