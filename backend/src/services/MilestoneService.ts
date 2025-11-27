import MilestoneRepository, { MilestoneFilters } from '../database/repositories/MilestoneRepository';
import Milestone, { MilestoneCreationAttributes } from '../database/models/Milestone';
import Project from '../database/models/Project';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

class MilestoneService {
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

  async createMilestone(milestoneData: MilestoneCreationAttributes, userId: number): Promise<Milestone> {
    try {
      // Verify project exists and user has access
      const project = await Project.findByPk(milestoneData.projectId);

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Sanitize date fields
      const sanitizedData = this.sanitizeDateFields(milestoneData);

      // Set creator
      const milestone = await MilestoneRepository.create({
        ...sanitizedData,
        createdBy: userId,
      });

      logger.info(`Milestone created by user ${userId}: ${milestone.id}`);

      return await MilestoneRepository.findById(milestone.id, true) as Milestone;
    } catch (error) {
      logger.error('Error in createMilestone service:', error);
      throw error;
    }
  }

  async getMilestoneById(milestoneId: number): Promise<Milestone> {
    const milestone = await MilestoneRepository.findById(milestoneId, true);

    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }

    return milestone;
  }

  async getAllMilestones(filters: MilestoneFilters): Promise<Milestone[]> {
    return await MilestoneRepository.findAll(filters, true);
  }

  async getMilestonesByProject(projectId: number, type?: 'milestone' | 'sprint'): Promise<Milestone[]> {
    return await MilestoneRepository.getMilestonesByProject(projectId, type);
  }

  async getMilestoneStats(milestoneId: number): Promise<any> {
    return await MilestoneRepository.getMilestoneStats(milestoneId);
  }

  async updateMilestone(milestoneId: number, updates: Partial<MilestoneCreationAttributes>, userId: number): Promise<Milestone> {
    try {
      const milestone = await MilestoneRepository.findById(milestoneId);

      if (!milestone) {
        throw ApiError.notFound('Milestone not found');
      }

      // Verify project exists
      const project = await Project.findByPk(milestone.projectId);
      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Sanitize date fields
      const sanitizedUpdates = this.sanitizeDateFields(updates);

      const updatedMilestone = await MilestoneRepository.update(milestoneId, sanitizedUpdates);

      return await MilestoneRepository.findById(milestoneId, true) as Milestone;
    } catch (error) {
      logger.error('Error in updateMilestone service:', error);
      throw error;
    }
  }

  async deleteMilestone(milestoneId: number, userId: number): Promise<void> {
    try {
      const milestone = await MilestoneRepository.findById(milestoneId);

      if (!milestone) {
        throw ApiError.notFound('Milestone not found');
      }

      // Verify project exists
      const project = await Project.findByPk(milestone.projectId);
      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      await MilestoneRepository.delete(milestoneId);
      logger.info(`Milestone deleted by user ${userId}: ${milestoneId}`);
    } catch (error) {
      logger.error('Error in deleteMilestone service:', error);
      throw error;
    }
  }

  async updateMilestoneStatus(milestoneId: number, status: string, userId: number): Promise<Milestone> {
    return await this.updateMilestone(milestoneId, { status: status as any }, userId);
  }
}

export default new MilestoneService();
