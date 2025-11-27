import CommentRepository, { CommentFilters } from '../database/repositories/CommentRepository';
import Comment, { CommentCreationAttributes } from '../database/models/Comment';
import Task from '../database/models/Task';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class CommentService {
  async createComment(commentData: CommentCreationAttributes, userId: number): Promise<Comment> {
    try {
      // Verify task exists
      const task = await Task.findByPk(commentData.taskId);
      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      // If parent comment exists, verify it belongs to the same task
      if (commentData.parentId) {
        const parentComment = await CommentRepository.findById(commentData.parentId);
        if (!parentComment) {
          throw ApiError.notFound('Parent comment not found');
        }
        if (parentComment.taskId !== commentData.taskId) {
          throw ApiError.badRequest('Parent comment belongs to a different task');
        }
      }

      const comment = await CommentRepository.create({
        ...commentData,
        userId,
      });

      logger.info(`Comment created by user ${userId} on task ${commentData.taskId}: ${comment.id}`);

      return await CommentRepository.findById(comment.id, true) as Comment;
    } catch (error) {
      logger.error('Error in createComment service:', error);
      throw error;
    }
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const comment = await CommentRepository.findById(commentId, true);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    return comment;
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    // Verify task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return await CommentRepository.getTaskComments(taskId);
  }

  async updateComment(commentId: number, content: string, userId: number): Promise<Comment> {
    try {
      const comment = await CommentRepository.findById(commentId);

      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      // Only the comment author can update it
      if (comment.userId !== userId) {
        throw ApiError.forbidden('You can only update your own comments');
      }

      const updated = await CommentRepository.update(commentId, { content });

      return await CommentRepository.findById(commentId, true) as Comment;
    } catch (error) {
      logger.error('Error in updateComment service:', error);
      throw error;
    }
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    try {
      const comment = await CommentRepository.findById(commentId);

      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      // Only the comment author can delete it
      if (comment.userId !== userId) {
        throw ApiError.forbidden('You can only delete your own comments');
      }

      await CommentRepository.delete(commentId);
      logger.info(`Comment deleted by user ${userId}: ${commentId}`);
    } catch (error) {
      logger.error('Error in deleteComment service:', error);
      throw error;
    }
  }
}

export default new CommentService();
