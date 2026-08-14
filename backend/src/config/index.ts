export const config = {
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Dev fallback only — always set JWT_SECRET in .env for real deployments
  jwtSecret: process.env.JWT_SECRET || 'klipday-dev-secret',
  jwtExpiresIn: '7d',
} as const;
