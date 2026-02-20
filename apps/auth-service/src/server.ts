// Express Server Setup and Start
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { healthCheckRouter } from '@example-org/common';
import { userRouter } from './api/user/userRouter';
import { itemAdminRouter } from './api/item/itemAdminRouter';
import { openAPIRouter } from './openapi/openAPIRouter';
import errorHandler from '@example-org/common/middleware/errorHandler';
import { createRateLimiter } from '@example-org/common';
import requestLogger from '@example-org/common/middleware/requestLogger';
import { env } from './config/env';

const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(express.json()); // request body parser
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(
  createRateLimiter({
    limit: env.COMMON_RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.COMMON_RATE_LIMIT_WINDOW_MS,
  }),
);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter); // Prefix '/users' for userRouter
app.use('/items', itemAdminRouter);

// Swagger UI
app.use('/api-docs', openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app };
