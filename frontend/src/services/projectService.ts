import api from './api';
import { Project, ApiResponse } from '../types';

export interface ProjectFilters {
  groupId?: number;
  ownerId?: number;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived' | string[];
  search?: string;
}

export interface CreateProjectDto {
  groupId?: number;
  name: string;
  description?: string;
  color?: string;
  teamId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
}

export interface UpdateProjectDto {
  groupId?: number;
  name?: string;
  description?: string;
  color?: string;
  teamId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
}

class ProjectService {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const response = await api.get<ApiResponse<{ projects: Project[] }>>(
      '/projects',
      filters
    );
    return response.data.projects;
  }

  async getProjectById(id: number): Promise<Project> {
    const response = await api.get<ApiResponse<{ project: Project }>>(`/projects/${id}`);
    return response.data.project;
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<ApiResponse<{ project: Project }>>('/projects', data);
    return response.data.project;
  }

  async updateProject(id: number, data: UpdateProjectDto): Promise<Project> {
    const response = await api.put<ApiResponse<{ project: Project }>>(
      `/projects/${id}`,
      data
    );
    return response.data.project;
  }

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  async updateProjectStatus(id: number, status: string): Promise<Project> {
    const response = await api.patch<ApiResponse<{ project: Project }>>(
      `/projects/${id}/status`,
      { status }
    );
    return response.data.project;
  }

  async getProjectsByGroup(groupId: number): Promise<Project[]> {
    const response = await api.get<ApiResponse<{ projects: Project[] }>>(
      `/projects/group/${groupId}`
    );
    return response.data.projects;
  }
}

export default new ProjectService();
