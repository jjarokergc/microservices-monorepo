// Common variables and factory for environment configuration across all services
//
import { z } from 'zod';
import dotenv from 'dotenv';
import { appLogger } from '../logging/logger';

dotenv.config();

// Base schema with common variables for all services
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']), //.default('development'),
  PORT: z.coerce.number().positive().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

// Factory function to create a full env config with extensions for each service
export function createEnvConfig<Ext extends z.ZodRawShape>(extension: Ext) {
  const fullSchema = baseEnvSchema.extend(extension);
  const parsedEnv = fullSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    appLogger.error(`Invalid environment variables: ${parsedEnv.error.format()}`);
    appLogger.error(`process.env: ${JSON.stringify(process.env, null, 2)}`);
    throw new Error('Invalid environment variables');
  }

  return parsedEnv.data;
}
