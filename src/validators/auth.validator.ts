import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    deviceId: z.string().optional(),
    device_id: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => Boolean(data.firstName || data.name), {
    message: 'firstName or name is required',
    path: ['firstName'],
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .transform((data) => ({
    ...data,
    deviceId: data.deviceId ?? data.device_id,
  }));

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    deviceId: z.string().optional(),
    device_id: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    deviceId: data.deviceId ?? data.device_id,
  }));

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional(),
})
  .refine((data) => Boolean(data.refreshToken || data.refresh_token), {
    message: 'Refresh token is required',
    path: ['refreshToken'],
  })
  .transform((data) => ({
    refreshToken: data.refreshToken ?? data.refresh_token!,
  }));

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RegistrationInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
