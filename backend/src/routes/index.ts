import { Router } from 'express';
import authRoutes from './auth.routes';
import groupRoutes from './group.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import milestoneRoutes from './milestone.routes';
import userRoutes from './user.routes';
import commentRoutes from './comment.routes';
import attachmentRoutes from './attachment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/attachments', attachmentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
