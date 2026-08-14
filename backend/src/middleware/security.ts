import type { CorsOptions } from 'cors';
import { rateLimit, MINUTE } from 'express-rate-limit';
import { config } from '../config/index.js';

// CORS: only allow the frontend origin
export const corsOptions: CorsOptions = {
  origin: config.frontendUrl,
  credentials: true,
};

// Global rate limit: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});

// Stricter limiter for auth endpoints (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});
