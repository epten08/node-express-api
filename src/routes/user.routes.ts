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

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Users]
 *     summary: Update current user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Validation error or wrong current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  userController.changePassword.bind(userController)
);

/**
 * @swagger
 * /api/v1/users/delete-account:
 *   delete:
 *     tags: [Users]
 *     summary: Delete the current user's account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Account deleted successfully
 *       '400':
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/delete-account',
  authenticate,
  validate({ body: deleteAccountSchema }),
  userController.deleteAccount.bind(userController)
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     tags: [Users]
 *     summary: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User deleted
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
