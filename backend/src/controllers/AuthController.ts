import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const { username, email, password, firstName, lastName, role } = req.body;

    const result = await AuthService.register({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'member',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const result = await AuthService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  });

  getMe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const user = await AuthService.getUserById(req.userId);

    res.json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  });

  logout = catchAsync(async (req: AuthRequest, res: Response) => {
    // In a production app, you would invalidate the token here
    // For now, client-side token removal is sufficient

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });
}

export default new AuthController();
