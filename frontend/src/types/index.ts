export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  role: 'admin' | 'manager' | 'member';
  isActive: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
  ownerId: number;
  teamId?: number;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  owner?: User;
}

export type TaskStatus = 'ready' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tagLabel?: string;
  assignedTo?: number;
  createdBy: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
  creator?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  parentId?: number;
  author?: User;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  taskId: number;
  userId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploader?: User;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
