import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { config } from '../../config/index.js';
import type { RegisterInput } from './auth.schema.js';

const SALT_ROUNDS = 10;

/**
 * Registers a new user: rejects duplicate emails, hashes the password, and
 * creates the user record. Brand users get a Brand record and clipper users
 * get a Clipper record attached in the same transaction. Returns the user
 * (without sensitive fields) and a signed JWT.
 *
 * @param input - The validated, role-discriminated registration payload
 * @returns The created user and a JWT signed for that user
 * @throws {AppError} 409 if the email is already registered
 */
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      role: input.role,

      // Role-specific records (identity lives in these, not on User)
      ...(input.role === 'BRAND' && {
        brand: {
          create: {
            companyName: input.companyName,
            industry: input.industry,
            phoneNumber: input.phoneNumber,
          },
        },
      }),
      ...(input.role === 'CLIPPER' && {
        clipper: {
          create: { name: input.name },
        },
      }),
    },

    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return { user, token };
}
