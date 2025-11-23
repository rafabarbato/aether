import { Response } from 'express';
import ProjectService from '../services/ProjectService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class ProjectController {
  createProject = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const project = await ProjectService.createProject(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  });

  getProjectById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(parseInt(id));

    res.json({
      success: true,
      data: { project },
    });
  });

  getAllProjects = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      ownerId: req.query.ownerId ? parseInt(req.query.ownerId as string) : undefined,
      status: req.query.status as string | string[],
      search: req.query.search as string,
    };

    const projects = await ProjectService.getAllProjects(filters);

    res.json({
      success: true,
      data: { projects, count: projects.length },
    });
  });

  updateProject = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const project = await ProjectService.updateProject(parseInt(id), req.body, req.userId);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  });

  deleteProject = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    await ProjectService.deleteProject(parseInt(id), req.userId);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  updateProjectStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const project = await ProjectService.updateProjectStatus(parseInt(id), status);

    res.json({
      success: true,
      message: 'Project status updated successfully',
      data: { project },
    });
  });

  getProjectsByGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const { groupId } = req.params;
    const projects = await ProjectService.getProjectsByGroup(parseInt(groupId));

    res.json({
      success: true,
      data: { projects, count: projects.length },
    });
  });
}

export default new ProjectController();
