// Environment validation for service
// Additional environment variables are merged with Common
// variables defined in common package
//
import { createEnvConfig } from '@/common';
import { z } from 'zod';

export const env = createEnvConfig({
  MONGODB_HOSTNAME: z.string().min(1),
  MONGODB_PORT: z.coerce.number().int().positive().default(27017),
  MONGODB_DB_NAME: z.string().min(1),

  REDIS_URI: z.string().min(1),

  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().nonnegative().default(0),

  CORS_ORIGIN: z.string().url().default('http://localhost:8080'),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),
  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  serviceName: z
    .string()
    .min(1)
    .default(process.env.npm_package_name || 'unknown-service'),
  serviceVersion: z
    .string()
    .min(1)
    .default(process.env.npm_package_version || '0.0.0'),
  isDevelopment: z.boolean().default(false),
  isProduction: z.boolean().default(false),
  isTest: z.boolean().default(false),
});
