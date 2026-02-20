import pino from 'pino';

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
});

// Application logging
export const appLogger = baseLogger;

// HTTP logging
export const httpLogger = baseLogger.child(
  { component: 'http' }, // Bindings/context fields
  { level: process.env.HTTP_LOG_LEVEL || 'warn' }, // Real options, including level overides
);

appLogger.debug(`Loggers initialized with levels:
  app: ${appLogger.level}
  http: ${httpLogger.level}`);
