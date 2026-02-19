import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { GetUserSchema, UserSchema } from './userModel';
import { createApiResponse } from '@example-org/common';
import { validateRequest } from '@example-org/common';
import { userController } from './userController';

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register('User', UserSchema);

userRegistry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['User'],
  responses: createApiResponse(z.array(UserSchema), 'Success'),
});

userRouter.get('/', userController.getUsers);

userRegistry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['User'],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success'),
});

userRouter.get('/:id', validateRequest(GetUserSchema), userController.getUser);
