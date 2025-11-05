import GroupRepository, { GroupFilters } from '../database/repositories/GroupRepository';
import Group, { GroupCreationAttributes } from '../database/models/Group';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class GroupService {
  async createGroup(groupData: GroupCreationAttributes, userId: number): Promise<Group> {
    try {
      // Set owner
      const group = await GroupRepository.create({
        ...groupData,
        ownerId: userId,
      });

      logger.info(`Group created by user ${userId}: ${group.id}`);

      return await GroupRepository.findById(group.id, true) as Group;
    } catch (error) {
      logger.error('Error in createGroup service:', error);
      throw error;
    }
  }

  async getGroupById(groupId: number): Promise<Group> {
    const group = await GroupRepository.findById(groupId, true);

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    return group;
  }

  async getAllGroups(filters: GroupFilters): Promise<Group[]> {
    return await GroupRepository.findAll(filters, true);
  }

  async getGroupsWithProjectCount(): Promise<any[]> {
    return await GroupRepository.getGroupsWithProjectCount();
  }

  async updateGroup(groupId: number, updates: Partial<GroupCreationAttributes>, userId: number): Promise<Group> {
    try {
      const group = await GroupRepository.findById(groupId);

      if (!group) {
        throw ApiError.notFound('Group not found');
      }

      // Check if user has permission to update (owner only)
      if (group.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to update this group');
      }

      const updatedGroup = await GroupRepository.update(groupId, updates);

      return await GroupRepository.findById(groupId, true) as Group;
    } catch (error) {
      logger.error('Error in updateGroup service:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: number, userId: number): Promise<void> {
    try {
      const group = await GroupRepository.findById(groupId);

      if (!group) {
        throw ApiError.notFound('Group not found');
      }

      // Check if user has permission to delete (owner only)
      if (group.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to delete this group');
      }

      await GroupRepository.delete(groupId);
      logger.info(`Group deleted by user ${userId}: ${groupId}`);
    } catch (error) {
      logger.error('Error in deleteGroup service:', error);
      throw error;
    }
  }

  async toggleGroupStatus(groupId: number, userId: number): Promise<Group> {
    try {
      const group = await GroupRepository.findById(groupId);

      if (!group) {
        throw ApiError.notFound('Group not found');
      }

      // Check if user has permission (owner only)
      if (group.ownerId !== userId) {
        throw ApiError.forbidden('You do not have permission to update this group');
      }

      return await GroupRepository.update(groupId, { isActive: !group.isActive });
    } catch (error) {
      logger.error('Error in toggleGroupStatus service:', error);
      throw error;
    }
  }
}

export default new GroupService();
