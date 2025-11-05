import { Router } from 'express';
import authRoutes from './auth.routes';
import groupRoutes from './group.routes';
import taskRoutes from './task.routes';
import milestoneRoutes from './milestone.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/tasks', taskRoutes);
router.use('/milestones', milestoneRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
