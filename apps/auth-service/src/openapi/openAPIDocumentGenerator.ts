// API Document generator using zod-to-openapi
// Adds all registered schemas and paths to create the OpenAPI document
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { healthCheckRegistry } from '@example-org/common';
import { userRegistry } from '../api/user/userRouter';
import { itemAdminRegistry } from '../api/item/itemAdminRouter';

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3['generateDocument']>;

export function generateOpenAPIDocument(): OpenAPIDocument {
  const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry, itemAdminRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'test API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
