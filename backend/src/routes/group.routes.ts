import { Router } from 'express';
import GroupController from '../controllers/GroupController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  color: Joi.string().max(20).optional(),
  iconUrl: Joi.string().uri().allow('', null).optional(),
});

const updateGroupSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  color: Joi.string().max(20).optional(),
  iconUrl: Joi.string().uri().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
});

router.post('/', validate(createGroupSchema), GroupController.createGroup);
router.get('/', GroupController.getAllGroups);
router.get('/with-projects', GroupController.getGroupsWithProjectCount);
router.get('/:id', GroupController.getGroupById);
router.put('/:id', validate(updateGroupSchema), GroupController.updateGroup);
router.patch('/:id/toggle-status', GroupController.toggleGroupStatus);
router.delete('/:id', GroupController.deleteGroup);

export default router;
