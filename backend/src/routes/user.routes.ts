import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', UserController.getAllUsers);
router.get('/me', UserController.getCurrentUser);
router.get('/:id', UserController.getUserById);

export default router;
