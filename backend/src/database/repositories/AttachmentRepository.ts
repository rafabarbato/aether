import Attachment, { AttachmentCreationAttributes } from '../models/Attachment';
import User from '../models/User';

export interface AttachmentFilters {
  taskId?: number;
  userId?: number;
}

class AttachmentRepository {
  async create(attachmentData: AttachmentCreationAttributes): Promise<Attachment> {
    return await Attachment.create(attachmentData);
  }

  async findById(id: number, includeUser: boolean = false): Promise<Attachment | null> {
    const options: any = {
      where: { id },
    };

    if (includeUser) {
      options.include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
        },
      ];
    }

    return await Attachment.findOne(options);
  }

  async findAll(filters: AttachmentFilters = {}, includeUser: boolean = false): Promise<Attachment[]> {
    const where: any = {};

    if (filters.taskId !== undefined) {
      where.taskId = filters.taskId;
    }

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    const options: any = {
      where,
      order: [['createdAt', 'DESC']],
    };

    if (includeUser) {
      options.include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
        },
      ];
    }

    return await Attachment.findAll(options);
  }

  async getTaskAttachments(taskId: number): Promise<Attachment[]> {
    return await Attachment.findAll({
      where: { taskId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async delete(id: number): Promise<boolean> {
    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      return false;
    }

    await attachment.destroy();
    return true;
  }

  async count(filters: AttachmentFilters = {}): Promise<number> {
    const where: any = {};

    if (filters.taskId !== undefined) {
      where.taskId = filters.taskId;
    }

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    return await Attachment.count({ where });
  }
}

export default new AttachmentRepository();
