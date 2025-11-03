import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import { config } from '../config';

const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Log error
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Convert known errors to ApiError
  if (err instanceof ValidationError) {
    const message = err.errors.map((e) => e.message).join(', ');
    error = ApiError.badRequest(message);
  } else if (!(err instanceof ApiError)) {
    error = ApiError.internal(
      config.env === 'production' ? 'Internal server error' : err.message
    );
  }

  // Cast to ApiError for response
  const apiError = error as ApiError;
  const statusCode = apiError.statusCode || 500;
  const message = apiError.message || 'Internal server error';

  const response: any = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  if (config.env === 'development') {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
