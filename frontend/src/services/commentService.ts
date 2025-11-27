import api from './api';
import { ApiResponse } from '../types';

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  replies?: Comment[];
}

export interface CreateCommentDto {
  taskId: number;
  content: string;
  parentId?: number;
}

export interface UpdateCommentDto {
  content: string;
}

class CommentService {
  async getTaskComments(taskId: number): Promise<Comment[]> {
    const response = await api.get<ApiResponse<{ comments: Comment[] }>>(
      `/comments/task/${taskId}`
    );
    return response.data.comments;
  }

  async getCommentById(id: number): Promise<Comment> {
    const response = await api.get<ApiResponse<{ comment: Comment }>>(
      `/comments/${id}`
    );
    return response.data.comment;
  }

  async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await api.post<ApiResponse<{ comment: Comment }>>(
      '/comments',
      data
    );
    return response.data.comment;
  }

  async updateComment(id: number, data: UpdateCommentDto): Promise<Comment> {
    const response = await api.put<ApiResponse<{ comment: Comment }>>(
      `/comments/${id}`,
      data
    );
    return response.data.comment;
  }

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/comments/${id}`);
  }
}

export default new CommentService();
