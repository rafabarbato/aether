import { Response } from 'express';
import UserService from '../services/UserService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class UserController {
  getAllUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      role: req.query.role as 'admin' | 'manager' | 'member' | undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string,
    };

    const users = await UserService.getAllUsers(filters);

    res.json({
      success: true,
      data: { users, count: users.length },
    });
  });

  getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(parseInt(id));

    res.json({
      success: true,
      data: { user },
    });
  });

  getCurrentUser = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const user = await UserService.getUserById(req.userId);

    res.json({
      success: true,
      data: { user },
    });
  });
}

export default new UserController();
