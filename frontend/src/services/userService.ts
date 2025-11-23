import api from './api';
import { User, ApiResponse } from '../types';

export interface UserFilters {
  role?: 'admin' | 'manager' | 'member';
  isActive?: boolean;
  search?: string;
}

class UserService {
  async getUsers(filters?: UserFilters): Promise<User[]> {
    const response = await api.get<ApiResponse<{ users: User[] }>>(
      '/users',
      filters
    );
    return response.data.users;
  }

  async getUserById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data.user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.user;
  }
}

export default new UserService();
