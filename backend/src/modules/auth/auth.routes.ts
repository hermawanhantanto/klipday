import { Router } from 'express';
import * as authController from './auth.controller.js';
import { registerSchema } from './auth.schema.js';
import { validate } from '../../middleware/validate.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
