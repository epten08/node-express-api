import { type Request, type Response, type NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
  ListUsersQuery,
} from '../validators/user.validator.js';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body as CreateUserInput);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.findAll(req.query as unknown as ListUsersQuery);
      sendSuccess(res, result.data, 'Users retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.user!.id);
      sendSuccess(res, profile, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request<unknown, unknown, UpdateProfileInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const profile = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, profile, 'User profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request<unknown, unknown, ChangePasswordInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.changePassword(req.user!.id, req.body);
      sendSuccess(res, { message: 'Password changed successfully' }, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(
    req: Request<unknown, unknown, DeleteAccountInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.deleteAccount(req.user!.id, req.body);
      sendSuccess(res, { message: 'Account deleted successfully' }, 'Account deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
