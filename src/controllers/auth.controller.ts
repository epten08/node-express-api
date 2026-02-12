import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { toUserProfile } from '../utils/userProfile.js';
import type {
  RegistrationInput,
  LoginInput,
  RefreshTokenInput,
} from '../validators/auth.validator.js';

type TypedRequest<TBody = unknown> = Request<unknown, unknown, TBody>;

export class AuthController {
  async register(
    req: TypedRequest<RegistrationInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: TypedRequest<LoginInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: TypedRequest<RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tokens = await authService.refreshToken(req.body);
      sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.id);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      sendSuccess(res, toUserProfile(user), 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
