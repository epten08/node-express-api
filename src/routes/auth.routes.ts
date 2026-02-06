import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  authController.refreshToken.bind(authController)
);

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));

router.get('/me', authenticate, authController.me.bind(authController));

export { router as authRouter };
