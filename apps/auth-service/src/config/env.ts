// Environment validation for service
// Additional environment variables are merged with Common
// variables defined in common package
//
import { createEnvConfig } from '@example-org/common'; // '../../../../packages/common/src/utils/envConfig'; //
import { z } from 'zod';

export const env = createEnvConfig({
  MONGODB_HOSTNAME: z.string().min(1),
  MONGODB_PORT: z.coerce.number().int().positive().default(27017),
  MONGODB_DB_NAME: z.string().min(1),

  // REDIS_URI: z.string().min(1),

  HOST: z.string().min(1),
  PORT: z.coerce.number().int().nonnegative(),

  CORS_ORIGIN: z.string().url().default('http://localhost:8080'),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),
  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  HTTP_LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('warn'),
});
