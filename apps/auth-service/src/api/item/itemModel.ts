// Input API validation for Item entity. Uses zod for schema definition and validation
// Mongoose database schema and model for Item entity
// Manually track API schema and DB schema separately
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { commonValidations } from '@example-org/common';
import mongoose, { InferSchemaType } from 'mongoose';

extendZodWithOpenApi(z);

// Input API model for Item
const BaseItemShape = {
  sku: commonValidations.sku,
  name: commonValidations.name,
  price: commonValidations.price,
} as const;

// GET /admin/item/:itemId validation schema
export const GetItemRouteSchema = z.object({
  params: z.object({ itemId: commonValidations.mongoId }),
});

//POST /admin/item validation schema
export type ItemCreatePayload = z.infer<typeof ItemCreateSchema>;
export const ItemCreateSchema = z.object(BaseItemShape);
export const CreateItemRouteSchema = z.object({
  body: ItemCreateSchema,
});

// PUT /admin/item/:itemID with data in the request body
export type ItemUpdatePayload = z.infer<typeof ItemUpdateSchema>;
export const ItemUpdateSchema = z.object(BaseItemShape).partial();
export const UpdateItemRouteSchema = z.object({
  params: z.object({ itemId: commonValidations.mongoId }),
  body: ItemUpdateSchema,
});

// DELETE /admin/item/:itemID
export type ItemDeletePayload = z.infer<typeof ItemDeleteSchema>;
export const ItemDeleteSchema = z.object({
  itemId: commonValidations.mongoId,
});
export const DeleteItemRouteSchema = z.object({
  params: ItemDeleteSchema,
});

// Response API model for Item
export const ItemResponseSchema = z.object({
  _id: z.string(),
  ...BaseItemShape,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Database model for Item
// Manually track API schema above and DB schema here
const ItemDbSchema = new mongoose.Schema(
  {
    sku: { type: Number, required: true, trim: true, index: { unique: true } },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type ItemDocument = InferSchemaType<typeof ItemDbSchema> & mongoose.Document;

// Idempotent model definition - check if model already exists before defining it
// This is necessary to avoid "OverwriteModelError: Cannot overwrite `Item` model once compiled." error
export const ItemModel = mongoose.models.Item || mongoose.model<ItemDocument>('Item', ItemDbSchema);
