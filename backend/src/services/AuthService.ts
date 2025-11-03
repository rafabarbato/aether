import jwt from 'jsonwebtoken';
import { config } from '../config';
import User, { UserCreationAttributes, UserAttributes } from '../database/models/User';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<UserAttributes, 'password'>;
  tokens: AuthTokens;
}

class AuthService {
  async register(userData: UserCreationAttributes): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
      }

      const existingUsername = await User.findOne({
        where: { username: userData.username },
      });

      if (existingUsername) {
        throw ApiError.conflict('Username already taken');
      }

      // Create new user
      const user = await User.create(userData);

      // Generate tokens
      const tokens = this.generateTokens(user);

      logger.info(`User registered: ${user.email}`);

      return {
        user: user.toSafeObject(),
        tokens,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: user.toSafeObject(),
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid refresh token');
      }
      throw error;
    }
  }

  private generateTokens(user: User): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as any);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as any);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: number): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}

export default new AuthService();
