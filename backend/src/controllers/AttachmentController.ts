import { Request, Response, NextFunction } from 'express';
import AttachmentService from '../services/AttachmentService';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import path from 'path';

class AttachmentController {
  async uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const file = req.file;

      if (!file) {
        throw ApiError.badRequest('No file uploaded');
      }

      const { taskId } = req.body;

      if (!taskId) {
        throw ApiError.badRequest('Task ID is required');
      }

      const attachment = await AttachmentService.createAttachment(
        {
          taskId: parseInt(taskId),
          userId,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          filePath: file.path,
        },
        userId
      );

      res.status(201).json({
        success: true,
        data: { attachment },
      });
    } catch (error) {
      logger.error('Error uploading attachment:', error);
      next(error);
    }
  }

  async getAttachmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachment = await AttachmentService.getAttachmentById(parseInt(req.params.id));

      res.status(200).json({
        success: true,
        data: { attachment },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskAttachments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId);
      const attachments = await AttachmentService.getTaskAttachments(taskId);

      res.status(200).json({
        success: true,
        data: { attachments },
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await AttachmentService.getAttachmentById(attachmentId);

      res.download(attachment.filePath, attachment.fileName, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const attachmentId = parseInt(req.params.id);

      await AttachmentService.deleteAttachment(attachmentId, userId);

      res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting attachment:', error);
      next(error);
    }
  }
}

export default new AttachmentController();
