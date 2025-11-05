import { Response } from 'express';
import GroupService from '../services/GroupService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class GroupController {
  createGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const group = await GroupService.createGroup(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group },
    });
  });

  getGroupById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const group = await GroupService.getGroupById(parseInt(id));

    res.json({
      success: true,
      data: { group },
    });
  });

  getAllGroups = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      ownerId: req.query.ownerId ? parseInt(req.query.ownerId as string) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string,
    };

    const groups = await GroupService.getAllGroups(filters);

    res.json({
      success: true,
      data: { groups, count: groups.length },
    });
  });

  getGroupsWithProjectCount = catchAsync(async (req: AuthRequest, res: Response) => {
    const groups = await GroupService.getGroupsWithProjectCount();

    res.json({
      success: true,
      data: { groups, count: groups.length },
    });
  });

  updateGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const group = await GroupService.updateGroup(parseInt(id), req.body, req.userId);

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group },
    });
  });

  deleteGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    await GroupService.deleteGroup(parseInt(id), req.userId);

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  });

  toggleGroupStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const group = await GroupService.toggleGroupStatus(parseInt(id), req.userId);

    res.json({
      success: true,
      message: 'Group status updated successfully',
      data: { group },
    });
  });
}

export default new GroupController();
