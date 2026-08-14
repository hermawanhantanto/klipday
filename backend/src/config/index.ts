// Single source of truth for session lifetime: the JWT expiry string and the
// cookie maxAge are both derived from this so they can't drift apart.
const JWT_EXPIRES_IN_DAYS = 7;

export const config = {
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET || 'klipday-dev-secret',
  jwtExpiresIn: `${JWT_EXPIRES_IN_DAYS}d`,

  cookieName: 'klipday_session',
  cookieMaxAgeMs: JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  cookieSecure: process.env.NODE_ENV === 'production',
} as const;
