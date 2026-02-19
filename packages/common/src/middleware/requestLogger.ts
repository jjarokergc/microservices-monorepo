import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import pinoHttp from 'pino-http';
import { httpLogger } from '../logging/logger';

const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || randomUUID();

  // Set for downstream use
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};

// HTTP logger middleware
const middlewareLogger = pinoHttp({
  logger: httpLogger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500 || err) return 'error'; // Server errors and exceptions
    if (res.statusCode >= 400) return 'warn'; // Client errors
    if (res.statusCode >= 200) return 'info';
    return process.env.NODE_ENV === 'development' ? 'debug' : 'silent';
  },
  genReqId: (req) => req.headers['x-request-id'] as string,
  customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
  customErrorMessage: (_req, res) => `Request failed with status code: ${res.statusCode}`,
  // Only log response bodies in development
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
  },
});

const captureResponseBody = (_req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  next();
};

export default [addRequestId, captureResponseBody, middlewareLogger];
