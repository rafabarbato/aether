import api from './api';
import { ApiResponse, Milestone, MilestoneType, MilestoneStatus } from '../types';

export interface MilestoneFilters {
  projectId?: number;
  type?: MilestoneType;
  status?: MilestoneStatus | MilestoneStatus[];
  createdBy?: number;
  search?: string;
}

export interface CreateMilestoneData {
  projectId: number;
  name: string;
  description?: string;
  type?: MilestoneType;
  status?: MilestoneStatus;
  startDate?: string;
  endDate?: string;
  iconUrl?: string;
}

export interface UpdateMilestoneData {
  name?: string;
  description?: string;
  type?: MilestoneType;
  status?: MilestoneStatus;
  startDate?: string;
  endDate?: string;
  iconUrl?: string;
}

export interface MilestoneStats {
  totalTasks: number;
  ready: number;
  inProgress: number;
  inReview: number;
  done: number;
  completionPercentage: number;
}

class MilestoneService {
  async getAllMilestones(filters?: MilestoneFilters): Promise<Milestone[]> {
    const response = await api.get<ApiResponse<{ milestones: Milestone[]; count: number }>>(
      '/milestones',
      filters
    );
    return response.data.milestones;
  }

  async getMilestonesByProject(
    projectId: number,
    type?: MilestoneType
  ): Promise<Milestone[]> {
    const response = await api.get<ApiResponse<{ milestones: Milestone[]; count: number }>>(
      `/milestones/project/${projectId}`,
      type ? { type } : undefined
    );
    return response.data.milestones;
  }

  async getMilestoneById(id: number): Promise<Milestone> {
    const response = await api.get<ApiResponse<{ milestone: Milestone }>>(`/milestones/${id}`);
    return response.data.milestone;
  }

  async getMilestoneStats(id: number): Promise<MilestoneStats> {
    const response = await api.get<ApiResponse<{ stats: MilestoneStats }>>(
      `/milestones/${id}/stats`
    );
    return response.data.stats;
  }

  async createMilestone(data: CreateMilestoneData): Promise<Milestone> {
    const response = await api.post<ApiResponse<{ milestone: Milestone }>>('/milestones', data);
    return response.data.milestone;
  }

  async updateMilestone(id: number, data: UpdateMilestoneData): Promise<Milestone> {
    const response = await api.put<ApiResponse<{ milestone: Milestone }>>(
      `/milestones/${id}`,
      data
    );
    return response.data.milestone;
  }

  async updateMilestoneStatus(id: number, status: MilestoneStatus): Promise<Milestone> {
    const response = await api.patch<ApiResponse<{ milestone: Milestone }>>(
      `/milestones/${id}/status`,
      { status }
    );
    return response.data.milestone;
  }

  async deleteMilestone(id: number): Promise<void> {
    await api.delete(`/milestones/${id}`);
  }
}

export default new MilestoneService();
