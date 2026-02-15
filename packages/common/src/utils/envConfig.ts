// Common variables and factory for environment configuration across all services
//
import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  // Add any other variables EVERY service needs
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
