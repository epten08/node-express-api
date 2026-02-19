import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('should create an error with default values', () => {
    const error = new AppError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create a bad request error', () => {
    const error = AppError.badRequest('Invalid input');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
  });

  it('should create a bad request error with validation errors', () => {
    const validationErrors = [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password too short' },
    ];
    const error = AppError.badRequest('Validation failed', validationErrors);

    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(validationErrors);
  });

  it('should create an unauthorized error', () => {
    const error = AppError.unauthorized();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should create a forbidden error', () => {
    const error = AppError.forbidden();

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  it('should create a not found error', () => {
    const error = AppError.notFound('User not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should create a conflict error', () => {
    const error = AppError.conflict('Email already exists');

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email already exists');
  });

  it('should create a too many requests error', () => {
    const error = AppError.tooManyRequests();

    expect(error.statusCode).toBe(429);
    expect(error.message).toBe('Too many requests');
  });

  it('should create an internal error with isOperational false', () => {
    const error = AppError.internal('Database connection failed');

    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });
});
