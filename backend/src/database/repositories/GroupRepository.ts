import { Op } from 'sequelize';
import Group, { GroupAttributes, GroupCreationAttributes } from '../models/Group';
import User from '../models/User';
import Project from '../models/Project';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';

export interface GroupFilters {
  ownerId?: number;
  isActive?: boolean;
  search?: string;
}

class GroupRepository {
  async create(groupData: GroupCreationAttributes): Promise<Group> {
    try {
      const group = await Group.create(groupData);
      logger.info(`Group created: ${group.id}`);
      return group;
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async findById(id: number, includeRelations = false): Promise<Group | null> {
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
            model: Project,
            as: 'projects',
          },
        ];
      }

      return await Group.findOne(options);
    } catch (error) {
      logger.error(`Error finding group ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters: GroupFilters = {}, includeRelations = false): Promise<Group[]> {
    try {
      const where: any = {};

      if (filters.ownerId) {
        where.ownerId = filters.ownerId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
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
            model: Project,
            as: 'projects',
          },
        ];
      }

      return await Group.findAll(options);
    } catch (error) {
      logger.error('Error finding groups:', error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<GroupAttributes>): Promise<Group> {
    try {
      const group = await this.findById(id);

      if (!group) {
        throw ApiError.notFound('Group not found');
      }

      await group.update(updates);
      logger.info(`Group updated: ${group.id}`);

      return group;
    } catch (error) {
      logger.error(`Error updating group ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const group = await this.findById(id);

      if (!group) {
        throw ApiError.notFound('Group not found');
      }

      await group.destroy();
      logger.info(`Group deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting group ${id}:`, error);
      throw error;
    }
  }

  async getGroupsWithProjectCount(): Promise<any[]> {
    try {
      const groups = await this.findAll({}, true);

      return groups.map((group: any) => ({
        ...group.get({ plain: true }),
        projectCount: group.projects?.length || 0,
      }));
    } catch (error) {
      logger.error('Error getting groups with project count:', error);
      throw error;
    }
  }
}

export default new GroupRepository();
