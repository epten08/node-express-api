import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../validators/user.validator.js';

const router = Router();

router
  .route('/')
  .get(
    validate({ query: listUsersQuerySchema }),
    userController.findAll.bind(userController)
  )
  .post(
    validate({ body: createUserSchema }),
    userController.create.bind(userController)
  );

router
  .route('/:id')
  .get(
    validate({ params: userIdParamSchema }),
    userController.findById.bind(userController)
  )
  .patch(
    validate({ params: userIdParamSchema, body: updateUserSchema }),
    userController.update.bind(userController)
  )
  .delete(
    validate({ params: userIdParamSchema }),
    userController.delete.bind(userController)
  );

export { router as userRouter };
