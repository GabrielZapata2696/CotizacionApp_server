import { Request, Response } from 'express';
import { SitekolPricingService } from '../services/SitekolPricingService';
import { logger } from '../utils/logger';

export class PricingController {
  private pricingService: SitekolPricingService;

  constructor() {
    this.pricingService = new SitekolPricingService();
  }

  /**
   * Calculate product price - matches frontend producto.page.ts calcularPrecios()
   * POST /api/pricing/calculate
   */
  async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { productId, userId } = req.body;

      if (!productId || !userId) {
        res.status(400).json({
          ok: false,
          message: 'Product ID and User ID are required'
        });
        return;
      }

      const calculation = await this.pricingService.calcularPrecioProducto(productId, userId);

      res.json({
        ok: true,
        data: calculation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error calculating price:', error);
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get current metal rates - matches frontend obtenerTarifas()
   * GET /api/pricing/rates
   */
  async getCurrentRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = await this.pricingService.obtenerTarifas();

      res.json({
        ok: true,
        data: rates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting rates:', error);
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get current pricing formula - matches frontend obtenerFormula()
   * GET /api/pricing/formula
   */
  async getCurrentFormula(req: Request, res: Response): Promise<void> {
    try {
      const formula = await this.pricingService.obtenerFormula();

      res.json({
        ok: true,
        data: formula,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting formula:', error);
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Update metal rates from external API
   * POST /api/pricing/update-rates
   */
  async updateRates(req: Request, res: Response): Promise<void> {
    try {
      await this.pricingService.actualizarTarifas();

      const rates = await this.pricingService.obtenerTarifas();

      res.json({
        ok: true,
        message: 'Rates updated successfully',
        data: rates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error updating rates:', error);
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Create quotation - matches frontend cotizar()
   * POST /api/pricing/quote
   */
  async createQuote(req: Request, res: Response): Promise<void> {
    try {
      const { userId, productId, quotedValue, currency } = req.body;

      if (!userId || !productId || !quotedValue || !currency) {
        res.status(400).json({
          ok: false,
          message: 'User ID, Product ID, quoted value, and currency are required'
        });
        return;
      }

      const quotation = await this.pricingService.crearCotizacion(
        userId,
        productId,
        quotedValue,
        currency
      );

      res.json({
        ok: true,
        message: 'Quotation created successfully',
        data: quotation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creating quote:', error);
      res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
