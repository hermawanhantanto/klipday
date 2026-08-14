import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { config } from '../../config/index.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

const SALT_ROUNDS = 10;

/**
 * Registers a new user: rejects duplicate emails, hashes the password, and
 * creates the user record. Brand users get a Brand record and clipper users
 * get a Clipper record attached in the same transaction. Returns the user
 * (without sensitive fields) — the client establishes a session by calling
 * `login` afterwards.
 *
 * @param input - The validated, role-discriminated registration payload
 * @returns The created user
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

  return { user };
}

/**
 * Authenticates a user by email and password. On success, returns the user
 * (without sensitive fields) and a JWT for the caller to store in a cookie.
 *
 * Unknown emails, wrong passwords, and deleted accounts all get the same 401
 * so callers can't enumerate accounts. The `isVerified` gate sits after the
 * password check, so only the real owner of the email can hit the 403.
 *
 * @param input - The validated login payload
 * @returns The authenticated user and a JWT signed for that user
 * @throws {AppError} 401 if the credentials are wrong or the account is deleted
 * @throws {AppError} 403 if the account's email is not verified
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      status: true,
      isVerified: true,
      password: true,
    },
  });

  if (!user || user.status === 'DELETED') {
    throw new AppError(401, 'Invalid email or password');
  }

  // Google-only accounts have no password — treat them like a wrong password
  const passwordMatches = user.password
    ? await bcrypt.compare(input.password, user.password)
    : false;

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw new AppError(403, 'Email not verified');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return { user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt }, token };
}
