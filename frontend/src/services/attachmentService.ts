import api from './api';
import { ApiResponse } from '../types';

export interface Attachment {
  id: number;
  taskId: number;
  userId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
}

class AttachmentService {
  async getTaskAttachments(taskId: number): Promise<Attachment[]> {
    const response = await api.get<ApiResponse<{ attachments: Attachment[] }>>(
      `/attachments/task/${taskId}`
    );
    return response.data.attachments;
  }

  async getAttachmentById(id: number): Promise<Attachment> {
    const response = await api.get<ApiResponse<{ attachment: Attachment }>>(
      `/attachments/${id}`
    );
    return response.data.attachment;
  }

  async uploadAttachment(taskId: number, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId.toString());

    const response = await api.post<ApiResponse<{ attachment: Attachment }>>(
      '/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.attachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await api.delete(`/attachments/${id}`);
  }

  getDownloadUrl(id: number): string {
    return `${api.defaults.baseURL}/attachments/${id}/download`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    return '📎';
  }
}

export default new AttachmentService();
