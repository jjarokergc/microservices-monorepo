// Common variables and factory for environment configuration across all services
//
import { z } from 'zod';
import dotenv from 'dotenv';
import { appLogger } from '../logging/logger';
import { log } from 'node:console';

// Load .env file if present
const dotenvResult = dotenv.config();

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

  if (dotenvResult.error) {
    appLogger.warn('.env file failed to load');
  } else {
    const loadedEnvVars = dotenvResult.parsed || {};

    if (loadedEnvVars.LOG_LEVEL === 'debug') {
      appLogger.info('Loaded environment variables from .env file:');

      // Print all key = value pairs
      const entries = Object.entries(loadedEnvVars).sort((a, b) => a[0].localeCompare(b[0])); // optional: alphabetical sort
      for (const [key, value] of entries) {
        appLogger.info(`  ${key} = ${value}`);
      }
    }
  }

  if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsedEnv.data;
}
