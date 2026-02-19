export interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationError[];

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: ValidationError[],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ValidationError[]) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new AppError(message, 429);
  }

  static internal(message: string = 'Internal server error') {
    return new AppError(message, 500, undefined, false);
  }
}
