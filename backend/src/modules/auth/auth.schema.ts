import { z } from 'zod';

// Fields every user must provide, regardless of role
const baseFields = {
  email: z.email('Invalid email address'),

  // 72 is bcrypt's max input length in bytes
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/\d/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 symbol')
    .max(72, 'Password must be at most 72 characters'),
};

// Users pick their role at signup; ADMIN is never allowed here
// Brands are identified by company name (no personal name); clippers provide
// their own name plus the base fields
export const registerSchema = z.discriminatedUnion('role', [
  z.object({
    ...baseFields,
    role: z.literal('BRAND'),
    companyName: z.string().min(1, 'Company name is required').max(200),
    industry: z.string().min(1, 'Industry is required').max(100),
    phoneNumber: z.string().min(1, 'Phone number is required').max(20),
  }),
  z.object({
    ...baseFields,
    role: z.literal('CLIPPER'),
    name: z.string().min(1, 'Name is required').max(100),
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;
