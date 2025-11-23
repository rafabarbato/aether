import { Op } from 'sequelize';
import Project, { ProjectAttributes, ProjectCreationAttributes } from '../models/Project';
import User from '../models/User';
import Group from '../models/Group';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';

export interface ProjectFilters {
  groupId?: number;
  ownerId?: number;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived' | string[];
  search?: string;
}

class ProjectRepository {
  async create(projectData: ProjectCreationAttributes): Promise<Project> {
    try {
      const project = await Project.create(projectData);
      logger.info(`Project created: ${project.id}`);
      return project;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  async findById(id: number, includeRelations = false): Promise<Project | null> {
    try {
      const options: any = {
        where: { id },
      };

      if (includeRelations) {
        options.include = [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description', 'color', 'iconUrl'],
          },
        ];
      }

      return await Project.findOne(options);
    } catch (error) {
      logger.error(`Error finding project ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters: ProjectFilters = {}, includeRelations = false): Promise<Project[]> {
    try {
      const where: any = {};

      if (filters.groupId) {
        where.groupId = filters.groupId;
      }

      if (filters.ownerId) {
        where.ownerId = filters.ownerId;
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          where.status = { [Op.in]: filters.status };
        } else {
          where.status = filters.status;
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      const options: any = {
        where,
        order: [['createdAt', 'DESC']],
      };

      if (includeRelations) {
        options.include = [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'photoUrl'],
          },
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description', 'color', 'iconUrl'],
          },
        ];
      }

      return await Project.findAll(options);
    } catch (error) {
      logger.error('Error finding projects:', error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<ProjectAttributes>): Promise<Project> {
    try {
      const project = await this.findById(id);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      await project.update(updates);
      logger.info(`Project updated: ${project.id}`);

      return project;
    } catch (error) {
      logger.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const project = await this.findById(id);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      await project.destroy();
      logger.info(`Project deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  async getProjectsByGroup(groupId: number): Promise<Project[]> {
    try {
      return await this.findAll({ groupId }, true);
    } catch (error) {
      logger.error(`Error getting projects for group ${groupId}:`, error);
      throw error;
    }
  }

  async updateStatus(id: number, status: ProjectAttributes['status']): Promise<Project> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      logger.error(`Error updating project status ${id}:`, error);
      throw error;
    }
  }
}

export default new ProjectRepository();
