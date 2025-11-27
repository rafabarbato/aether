import ProjectRepository, { ProjectFilters } from '../database/repositories/ProjectRepository';
import Project, { ProjectCreationAttributes } from '../database/models/Project';
import Group from '../database/models/Group';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class ProjectService {
  // Helper to sanitize date fields (convert empty strings to null)
  private sanitizeDateFields(data: any): any {
    const sanitized = { ...data };
    if (sanitized.startDate === '' || sanitized.startDate === 'Invalid date') {
      sanitized.startDate = null;
    }
    if (sanitized.endDate === '' || sanitized.endDate === 'Invalid date') {
      sanitized.endDate = null;
    }
    return sanitized;
  }

  async createProject(projectData: ProjectCreationAttributes, userId: number): Promise<Project> {
    try {
      // Verify group exists if provided
      if (projectData.groupId) {
        const group = await Group.findByPk(projectData.groupId);
        if (!group) {
          throw ApiError.notFound('Group not found');
        }
      }

      // Sanitize date fields
      const sanitizedData = this.sanitizeDateFields(projectData);

      // Set owner to current user
      const project = await ProjectRepository.create({
        ...sanitizedData,
        ownerId: userId,
      });

      return await ProjectRepository.findById(project.id, true) as Project;
    } catch (error) {
      logger.error('Error in createProject service:', error);
      throw error;
    }
  }

  async getProjectById(projectId: number): Promise<Project> {
    const project = await ProjectRepository.findById(projectId, true);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  async getAllProjects(filters: ProjectFilters): Promise<Project[]> {
    return await ProjectRepository.findAll(filters, true);
  }

  async updateProject(projectId: number, updates: any, userId: number): Promise<Project> {
    try {
      const project = await ProjectRepository.findById(projectId);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Verify group exists if provided
      if (updates.groupId) {
        const group = await Group.findByPk(updates.groupId);
        if (!group) {
          throw ApiError.notFound('Group not found');
        }
      }

      // Sanitize date fields
      const sanitizedUpdates = this.sanitizeDateFields(updates);

      const updatedProject = await ProjectRepository.update(projectId, sanitizedUpdates);

      return await ProjectRepository.findById(projectId, true) as Project;
    } catch (error) {
      logger.error('Error in updateProject service:', error);
      throw error;
    }
  }

  async deleteProject(projectId: number, userId: number): Promise<void> {
    try {
      const project = await ProjectRepository.findById(projectId);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      await ProjectRepository.delete(projectId);
    } catch (error) {
      logger.error('Error in deleteProject service:', error);
      throw error;
    }
  }

  async updateProjectStatus(projectId: number, status: string): Promise<Project> {
    return await ProjectRepository.updateStatus(projectId, status as any);
  }

  async getProjectsByGroup(groupId: number): Promise<Project[]> {
    return await ProjectRepository.getProjectsByGroup(groupId);
  }
}

export default new ProjectService();
