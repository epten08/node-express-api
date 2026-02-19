import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailQuerySchema,
  resendVerificationSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes (with stricter rate limiting)
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  authController.refreshToken.bind(authController)
);

// Email verification routes
router.get(
  '/verify-email',
  validate({ query: verifyEmailQuerySchema }),
  authController.verifyEmail.bind(authController)
);

router.post(
  '/resend-verification',
  authLimiter,
  validate({ body: resendVerificationSchema }),
  authController.resendVerification.bind(authController)
);

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));

router.get('/me', authenticate, authController.me.bind(authController));

router.post(
  '/send-verification',
  authenticate,
  authController.sendVerification.bind(authController)
);

export { router as authRouter };
