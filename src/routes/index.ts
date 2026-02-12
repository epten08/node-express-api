import { Router } from 'express';
import { userRouter } from './user.routes.js';
import { postRouter } from './post.routes.js';
import { authRouter } from './auth.routes.js';

const router = Router();

// API version prefix
const v1Router = Router();

// Mount route modules
v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/user', userRouter);
v1Router.use('/posts', postRouter);

// Mount versioned router
router.use('/v1', v1Router);

export { router as apiRouter };
