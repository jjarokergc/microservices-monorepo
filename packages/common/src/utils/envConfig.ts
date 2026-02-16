// Common variables and factory for environment configuration across all services
//
import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file if present
dotenv.config();

// Base schema with common variables for all services
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']), //.default('development'),
  PORT: z.coerce.number().positive().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

// Factory function to create a full env config with extensions for each service
export function createEnvConfig<Ext extends z.ZodRawShape>(
  extension: Ext,
  // Allows passing process.env or a custom object for testing
  envInput = process.env
) {
  const fullSchema = baseEnvSchema.extend(extension);
  const parsedEnv = fullSchema.safeParse(envInput);
  if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsedEnv.data;
}
