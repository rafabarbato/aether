import AttachmentRepository, { AttachmentFilters } from '../database/repositories/AttachmentRepository';
import Attachment, { AttachmentCreationAttributes } from '../database/models/Attachment';
import Task from '../database/models/Task';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

class AttachmentService {
  async createAttachment(attachmentData: AttachmentCreationAttributes, userId: number): Promise<Attachment> {
    try {
      // Verify task exists
      const task = await Task.findByPk(attachmentData.taskId);
      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      const attachment = await AttachmentRepository.create({
        ...attachmentData,
        userId,
      });

      logger.info(`Attachment created by user ${userId} on task ${attachmentData.taskId}: ${attachment.id}`);

      return await AttachmentRepository.findById(attachment.id, true) as Attachment;
    } catch (error) {
      logger.error('Error in createAttachment service:', error);
      throw error;
    }
  }

  async getAttachmentById(attachmentId: number): Promise<Attachment> {
    const attachment = await AttachmentRepository.findById(attachmentId, true);

    if (!attachment) {
      throw ApiError.notFound('Attachment not found');
    }

    return attachment;
  }

  async getTaskAttachments(taskId: number): Promise<Attachment[]> {
    // Verify task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return await AttachmentRepository.getTaskAttachments(taskId);
  }

  async deleteAttachment(attachmentId: number, userId: number): Promise<void> {
    try {
      const attachment = await AttachmentRepository.findById(attachmentId);

      if (!attachment) {
        throw ApiError.notFound('Attachment not found');
      }

      // Only the attachment owner can delete it
      if (attachment.userId !== userId) {
        throw ApiError.forbidden('You can only delete your own attachments');
      }

      // Delete file from filesystem
      try {
        await fs.unlink(attachment.filePath);
      } catch (fileError) {
        logger.warn(`Failed to delete file: ${attachment.filePath}`, fileError);
        // Continue with database deletion even if file deletion fails
      }

      await AttachmentRepository.delete(attachmentId);
      logger.info(`Attachment deleted by user ${userId}: ${attachmentId}`);
    } catch (error) {
      logger.error('Error in deleteAttachment service:', error);
      throw error;
    }
  }

  async getAttachmentFilePath(attachmentId: number): Promise<string> {
    const attachment = await AttachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw ApiError.notFound('Attachment not found');
    }

    return attachment.filePath;
  }
}

export default new AttachmentService();
