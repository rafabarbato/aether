import api from './api';
import { Task, ApiResponse } from '../types';

export interface TaskFilters {
  projectId?: number;
  status?: string | string[];
  priority?: string | string[];
  assignedTo?: number;
  search?: string;
}

export interface CreateTaskDto {
  projectId: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tagLabel?: string;
  assignedTo?: number;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  tagLabel?: string;
  assignedTo?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const response = await api.get<ApiResponse<{ tasks: Task[] }>>(
      '/tasks',
      filters
    );
    return response.data.tasks;
  }

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data.task;
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
    return response.data.task;
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    const response = await api.put<ApiResponse<{ task: Task }>>(
      `/tasks/${id}`,
      data
    );
    return response.data.task;
  }

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  async updateTaskStatus(id: number, status: string): Promise<Task> {
    const response = await api.patch<ApiResponse<{ task: Task }>>(
      `/tasks/${id}/status`,
      { status }
    );
    return response.data.task;
  }

  async updateTaskPosition(id: number, position: number): Promise<Task> {
    const response = await api.patch<ApiResponse<{ task: Task }>>(
      `/tasks/${id}/position`,
      { position }
    );
    return response.data.task;
  }

  async getProjectTasks(projectId: number, status?: string): Promise<Task[]> {
    const response = await api.get<ApiResponse<{ tasks: Task[] }>>(
      `/tasks/project/${projectId}`,
      status ? { status } : undefined
    );
    return response.data.tasks;
  }
}

export default new TaskService();
