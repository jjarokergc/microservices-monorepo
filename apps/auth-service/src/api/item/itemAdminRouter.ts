// Express router for admin item management
// OpenAPI registration for item admin routes
// Update API Document generator to include item admin routes
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import {
  CreateItemRouteSchema,
  GetItemRouteSchema,
  ItemCreateSchema,
  ItemResponseSchema,
  ItemUpdateSchema,
  UpdateItemRouteSchema,
  DeleteItemRouteSchema,
} from './itemModel';
import { createApiResponse } from '@example-org/common';
import { validateRequest } from '@example-org/common';
import { itemController } from './itemController';

export const itemAdminRouter: Router = express.Router();
export const itemAdminRegistry = new OpenAPIRegistry();

// Register Item schema and paths in OpenAPI registry
const itemSchemaRef = itemAdminRegistry.register('Item', ItemResponseSchema); // Payload

// Get all Items
itemAdminRegistry.registerPath({
  method: 'get',
  path: '/items',
  tags: ['Item'],
  responses: createApiResponse(itemSchemaRef, 'Success'),
});

// Get Item by itemId
itemAdminRegistry.registerPath({
  method: 'get',
  path: '/items/{itemId}',
  tags: ['Item'],
  request: { params: GetItemRouteSchema.shape.params },
  responses: createApiResponse(itemSchemaRef, 'Success'),
});

// Create new Item
itemAdminRegistry.registerPath({
  method: 'post',
  path: '/items',
  tags: ['Item'],
  request: {
    body: {
      description: 'Post Request to Create an Item',
      required: true,
      content: {
        'application/json': {
          schema: ItemCreateSchema,
        },
      },
    },
  },
  responses: createApiResponse(itemSchemaRef, 'Success'),
});

// Update existing Item
itemAdminRegistry.registerPath({
  method: 'put',
  path: '/items/{itemId}',
  tags: ['Item'],
  request: {
    params: UpdateItemRouteSchema.shape.params,
    body: {
      description: 'Update an Item',
      required: true,
      content: {
        'application/json': {
          schema: ItemUpdateSchema,
        },
      },
    },
  },
  responses: createApiResponse(itemSchemaRef, 'Success'),
});

// Delete an Item
itemAdminRegistry.registerPath({
  method: 'delete',
  path: '/items/{itemId}',
  tags: ['Item'],
  request: {
    params: DeleteItemRouteSchema.shape.params,
  },
  responses: createApiResponse(itemSchemaRef, 'Success'),
});

// Define itemAAdminRouter and its routes
// Prefix all routes with '/admin/item' is handled in server.ts
itemAdminRouter.get('/', itemController.getItems);
itemAdminRouter.get('/:itemId', validateRequest(GetItemRouteSchema), itemController.getItem);
itemAdminRouter.post('/', validateRequest(CreateItemRouteSchema), itemController.createItem);
itemAdminRouter.put('/:itemId', validateRequest(UpdateItemRouteSchema), itemController.updateItem);
itemAdminRouter.delete(
  '/:itemId',
  validateRequest(DeleteItemRouteSchema),
  itemController.deleteItem
);
