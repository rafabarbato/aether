import { Request, Response, NextFunction } from 'express';
import CommentService from '../services/CommentService';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const comment = await CommentService.createComment(req.body, userId);

      res.status(201).json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      logger.error('Error creating comment:', error);
      next(error);
    }
  }

  async getCommentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await CommentService.getCommentById(parseInt(req.params.id));

      res.status(200).json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await CommentService.getTaskComments(taskId);

      res.status(200).json({
        success: true,
        data: { comments },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      const comment = await CommentService.updateComment(commentId, content, userId);

      res.status(200).json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      logger.error('Error updating comment:', error);
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const commentId = parseInt(req.params.id);

      await CommentService.deleteComment(commentId, userId);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting comment:', error);
      next(error);
    }
  }
}

export default new CommentController();
