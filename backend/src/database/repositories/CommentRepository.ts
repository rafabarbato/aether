import Comment, { CommentCreationAttributes } from '../models/Comment';
import User from '../models/User';
import { Op } from 'sequelize';

export interface CommentFilters {
  taskId?: number;
  userId?: number;
  parentId?: number | null;
}

class CommentRepository {
  async create(commentData: CommentCreationAttributes): Promise<Comment> {
    return await Comment.create(commentData);
  }

  async findById(id: number, includeUser: boolean = false): Promise<Comment | null> {
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

    return await Comment.findOne(options);
  }

  async findAll(filters: CommentFilters = {}, includeUser: boolean = false): Promise<Comment[]> {
    const where: any = {};

    if (filters.taskId !== undefined) {
      where.taskId = filters.taskId;
    }

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    const options: any = {
      where,
      order: [['createdAt', 'ASC']],
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

    return await Comment.findAll(options);
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    return await Comment.findAll({
      where: {
        taskId,
        parentId: { [Op.is]: null } as any
      } as any, // Get top-level comments only
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
            },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC'],
      ],
    });
  }

  async update(id: number, updates: Partial<CommentCreationAttributes>): Promise<Comment | null> {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return null;
    }

    await comment.update(updates);
    return comment;
  }

  async delete(id: number): Promise<boolean> {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return false;
    }

    await comment.destroy();
    return true;
  }

  async count(filters: CommentFilters = {}): Promise<number> {
    const where: any = {};

    if (filters.taskId !== undefined) {
      where.taskId = filters.taskId;
    }

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    return await Comment.count({ where });
  }
}

export default new CommentRepository();
