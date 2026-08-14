import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { config } from '../config/index.js';

/**
 * Express middleware that authenticates the request from the session cookie.
 *
 * Verifies the JWT in the `klipday_session` cookie, then loads the user from
 * the database so status changes (e.g. deletion) take effect immediately.
 * On success, attaches the safe user fields to `req.user`; on any failure —
 * missing cookie, expired/tampered token, unknown or deleted user — responds
 * 401 with the same generic message (clients just redirect to login).
 *
 * Express 5 forwards rejected promises to the error handler, so throwing
 * `AppError` here is enough.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies[config.cookieName];
  if (!token) throw new AppError(401, 'Unauthorized');

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new AppError(401, 'Unauthorized');
  }

  // Tokens are signed by this app as { userId, role } — anything else is invalid
  if (typeof payload !== 'object' || typeof payload.userId !== 'string') {
    throw new AppError(401, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, createdAt: true, status: true },
  });

  if (!user || user.status === 'DELETED') {
    throw new AppError(401, 'Unauthorized');
  }

  req.user = { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  next();
}
