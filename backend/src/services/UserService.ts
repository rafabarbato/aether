import UserRepository, { UserFilters } from '../database/repositories/UserRepository';
import User from '../database/models/User';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class UserService {
  async getUserById(userId: number): Promise<User> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async getAllUsers(filters: UserFilters): Promise<User[]> {
    return await UserRepository.findAll(filters);
  }

  async updateUser(userId: number, updates: any): Promise<User> {
    try {
      const user = await UserRepository.findById(userId);

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      return await UserRepository.update(userId, updates);
    } catch (error) {
      logger.error('Error in updateUser service:', error);
      throw error;
    }
  }
}

export default new UserService();
