import { Response } from 'express';
import TaskService from '../services/TaskService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class TaskController {
  createTask = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const task = await TaskService.createTask(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  });

  getTaskById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const task = await TaskService.getTaskById(parseInt(id));

    res.json({
      success: true,
      data: { task },
    });
  });

  getAllTasks = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined,
      status: req.query.status as string | string[],
      priority: req.query.priority as string | string[],
      assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined,
      search: req.query.search as string,
    };

    const tasks = await TaskService.getAllTasks(filters);

    res.json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  });

  updateTask = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const task = await TaskService.updateTask(parseInt(id), req.body, req.userId);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  });

  deleteTask = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    await TaskService.deleteTask(parseInt(id), req.userId);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  });

  updateTaskStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const task = await TaskService.updateTaskStatus(parseInt(id), status, req.userId);

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task },
    });
  });

  updateTaskPosition = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { position } = req.body;

    if (position === undefined) {
      throw ApiError.badRequest('Position is required');
    }

    const task = await TaskService.updateTaskPosition(parseInt(id), position);

    res.json({
      success: true,
      message: 'Task position updated successfully',
      data: { task },
    });
  });

  getTasksByProject = catchAsync(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { status } = req.query;

    const tasks = await TaskService.getTasksByProject(
      parseInt(projectId),
      status as string | undefined
    );

    res.json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  });

  getUserTaskStats = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const stats = await TaskService.getUserTaskStats(req.userId);

    res.json({
      success: true,
      data: { stats },
    });
  });
}

export default new TaskController();
