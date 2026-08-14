import { Router } from 'express';
import * as authController from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const authRouter = Router();

authRouter.get('/me', requireAuth, authController.me);

authRouter.post('/register', validate(registerSchema), authController.register);

authRouter.post('/login', validate(loginSchema), authController.login);

authRouter.post('/logout', authController.logout);


