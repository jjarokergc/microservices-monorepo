import dotenv from 'dotenv';
import { z } from 'zod';

const result = dotenv.config();
if (result.error) {
  console.error(`Could not load .env file for environment: ${process.env.NODE_ENV}`);
}

const envSchema = z.object({
  MONGODB_HOSTNAME: z.string().min(1),
  MONGODB_PORT: z.coerce.number().int().positive().default(27017),
  MONGODB_DB_NAME: z.string().min(1),

  REDIS_URI: z.string().min(1),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().nonnegative().default(0),

  CORS_ORIGIN: z.string().url().default('http://localhost:8080'),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),
  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables');
}

// Export the validated and parsed environment variables
export const env = {
  ...parsedEnv.data,
  serviceName: process.env.npm_package_name || 'unknown-service',
  serviceVersion: process.env.npm_package_version || '0.0.0',
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isTest: parsedEnv.data.NODE_ENV === 'test',
};
