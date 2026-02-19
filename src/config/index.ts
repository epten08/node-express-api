import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),

  // App
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('Express API'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Email (optional - for production)
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  appUrl: env.APP_URL,
  appName: env.APP_NAME,

  cors: {
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  email: {
    from: env.EMAIL_FROM,
    apiKey: env.EMAIL_API_KEY,
    appName: env.APP_NAME,
  },
} as const;

export type Config = typeof config;
