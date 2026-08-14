import type { Role } from '../generated/prisma/enums.js';

declare global {
  namespace Express {
    interface Request {
      /** Attached by `requireAuth` after the JWT cookie is verified. */
      user?: { id: string; email: string; role: Role; createdAt: Date };
    }
  }
}

export {};
