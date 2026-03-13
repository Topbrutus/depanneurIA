/**
 * HTTP error handling middleware
 * Provides consistent error response format
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors.js';
import { logger } from './logger.js';
import { isDevelopment } from './env.js';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    status?: number;
    stack?: string;
  };
}

/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Une erreur interne est survenue';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // Log error
  logger.error('Request error', {
    error: err.message,
    code,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Build response
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      status: statusCode,
      ...(isDevelopment && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Route introuvable',
      code: 'NOT_FOUND',
      status: 404,
    },
  };

  res.status(404).json(response);
}
