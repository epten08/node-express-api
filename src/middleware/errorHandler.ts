import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown = undefined;
  let stack: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Include stack trace in development
  if (config.env === 'development') {
    stack = err.stack;
  }

  // Log error
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (stack) {
    response.stack = stack;
  }

  res.status(statusCode).json(response);
}
