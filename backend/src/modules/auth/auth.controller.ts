import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

/**
 * HTTP handler for `POST /auth/register`.
 *
 * Delegates to `authService.register` — `req.body` is pre-validated by the
 * `validate` middleware — and responds with the created user and a JWT.
 *
 * @param req - The request; `req.body` is the validated `RegisterInput` payload
 * @param res - Sends `201` with `{ user, token }`
 */
export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}
