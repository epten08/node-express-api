import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  deviceId: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  deviceId: z.string().optional(),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
    dateOfBirth: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid dateOfBirth value')
      .optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    deviceId: z.string().optional(),
    device_id: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
      })
      .optional(),
    preferences: z
      .object({
        language: z.string().optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
        notifications: z.boolean().optional(),
      })
      .optional(),
  })
  .transform((data) => ({
    ...data,
    deviceId: data.deviceId ?? data.device_id,
  }));

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    current_password: z.string().optional(),
    newPassword: z.string().optional(),
    new_password: z.string().optional(),
  })
  .refine((data) => Boolean(data.currentPassword || data.current_password), {
    message: 'Current password is required',
    path: ['currentPassword'],
  })
  .refine((data) => Boolean(data.newPassword || data.new_password), {
    message: 'New password is required',
    path: ['newPassword'],
  })
  .transform((data) => ({
    currentPassword: data.currentPassword ?? data.current_password!,
    newPassword: data.newPassword ?? data.new_password!,
  }));

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const userIdParamSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

// Infer types from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
