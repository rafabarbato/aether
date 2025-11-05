import { Response } from 'express';
import MilestoneService from '../services/MilestoneService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class MilestoneController {
  createMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const milestone = await MilestoneService.createMilestone(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: { milestone },
    });
  });

  getMilestoneById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const milestone = await MilestoneService.getMilestoneById(parseInt(id));

    res.json({
      success: true,
      data: { milestone },
    });
  });

  getAllMilestones = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined,
      type: req.query.type as 'milestone' | 'sprint' | undefined,
      status: req.query.status as string | string[],
      createdBy: req.query.createdBy ? parseInt(req.query.createdBy as string) : undefined,
      search: req.query.search as string,
    };

    const milestones = await MilestoneService.getAllMilestones(filters);

    res.json({
      success: true,
      data: { milestones, count: milestones.length },
    });
  });

  getMilestonesByProject = catchAsync(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { type } = req.query;

    const milestones = await MilestoneService.getMilestonesByProject(
      parseInt(projectId),
      type as 'milestone' | 'sprint' | undefined
    );

    res.json({
      success: true,
      data: { milestones, count: milestones.length },
    });
  });

  getMilestoneStats = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const stats = await MilestoneService.getMilestoneStats(parseInt(id));

    res.json({
      success: true,
      data: { stats },
    });
  });

  updateMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const milestone = await MilestoneService.updateMilestone(parseInt(id), req.body, req.userId);

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: { milestone },
    });
  });

  deleteMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    await MilestoneService.deleteMilestone(parseInt(id), req.userId);

    res.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  });

  updateMilestoneStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const milestone = await MilestoneService.updateMilestoneStatus(parseInt(id), status, req.userId);

    res.json({
      success: true,
      message: 'Milestone status updated successfully',
      data: { milestone },
    });
  });
}

export default new MilestoneController();
