import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { toUserProfile } from '../utils/userProfile.js';
import type {
  RegistrationInput,
  LoginInput,
  RefreshTokenInput,
  VerifyEmailQuery,
  ResendVerificationInput,
} from '../validators/auth.validator.js';

type TypedRequest<TBody = unknown, TQuery = unknown> = Request<unknown, unknown, TBody, TQuery>;

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

  async verifyEmail(
    req: TypedRequest<unknown, VerifyEmailQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.verifyEmail(req.query.token as string);
      sendSuccess(res, result, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(
    req: TypedRequest<ResendVerificationInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.resendVerificationEmail(req.body.email);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async sendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendVerificationEmail(req.user!.id);
      sendSuccess(res, result, 'Verification email sent');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
