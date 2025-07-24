import { Router } from 'express';
import { EmailController } from '@/controllers/EmailController';
import { body } from 'express-validator';
import { validationMiddleware } from '@/middleware/validation';

const router = Router();
const emailController = new EmailController();

/**
 * @route POST /api/v1/email/test
 * @desc Send a test email to verify the email service is working
 * @access Public (for testing purposes)
 */
router.post('/test', [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  validationMiddleware
], emailController.sendTestEmail.bind(emailController));

/**
 * @route POST /api/v1/email/welcome
 * @desc Send a welcome email to a new user
 * @access Public (for testing purposes)
 */
router.post('/welcome', [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('name')
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .trim()
    .escape(),
  validationMiddleware
], emailController.sendWelcomeEmail.bind(emailController));

/**
 * @route POST /api/v1/email/password-reset
 * @desc Send a password reset email
 * @access Public (for testing purposes)
 */
router.post('/password-reset', [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  validationMiddleware
], emailController.sendPasswordResetEmail.bind(emailController));

/**
 * @route POST /api/v1/email/custom
 * @desc Send a custom email (for testing purposes)
 * @access Public (for testing purposes)
 */
router.post('/custom', [
  body('to')
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      }
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .withMessage('Must be a valid email address or array of valid email addresses'),
  body('subject')
    .isLength({ min: 1 })
    .withMessage('Subject is required')
    .trim(),
  body('html')
    .isLength({ min: 1 })
    .withMessage('HTML content is required'),
  body('text')
    .optional()
    .trim(),
  validationMiddleware
], emailController.sendCustomEmail.bind(emailController));

export default router;
