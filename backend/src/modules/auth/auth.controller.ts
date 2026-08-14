import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { config } from '../../config/index.js';
import { AppError } from '../../lib/errors.js';

// Shared by `login` (set) and `logout` (clear) — browsers only clear a cookie
// when path/sameSite/secure match the values it was set with.
// `clearCookie` ignores maxAge (it sends Max-Age=0), but sharing one object is harmless.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.cookieSecure,
  path: '/',
  maxAge: config.cookieMaxAgeMs,
};

/**
 * HTTP handler for `POST /auth/register`.
 *
 * Delegates to `authService.register` — `req.body` is pre-validated by the
 * `validate` middleware — and responds with the created user. No token and
 * no cookie: the client establishes a session via `POST /auth/login`.
 *
 * @param req - The request; `req.body` is the validated `RegisterInput` payload
 * @param res - Sends `201` with `{ user }`
 */
export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

/**
 * HTTP handler for `POST /auth/login`.
 *
 * Delegates to `authService.login` — `req.body` is pre-validated by the
 * `validate` middleware — stores the JWT in an httpOnly cookie, and responds
 * with the user. The token never appears in the response body.
 *
 * @param req - The request; `req.body` is the validated `LoginInput` payload
 * @param res - Sets the session cookie and sends `200` with `{ user }`
 */
export async function login(req: Request, res: Response) {
  const { user, token } = await authService.login(req.body);

  res.cookie(config.cookieName, token, cookieOptions);

  res.status(200).json({ user });
}

/**
 * HTTP handler for `POST /auth/logout`.
 *
 * Clears the session cookie. No auth required so stale or expired cookies can
 * always be cleared.
 *
 * @param _req - Unused
 * @param res - Clears the session cookie and sends `200` with a message
 */
export function logout(_req: Request, res: Response) {
  res.clearCookie(config.cookieName, cookieOptions);
  res.status(200).json({ message: 'Logged out' });
}

/**
 * HTTP handler for `GET /auth/me`.
 *
 * `requireAuth` attaches the authenticated user to `req.user`.
 *
 * @param req - The request; `req.user` is attached by `requireAuth`
 * @param res - Sends `200` with `{ user }`
 */
export function me(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  res.status(200).json({ user: req.user });
}
