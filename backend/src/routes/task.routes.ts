import { Router } from 'express';
import TaskController from '../controllers/TaskController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createTaskSchema = Joi.object({
  projectId: Joi.number().integer().required(),
  groupId: Joi.number().integer().optional(),
  milestoneId: Joi.number().integer().optional(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('ready', 'in_progress', 'in_review', 'done').default('ready'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  tagLabel: Joi.string().max(50).optional(),
  assignedTo: Joi.number().integer().optional(),
  assignees: Joi.array().items(Joi.number().integer()).optional(), // Support multiple assignees
  estimatedHours: Joi.number().min(0).optional(),
  dueDate: Joi.date().optional(),
  position: Joi.number().integer().default(0),
});

const updateTaskSchema = Joi.object({
  groupId: Joi.number().integer().allow(null).optional(),
  milestoneId: Joi.number().integer().allow(null).optional(),
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('ready', 'in_progress', 'in_review', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tagLabel: Joi.string().max(50).optional(),
  assignedTo: Joi.number().integer().allow(null).optional(),
  assignees: Joi.array().items(Joi.number().integer()).optional(), // Support multiple assignees
  estimatedHours: Joi.number().min(0).allow(null).optional(),
  actualHours: Joi.number().min(0).allow(null).optional(),
  dueDate: Joi.date().allow(null).optional(),
});

router.post('/', validate(createTaskSchema), TaskController.createTask);
router.get('/', TaskController.getAllTasks);
router.get('/stats', TaskController.getUserTaskStats);
router.get('/project/:projectId', TaskController.getTasksByProject);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.patch('/:id/position', TaskController.updateTaskPosition);
router.delete('/:id', TaskController.deleteTask);

export default router;
