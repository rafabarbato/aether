import TaskRepository, { TaskFilters } from '../database/repositories/TaskRepository';
import Task, { TaskCreationAttributes } from '../database/models/Task';
import Project from '../database/models/Project';
import User from '../database/models/User';
import Group from '../database/models/Group';
import Milestone from '../database/models/Milestone';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class TaskService {
  async createTask(taskData: any, userId: number): Promise<Task> {
    try {
      // Verify project exists and user has access
      const project = await Project.findByPk(taskData.projectId);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Verify group exists if provided
      if (taskData.groupId) {
        const group = await Group.findByPk(taskData.groupId);
        if (!group) {
          throw ApiError.notFound('Group not found');
        }
      }

      // Verify milestone exists if provided
      if (taskData.milestoneId) {
        const milestone = await Milestone.findByPk(taskData.milestoneId);
        if (!milestone) {
          throw ApiError.notFound('Milestone not found');
        }
      }

      // Extract assignees array before creating task
      const assignees = taskData.assignees;
      delete taskData.assignees;

      // Set creator
      const task = await TaskRepository.create({
        ...taskData,
        createdBy: userId,
      });

      // Handle multiple assignees if provided
      if (assignees && Array.isArray(assignees) && assignees.length > 0) {
        const users = await User.findAll({
          where: { id: assignees },
        });

        if (users.length !== assignees.length) {
          throw ApiError.badRequest('One or more assigned users not found');
        }

        // Use Sequelize's association method to add assignees
        await (task as any).setAssignees(users);
      }

      // TODO: Send notification to assigned user if exists
      if (task.assignedTo || (assignees && assignees.length > 0)) {
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

  async updateTask(taskId: number, updates: any, userId: number): Promise<Task> {
    try {
      const task = await TaskRepository.findById(taskId);

      if (!task) {
        throw ApiError.notFound('Task not found');
      }

      // Verify group exists if provided
      if (updates.groupId) {
        const group = await Group.findByPk(updates.groupId);
        if (!group) {
          throw ApiError.notFound('Group not found');
        }
      }

      // Verify milestone exists if provided
      if (updates.milestoneId) {
        const milestone = await Milestone.findByPk(updates.milestoneId);
        if (!milestone) {
          throw ApiError.notFound('Milestone not found');
        }
      }

      // Check if status changed to done
      if (updates.status === 'done' && task.status !== 'done') {
        updates.completedAt = new Date();
      }

      // Extract assignees array before updating task
      const assignees = updates.assignees;
      delete updates.assignees;

      const updatedTask = await TaskRepository.update(taskId, updates);

      // Handle multiple assignees if provided
      if (assignees && Array.isArray(assignees)) {
        if (assignees.length > 0) {
          const users = await User.findAll({
            where: { id: assignees },
          });

          if (users.length !== assignees.length) {
            throw ApiError.badRequest('One or more assigned users not found');
          }

          // Use Sequelize's association method to update assignees
          await (updatedTask as any).setAssignees(users);
        } else {
          // Empty array means remove all assignees
          await (updatedTask as any).setAssignees([]);
        }
      }

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
