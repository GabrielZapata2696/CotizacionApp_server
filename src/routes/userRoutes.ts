import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validationMiddleware } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', (req, res) => userController.getProfile(req, res));

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', [
  body('nombre').optional().trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('telefono').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
  validationMiddleware
], (req, res) => userController.updateProfile(req, res));

/**
 * @route POST /api/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  validationMiddleware
], (req, res) => userController.changePassword(req, res));

/**
 * @route GET /api/users/query-limits
 * @desc Get user query limits and usage
 * @access Private
 */
router.get('/query-limits', (req, res) => userController.getQueryLimits(req, res));

/**
 * @route PUT /api/users/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences', [
  body('currency').optional().isIn(['USD', 'EUR', 'COP']).withMessage('Moneda no válida'),
  body('language').optional().isIn(['es', 'en']).withMessage('Idioma no válido'),
  body('notifications').optional().isBoolean().withMessage('El campo de notificaciones debe ser booleano'),
  validationMiddleware
], (req, res) => userController.updatePreferences(req, res));

export default router;
