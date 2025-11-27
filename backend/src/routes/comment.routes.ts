import { Router } from 'express';
import CommentController from '../controllers/CommentController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createCommentSchema = Joi.object({
  taskId: Joi.number().integer().required(),
  content: Joi.string().min(1).required(),
  parentId: Joi.number().integer().optional(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).required(),
});

router.post('/', validate(createCommentSchema), CommentController.createComment);
router.get('/task/:taskId', CommentController.getTaskComments);
router.get('/:id', CommentController.getCommentById);
router.put('/:id', validate(updateCommentSchema), CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
