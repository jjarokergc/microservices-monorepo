import { z } from 'zod';

//NOTE
// Mongo db schema should match the types defined here
export const commonValidations = {
  id: z
    .string()
    .refine((data) => !Number.isNaN(Number(data)), 'ID must be a numeric value')
    .transform(Number)
    .refine((num) => num > 0, 'ID must be a positive number'),
  // ... other common validations
  sku: z.number(),
  name: z.string().min(2).max(255),
  price: z.number().nonnegative(),
  mongoId: z.string(),
};
