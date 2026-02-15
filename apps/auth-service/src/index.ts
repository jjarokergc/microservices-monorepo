import { env } from './config/env';
import { app } from './server';
import { logger } from '@/common/logging/logger';

import { connectToMongoose } from '@/common/db-utils/mongooseConnection';
import mongoose from 'mongoose'; // ← import to access connection

// Optional: uncomment when you activate tracing & Redis
// import openTelemetry from '@/common/lib/tracing.js';
// const tracing = openTelemetry(`${env.serviceName}:${env.serviceVersion}`);
// import { createClient } from 'redis'; // or 'ioredis'
// const redisClient = createClient({ url: env.REDIS_URI });

let server: import('http').Server | null = null;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`[${signal}] Received. Starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out after 15s → forcing exit');
    process.exit(1);
  }, 15000);

  try {
    // 1. Stop accepting new connections (let existing requests finish)
    if (server) {
      logger.info('Closing HTTP server...');
      await new Promise<void>((resolve) => {
        server!.close(() => {
          logger.info('HTTP server closed (no new connections)');
          resolve();
        });
      });
    }

    // 2. Close Mongoose connection pool
    if (mongoose.connection.readyState !== 0) {
      // not disconnected
      logger.info('Closing Mongoose connections...');
      await mongoose.connection.close();
      logger.info('Mongoose disconnected cleanly');
    }

    // Optional: Redis shutdown (uncomment when implemented)
    // if (redisClient?.isOpen) {
    //   logger.info('Closing Redis...');
    //   await redisClient.quit(); // or .disconnect() for ioredis
    //   logger.info('Redis closed');
    // }

    // Optional: Tracing shutdown (flush remaining spans/metrics)
    // await tracing?.shutdown?.();
    // logger.info('Tracing shut down');

    logger.info(`Graceful shutdown completed successfully → ${env.serviceName}`);
    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    logger.error(`Error during shutdown: ${(err as Error).message}`);
    clearTimeout(timeout);
    process.exit(1);
  }
}

async function start() {
  logger.info(`───────── ${env.serviceName.toUpperCase()} v${env.serviceVersion} ─────────`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  try {
    // 1. Database connection first
    await connectToMongoose(
      `mongodb://${env.MONGODB_HOSTNAME}:${env.MONGODB_PORT}/${env.MONGODB_DB_NAME}`,
      {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 5000,
        // Optional extras you might want:
        // maxPoolSize: 50,
        // family: 4, // force IPv4 if needed
      }
    );

    // Optional: Redis connection
    // logger.info('Connecting to Redis...');
    // await redisClient.connect();
    // logger.info('Redis connected');

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      const addr = server!.address();
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port ?? env.PORT}`;
      logger.info(`Server Listening on: ${bind.padEnd(28)}`);
    });

    // Register signal handlers (only after successful startup)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
  } catch (err) {
    logger.error(`Application startup failed: ${(err as Error).message}`);
    await gracefulShutdown('startup-failure');
  }
}

// Kick off the app
start().catch((err) => {
  logger.fatal(`Fatal error during startup: ${(err as Error).message}`);
  process.exit(1);
});
