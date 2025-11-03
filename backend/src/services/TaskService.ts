import TaskRepository, { TaskFilters } from '../database/repositories/TaskRepository';
import Task, { TaskCreationAttributes } from '../database/models/Task';
import Project from '../database/models/Project';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class TaskService {
  async createTask(taskData: TaskCreationAttributes, userId: number): Promise<Task> {
    try {
      // Verify project exists and user has access
      const project = await Project.findByPk(taskData.projectId);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Set creator
      const task = await TaskRepository.create({
        ...taskData,
        createdBy: userId,
      });

      // TODO: Send notification to assigned user if exists
      if (task.assignedTo) {
        // WebSocket notification will be handled later
      }

      return await TaskRepository.findById(task.id, true) as Task;
    } catch (error) {
      logger.error('Error in createTask service:', error);
      throw error;
    }
  }

  async getTaskById(taskId: number): Promise<Task> {
    const task = await TaskRepository.findById(taskId, true);

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  async getAllTasks(filters: TaskFilters): Promise<Task[]> {
    return await TaskRepository.findAll(filters, true);
  }

  async updateTask(taskId: number, updates: Partial<TaskCreationAttributes>, userId: number): Promise<Task> {
    try {
      const task = await TaskRepository.findById(taskId);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      // Check if status changed to done
      if (updates.status === 'done' && task.status !== 'done') {
        updates.completedAt = new Date();
      }

      const updatedTask = await TaskRepository.update(taskId, updates);

      // TODO: Send notification for task updates
      if (updates.assignedTo && updates.assignedTo !== task.assignedTo) {
        // Notify new assignee
      }

      return await TaskRepository.findById(taskId, true) as Task;
    } catch (error) {
      logger.error('Error in updateTask service:', error);
      throw error;
    }
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    try {
      const task = await TaskRepository.findById(taskId);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      // Check if user has permission to delete
      const project = await Project.findByPk(task.projectId);
      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      await TaskRepository.delete(taskId);
    } catch (error) {
      logger.error('Error in deleteTask service:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: number, status: string, userId: number): Promise<Task> {
    return await this.updateTask(taskId, { status: status as any }, userId);
  }

  async updateTaskPosition(taskId: number, newPosition: number): Promise<Task> {
    return await TaskRepository.updatePosition(taskId, newPosition);
  }

  async getTasksByProject(projectId: number, status?: string): Promise<Task[]> {
    return await TaskRepository.getTasksByProject(projectId, status);
  }

  async getUserTaskStats(userId: number): Promise<any> {
    return await TaskRepository.getTaskStatsByUser(userId);
  }
}

export default new TaskService();
