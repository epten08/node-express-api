import { type Request, type Response, type NextFunction } from 'express';
import { type ZodError, type ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schema: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      const zodError = error as ZodError;
      const errors = zodError.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      next(new AppError('Validation failed', 400, errors));
    }
  };
}

// Shorthand validators for common use cases
export const validateBody = (schema: ZodTypeAny) => validate({ body: schema });
export const validateQuery = (schema: ZodTypeAny) => validate({ query: schema });
export const validateParams = (schema: ZodTypeAny) => validate({ params: schema });
