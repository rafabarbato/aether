import { Op } from 'sequelize';
import Milestone, { MilestoneAttributes, MilestoneCreationAttributes } from '../models/Milestone';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';

export interface MilestoneFilters {
  projectId?: number;
  type?: 'milestone' | 'sprint';
  status?: string | string[];
  createdBy?: number;
  search?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
}

class MilestoneRepository {
  async create(milestoneData: MilestoneCreationAttributes): Promise<Milestone> {
    try {
      const milestone = await Milestone.create(milestoneData);
      logger.info(`Milestone created: ${milestone.id}`);
      return milestone;
    } catch (error) {
      logger.error('Error creating milestone:', error);
      throw error;
    }
  }

  async findById(id: number, includeRelations = false): Promise<Milestone | null> {
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
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: Task,
            as: 'tasks',
          },
        ];
      }

      return await Milestone.findOne(options);
    } catch (error) {
      logger.error(`Error finding milestone ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters: MilestoneFilters = {}, includeRelations = false): Promise<Milestone[]> {
    try {
      const where: any = {};

      if (filters.projectId) {
        where.projectId = filters.projectId;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = Array.isArray(filters.status)
          ? { [Op.in]: filters.status }
          : filters.status;
      }

      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      if (filters.search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      if (filters.startDateFrom || filters.startDateTo) {
        where.startDate = {};
        if (filters.startDateFrom) {
          where.startDate[Op.gte] = filters.startDateFrom;
        }
        if (filters.startDateTo) {
          where.startDate[Op.lte] = filters.startDateTo;
        }
      }

      if (filters.endDateFrom || filters.endDateTo) {
        where.endDate = {};
        if (filters.endDateFrom) {
          where.endDate[Op.gte] = filters.endDateFrom;
        }
        if (filters.endDateTo) {
          where.endDate[Op.lte] = filters.endDateTo;
        }
      }

      const options: any = {
        where,
        order: [
          ['startDate', 'ASC'],
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
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: Task,
            as: 'tasks',
          },
        ];
      }

      return await Milestone.findAll(options);
    } catch (error) {
      logger.error('Error finding milestones:', error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<MilestoneAttributes>): Promise<Milestone> {
    try {
      const milestone = await this.findById(id);

      if (!milestone) {
        throw ApiError.notFound('Milestone not found');
      }

      await milestone.update(updates);
      logger.info(`Milestone updated: ${milestone.id}`);

      return milestone;
    } catch (error) {
      logger.error(`Error updating milestone ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const milestone = await this.findById(id);

      if (!milestone) {
        throw ApiError.notFound('Milestone not found');
      }

      await milestone.destroy();
      logger.info(`Milestone deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting milestone ${id}:`, error);
      throw error;
    }
  }

  async getMilestonesByProject(projectId: number, type?: 'milestone' | 'sprint'): Promise<Milestone[]> {
    const filters: MilestoneFilters = { projectId };
    if (type) {
      filters.type = type;
    }
    return this.findAll(filters, true);
  }

  async getMilestoneStats(id: number): Promise<any> {
    try {
      const milestone = await this.findById(id, true);

      if (!milestone) {
        throw ApiError.notFound('Milestone not found');
      }

      const tasks = (milestone as any).tasks || [];

      const stats = {
        totalTasks: tasks.length,
        ready: tasks.filter((t: Task) => t.status === 'ready').length,
        inProgress: tasks.filter((t: Task) => t.status === 'in_progress').length,
        inReview: tasks.filter((t: Task) => t.status === 'in_review').length,
        done: tasks.filter((t: Task) => t.status === 'done').length,
        completionPercentage: tasks.length > 0
          ? Math.round((tasks.filter((t: Task) => t.status === 'done').length / tasks.length) * 100)
          : 0,
      };

      return stats;
    } catch (error) {
      logger.error(`Error getting milestone stats for ${id}:`, error);
      throw error;
    }
  }
}

export default new MilestoneRepository();
