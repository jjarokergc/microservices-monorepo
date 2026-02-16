import { env } from './config/env';
import { app } from './server';
import { appLogger } from '@/common/logging/logger';

import { connectToMongoose } from '@/common/db-utils/mongooseConnection';
import mongoose from 'mongoose'; // ← import to access connection

// Utility to parse package.json for default values in env config
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const serviceName = pkg.name; // e.g. "@myorg/auth-service"
const serviceVersion = pkg.version; // e.g. "1.2.3"


// Optional: uncomment when you activate tracing & Redis
// import openTelemetry from '@/common/lib/tracing.js';
// const tracing = openTelemetry(`${env.serviceName}:${env.serviceVersion}`);
// import { createClient } from 'redis'; // or 'ioredis'
// const redisClient = createClient({ url: env.REDIS_URI });

let server: import('http').Server | null = null;

async function gracefulShutdown(signal: string): Promise<void> {
  appLogger.info(`[${signal}] Received. Starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    appLogger.error('Graceful shutdown timed out after 15s → forcing exit');
    process.exit(1);
  }, 15000);

  try {
    // 1. Stop accepting new connections (let existing requests finish)
    if (server) {
      appLogger.info('Closing HTTP server...');
      await new Promise<void>((resolve) => {
        server!.close(() => {
          appLogger.info('HTTP server closed (no new connections)');
          resolve();
        });
      });
    }

    // 2. Close Mongoose connection pool
    if (mongoose.connection.readyState !== 0) {
      // not disconnected
      appLogger.info('Closing Mongoose connections...');
      await mongoose.connection.close();
      appLogger.info('Mongoose disconnected cleanly');
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

    appLogger.info(`Graceful shutdown completed successfully → ${serviceName}`);
    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    appLogger.error(`Error during shutdown: ${(err as Error).message}`);
    clearTimeout(timeout);
    process.exit(1);
  }
}

async function start() {
  appLogger.info(`───────── ${serviceName.toUpperCase()} v${serviceVersion} ─────────`);
  appLogger.info(`Environment: ${env.NODE_ENV}`);

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
      appLogger.info(`Server Listening on: ${bind.padEnd(28)}`);
    });

    // Register signal handlers (only after successful startup)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
  } catch (err) {
    appLogger.error(`Application startup failed: ${(err as Error).message}`);
    await gracefulShutdown('startup-failure');
  }
}

// Kick off the app
start().catch((err) => {
  appLogger.fatal(`Fatal error during startup: ${(err as Error).message}`);
  process.exit(1);
});
