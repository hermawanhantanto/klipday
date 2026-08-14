import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';

/**
 * Express error-handling middleware that converts thrown errors into JSON responses.
 *
 * `AppError` instances respond with their own status code and message; any other
 * error is logged and responds as a generic 500.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
