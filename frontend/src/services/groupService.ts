import api from './api';
import { ApiResponse, Group } from '../types';

export interface GroupFilters {
  ownerId?: number;
  isActive?: boolean;
  search?: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: string;
  iconUrl?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  color?: string;
  iconUrl?: string;
  isActive?: boolean;
}

class GroupService {
  async getAllGroups(filters?: GroupFilters): Promise<Group[]> {
    const response = await api.get<ApiResponse<{ groups: Group[]; count: number }>>(
      '/groups',
      filters
    );
    return response.data.groups;
  }

  async getGroupsWithProjectCount(): Promise<Group[]> {
    const response = await api.get<ApiResponse<{ groups: Group[]; count: number }>>(
      '/groups/with-projects'
    );
    return response.data.groups;
  }

  async getGroupById(id: number): Promise<Group> {
    const response = await api.get<ApiResponse<{ group: Group }>>(`/groups/${id}`);
    return response.data.group;
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await api.post<ApiResponse<{ group: Group }>>('/groups', data);
    return response.data.group;
  }

  async updateGroup(id: number, data: UpdateGroupData): Promise<Group> {
    const response = await api.put<ApiResponse<{ group: Group }>>(`/groups/${id}`, data);
    return response.data.group;
  }

  async toggleGroupStatus(id: number): Promise<Group> {
    const response = await api.patch<ApiResponse<{ group: Group }>>(
      `/groups/${id}/toggle-status`
    );
    return response.data.group;
  }

  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/groups/${id}`);
  }
}

export default new GroupService();
