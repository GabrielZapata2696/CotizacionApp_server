import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { authenticate } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validationMiddleware } from '../middleware/validation';

const router = Router();
const companyController = new CompanyController();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/companies/stats
 * @desc Get company statistics (admin only)
 * @access Private (Admin)
 */
router.get('/stats', (req, res) => companyController.getCompanyStats(req, res));

/**
 * @route GET /api/companies
 * @desc Get all companies (admin only)
 * @access Private (Admin)
 */
router.get('/', (req, res) => companyController.getAllCompanies(req, res));

/**
 * @route GET /api/companies/:id
 * @desc Get company by ID
 * @access Private
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID de empresa inválido'),
  validationMiddleware
], (req, res) => companyController.getCompanyById(req, res));

/**
 * @route POST /api/companies
 * @desc Create new company (admin only)
 * @access Private (Admin)
 */
router.post('/', [
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre es requerido y debe tener al menos 2 caracteres'),
  body('tipo').isIn(['basico', 'premium']).withMessage('El tipo debe ser básico o premium'),
  body('pais').notEmpty().withMessage('El país es requerido'),
  body('porcentajePago').optional().isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de pago debe estar entre 0 y 100'),
  body('costos').optional().isFloat({ min: 0 }).withMessage('Los costos no pueden ser negativos'),
  body('contactoPrincipal').optional().trim(),
  body('telefono').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
  body('direccion').optional().trim(),
  validationMiddleware
], (req, res) => companyController.createCompany(req, res));

/**
 * @route PUT /api/companies/:id
 * @desc Update company
 * @access Private
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID de empresa inválido'),
  body('nombre').optional().trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('tipo').optional().isIn(['basico', 'premium']).withMessage('El tipo debe ser básico o premium'),
  body('pais').optional().notEmpty().withMessage('El país es requerido'),
  body('porcentajePago').optional().isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de pago debe estar entre 0 y 100'),
  body('costos').optional().isFloat({ min: 0 }).withMessage('Los costos no pueden ser negativos'),
  body('contactoPrincipal').optional().trim(),
  body('telefono').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
  body('direccion').optional().trim(),
  validationMiddleware
], (req, res) => companyController.updateCompany(req, res));

/**
 * @route GET /api/companies/:id/payment-settings
 * @desc Get company payment settings
 * @access Private
 */
router.get('/:id/payment-settings', [
  param('id').isInt({ min: 1 }).withMessage('ID de empresa inválido'),
  validationMiddleware
], (req, res) => companyController.getPaymentSettings(req, res));

/**
 * @route PUT /api/companies/:id/payment-settings
 * @desc Update company payment settings (admin only)
 * @access Private (Admin)
 */
router.put('/:id/payment-settings', [
  param('id').isInt({ min: 1 }).withMessage('ID de empresa inválido'),
  body('porcentajePago').optional().isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de pago debe estar entre 0 y 100'),
  body('costos').optional().isFloat({ min: 0 }).withMessage('Los costos no pueden ser negativos'),
  validationMiddleware
], (req, res) => companyController.updatePaymentSettings(req, res));

export default router;
