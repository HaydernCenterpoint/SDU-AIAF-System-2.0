import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

export function createAuthRoutes({ authService }) {
  const router = Router();
  const controller = createAuthController({ authService });

  router.post('/register', validate(registerSchema), asyncHandler(controller.register));
  router.post('/login', validate(loginSchema), asyncHandler(controller.login));
  router.post('/logout', authenticateJwt, validate(logoutSchema), asyncHandler(controller.logout));
  router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(controller.refreshToken));
  router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
  router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(controller.resetPassword));
  router.put('/change-password', authenticateJwt, validate(changePasswordSchema), asyncHandler(controller.changePassword));

  return router;
}
