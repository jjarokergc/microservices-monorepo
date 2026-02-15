// Environment validation for service
// Additional environment variables are merged with Common
// variables defined in common package
//
import { createEnvConfig } from '@/common';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file if present
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  console.warn('No .env file found, relying on process.env');
}

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

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  HTTP_LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('warn'),

  serviceName: z
    .string()
    .min(1)
    .default(process.env.npm_package_name || 'unknown-service'),
  serviceVersion: z
    .string()
    .min(1)
    .default(process.env.npm_package_version || '0.0.0'),
});
