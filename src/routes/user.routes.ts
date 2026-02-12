import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../validators/user.validator.js';

const router = Router();

router.get(
  '/profile',
  authenticate,
  userController.getProfile.bind(userController)
);

router.put(
  '/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  userController.updateProfile.bind(userController)
);

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  userController.changePassword.bind(userController)
);

router.delete(
  '/delete-account',
  authenticate,
  validate({ body: deleteAccountSchema }),
  userController.deleteAccount.bind(userController)
);

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
