import pino from 'pino';
import { env } from '../utils/envConfig';

export const logger = pino({
  name: env.serviceName,
  level: env.isProduction ? 'info' : 'debug',
  transport: env.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
});
