import { Op } from 'sequelize';
import User, { UserAttributes, UserCreationAttributes } from '../models/User';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';

export interface UserFilters {
  role?: 'admin' | 'manager' | 'member';
  isActive?: boolean;
  search?: string;
}

class UserRepository {
  async findById(id: number): Promise<User | null> {
    try {
      return await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });
    } catch (error) {
      logger.error(`Error finding user ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters: UserFilters = {}): Promise<User[]> {
    try {
      const where: any = {};

      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
          { username: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      return await User.findAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      });
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<UserAttributes>): Promise<User> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      await user.update(updates);
      logger.info(`User updated: ${user.id}`);

      return user;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }
}

export default new UserRepository();
