import { Op, WhereOptions } from 'sequelize';
import Task, { TaskAttributes, TaskCreationAttributes } from '../models/Task';
import User from '../models/User';
import Project from '../models/Project';
import Group from '../models/Group';
import Milestone from '../models/Milestone';
import Comment from '../models/Comment';
import Attachment from '../models/Attachment';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';

export interface TaskFilters {
  projectId?: number;
  groupId?: number;
  milestoneId?: number;
  status?: string | string[];
  priority?: string | string[];
  assignedTo?: number | number[];
  createdBy?: number;
  search?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface TaskWithRelations extends Task {
  project?: Project;
  assignee?: User;
  creator?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

class TaskRepository {
  async create(taskData: TaskCreationAttributes): Promise<Task> {
    try {
      const task = await Task.create(taskData);
      logger.info(`Task created: ${task.id}`);
      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  async findById(id: number, includeRelations = false): Promise<Task | null> {
    try {
      const options: any = {
        where: { id },
      };

      if (includeRelations) {
        options.include = [
          {
            model: Project,
            as: 'project',
          },
          {
            model: Group,
            as: 'group',
          },
          {
            model: Milestone,
            as: 'milestone',
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: User,
            as: 'assignees',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
            through: { attributes: [] }, // Exclude junction table attributes
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
              },
            ],
          },
          {
            model: Attachment,
            as: 'attachments',
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['id', 'username', 'firstName', 'lastName'],
              },
            ],
          },
        ];
      }

      return await Task.findOne(options);
    } catch (error) {
      logger.error(`Error finding task ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters: TaskFilters = {}, includeRelations = false): Promise<Task[]> {
    try {
      const where: any = {};

      if (filters.projectId) {
        where.projectId = filters.projectId;
      }

      if (filters.groupId) {
        where.groupId = filters.groupId;
      }

      if (filters.milestoneId) {
        where.milestoneId = filters.milestoneId;
      }

      if (filters.status) {
        where.status = Array.isArray(filters.status)
          ? { [Op.in]: filters.status }
          : filters.status;
      }

      if (filters.priority) {
        where.priority = Array.isArray(filters.priority)
          ? { [Op.in]: filters.priority }
          : filters.priority;
      }

      if (filters.assignedTo) {
        where.assignedTo = Array.isArray(filters.assignedTo)
          ? { [Op.in]: filters.assignedTo }
          : filters.assignedTo;
      }

      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      if (filters.dueDateFrom || filters.dueDateTo) {
        where.dueDate = {};
        if (filters.dueDateFrom) {
          where.dueDate[Op.gte] = filters.dueDateFrom;
        }
        if (filters.dueDateTo) {
          where.dueDate[Op.lte] = filters.dueDateTo;
        }
      }

      const options: any = {
        where,
        order: [
          ['position', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      };

      if (includeRelations) {
        options.include = [
          {
            model: Project,
            as: 'project',
          },
          {
            model: Group,
            as: 'group',
          },
          {
            model: Milestone,
            as: 'milestone',
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: User,
            as: 'assignees',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
            through: { attributes: [] }, // Exclude junction table attributes
          },
        ];
      }

      return await Task.findAll(options);
    } catch (error) {
      logger.error('Error finding tasks:', error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<TaskAttributes>): Promise<Task> {
    try {
      const task = await this.findById(id);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      await task.update(updates);
      logger.info(`Task updated: ${task.id}`);

      return task;
    } catch (error) {
      logger.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const task = await this.findById(id);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      await task.destroy();
      logger.info(`Task deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  async updatePosition(id: number, newPosition: number): Promise<Task> {
    try {
      const task = await this.findById(id);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      task.position = newPosition;
      await task.save();

      return task;
    } catch (error) {
      logger.error(`Error updating task position ${id}:`, error);
      throw error;
    }
  }

  async getTasksByProject(projectId: number, status?: string): Promise<Task[]> {
    const filters: TaskFilters = { projectId };
    if (status) {
      filters.status = status;
    }
    return this.findAll(filters, true);
  }

  async getTaskStatsByUser(userId: number): Promise<any> {
    try {
      const tasks = await this.findAll({ assignedTo: userId });

      const stats = {
        total: tasks.length,
        ready: tasks.filter((t) => t.status === 'ready').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        inReview: tasks.filter((t) => t.status === 'in_review').length,
        done: tasks.filter((t) => t.status === 'done').length,
        overdue: tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
        ).length,
      };

      return stats;
    } catch (error) {
      logger.error(`Error getting task stats for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new TaskRepository();
