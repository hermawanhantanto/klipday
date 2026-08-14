import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../lib/errors.js';

/**
 * Express middleware that validates `req.body` against a zod schema.
 *
 * On success, replaces `req.body` with the parsed (stripped) data and calls `next()`.
 * On failure, throws an `AppError` with status 400 and a message identifying the first
 * failing field (e.g. `companyName: Company name is required`).
 *
 * @param schema - The zod schema to validate against
 * @returns An Express middleware function
 */
export function validate<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {

    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issue = result.error.issues[0];

      if (!issue) throw new AppError(400, 'Invalid request body');

      const issueMessage = `${issue.path.join('.')}: ${issue.message}`;
      throw new AppError(400, issueMessage);
    }

    req.body = result.data;
    next();
  };
}
