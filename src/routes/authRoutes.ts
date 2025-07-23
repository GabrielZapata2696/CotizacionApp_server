import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { validate, schemas } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', validate(schemas.login), authController.login.bind(authController));

/**
 * @route POST /api/v1/auth/register
 * @desc User registration
 * @access Public
 */
router.post('/register', validate(schemas.register), authController.register.bind(authController));

/**
 * @route POST /api/v1/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword.bind(authController));

export default router;
