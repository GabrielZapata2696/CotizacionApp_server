import { Router } from 'express';
import { PricingController } from '../controllers/PricingController';
import { authenticate } from '../middleware/auth';

const router = Router();
const pricingController = new PricingController();

// Apply authentication middleware to all pricing routes
router.use(authenticate);

/**
 * @route POST /api/pricing/calculate
 * @desc Calculate product price based on current metal rates and user's company settings
 * @access Private
 * @body { productId: number, userId: number }
 */
router.post('/calculate', (req, res) => pricingController.calculatePrice(req, res));

/**
 * @route GET /api/pricing/rates  
 * @desc Get current metal rates (XPD, XPT, XRH, COP)
 * @access Private
 */
router.get('/rates', (req, res) => pricingController.getCurrentRates(req, res));

/**
 * @route GET /api/pricing/formula
 * @desc Get current pricing formula (discount factors a, b, c, cop)
 * @access Private
 */
router.get('/formula', (req, res) => pricingController.getCurrentFormula(req, res));

/**
 * @route POST /api/pricing/update-rates
 * @desc Update metal rates from external API (Admin only)
 * @access Private (Admin)
 */
router.post('/update-rates', (req, res) => pricingController.updateRates(req, res));

/**
 * @route POST /api/pricing/quote
 * @desc Create quotation request
 * @access Private
 * @body { userId: number, productId: number, quotedValue: number, currency: string }
 */
router.post('/quote', (req, res) => pricingController.createQuote(req, res));

export { router as pricingRoutes };
