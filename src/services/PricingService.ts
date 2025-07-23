import { Tarifa } from '../models/Tarifa';
import { Formula } from '../models/Formula';
import { Empresa } from '../models/Empresa';
import { Usuario } from '../models/Usuario';
import { Producto } from '../models/Producto';
import { ProductoComponente } from '../models/ProductoComponente';
import { Metal } from '../models/Metal';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

// MetalPriceAPI response format
interface MetalPriceApiResponse {
  success: boolean;
  timestamp: number;
  base: string;
  rates: {
    EUR?: number;
    XAU?: number; // Gold
    XAG?: number; // Silver
    XPD?: number; // Palladium
    XPT?: number; // Platinum
  };
}

// Internal metal rates structure
interface MetalRates {
  XAU: number; // Gold
  XAG: number; // Silver 
  XPD: number; // Palladium
  XPT: number; // Platinum
  XRH: number; // Rhodium (estimated)
  EUR: number; // Euro exchange rate
  COP: number; // Colombian Peso (calculated)
}

// Price calculation result
interface PriceCalculation {
  productId: number;
  userId: number;
  breakdown: PriceBreakdown;
  validUntil: Date;
}

interface PriceBreakdown {
  metalComposition: MetalCompositionItem[];
  basePrice: number;
  companyAdjustments: CompanyAdjustments;
  finalPrice: number;
  currency: string;
  calculatedAt: Date;
}

interface MetalCompositionItem {
  metal: string;
  symbol: string;
  quantity: number;
  rate: number;
  subtotal: number;
}

interface CompanyAdjustments {
  paymentPercentage: number;
  rhPaymentPercentage: number;
  ptPaymentPercentage: number;
  operationalCosts: number;
  financialCosts: number;
}

// Cache for API responses to conserve API calls
interface RateCache {
  rates: MetalRates;
  timestamp: number;
  apiCallsUsed: number;
}

export class PricingService {
  private static rateCache: RateCache | null = null;

  /**
   * Calculate product price based on current metal rates and user's company settings
   */
  async calculateProductPrice(productId: number, userId: number): Promise<PriceCalculation> {
    try {
      // Get product with metal compositions
      const product = await Producto.findByPk(productId, {
        include: [
          {
            model: ProductoComponente,
            as: 'componentes',
            include: [
              {
                model: Metal,
                as: 'metal'
              }
            ]
          }
        ]
      });

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Get user with company information
      const user = await Usuario.findByPk(userId, {
        include: [
          {
            model: Empresa,
            as: 'empresa'
          }
        ]
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get current metal rates
      const rates = await this.getCurrentMetalRates();

      // Get current formula
      const formula = await this.getCurrentFormula();

      // Calculate base price from metal compositions
      let basePrice = 0;
      const metalBreakdown: PriceBreakdown['metalComposition'] = [];

      for (const composition of product.componentes || []) {
        const metalSymbol = composition.metal.simbolo;
        const metalRate = rates[metalSymbol as keyof MetalRates];
        
        if (!metalRate) {
          logger.warn(`No rate found for metal: ${metalSymbol}`);
          continue;
        }

        const quantity = parseFloat(composition.porcentaje.toString()) / 100; // Convert percentage to decimal
        const subtotal = quantity * metalRate;
        
        basePrice += subtotal;

        metalBreakdown.push({
          metal: composition.metal.nombre,
          symbol: metalSymbol,
          quantity,
          rate: metalRate,
          subtotal
        });
      }

      // Apply company-specific adjustments
      const company = user.empresa;
      const companyAdjustments = {
        paymentPercentage: company?.porcentajePago || 85, // Default 85%
        rhPaymentPercentage: company?.porcentajePago || 85,
        ptPaymentPercentage: company?.porcentajePago || 85,
        operationalCosts: company?.costos || 0,
        financialCosts: 0
      };

      // Apply formula calculations (similar to original Sitekol logic)
      let adjustedPrice = basePrice;
      
      // Apply payment percentage adjustments
      adjustedPrice = adjustedPrice * (companyAdjustments.paymentPercentage / 100);

      // Subtract operational costs
      const finalPrice = Math.max(0, adjustedPrice - companyAdjustments.operationalCosts);

      const breakdown: PriceBreakdown = {
        metalComposition: metalBreakdown,
        basePrice,
        companyAdjustments,
        finalPrice,
        currency: 'USD',
        calculatedAt: new Date()
      };

      return {
        productId,
        userId,
        breakdown,
        validUntil: new Date(Date.now() + 30 * 60 * 1000) // Valid for 30 minutes
      };

    } catch (error) {
      logger.error('Error calculating product price:', error);
      throw new Error('Failed to calculate product price');
    }
  }

  /**
   * Get current metal rates with aggressive caching to conserve API calls
   */
  async getCurrentMetalRates(): Promise<MetalRates> {
    try {
      // Check cache first
      if (PricingService.rateCache && this.isCacheValid(PricingService.rateCache.timestamp)) {
        logger.info('Using cached metal rates');
        return PricingService.rateCache.rates;
      }

      // Check database for recent rates
      const latestRates = await Tarifa.findOne({
        order: [['fechaActualizacion', 'DESC']]
      });

      if (latestRates && this.isRatesCurrent(latestRates.fechaActualizacion)) {
        const rates = this.convertDbRatesToMetalRates(latestRates);
        
        // Update cache
        PricingService.rateCache = {
          rates,
          timestamp: Date.now(),
          apiCallsUsed: PricingService.rateCache?.apiCallsUsed || 0
        };
        
        logger.info('Using database rates');
        return rates;
      }

      // Only fetch from API if we haven't exceeded the monthly limit
      if (PricingService.rateCache?.apiCallsUsed >= 90) { // Reserve 10 calls for emergencies
        logger.warn('API call limit nearly reached, using fallback rates');
        return this.getFallbackRates();
      }

      // Fetch from external API
      const externalRates = await this.fetchExternalRates();
      
      // Save new rates to database
      await this.saveRatesToDatabase(externalRates);

      // Update cache and API call counter
      PricingService.rateCache = {
        rates: externalRates,
        timestamp: Date.now(),
        apiCallsUsed: (PricingService.rateCache?.apiCallsUsed || 0) + 1
      };

      logger.info(`Fetched fresh rates from API (calls used: ${PricingService.rateCache.apiCallsUsed})`);
      return externalRates;
      
    } catch (error) {
      logger.error('Error getting metal rates:', error);
      return this.getFallbackRates();
    }
  }

  /**
   * Fetch metal rates from MetalPriceAPI
   */
  private async fetchExternalRates(): Promise<MetalRates> {
    try {
      const url = `${config.metalRates.apiUrl}?api_key=${config.metalRates.apiKey}&base=${config.metalRates.baseCurrency}&currencies=${config.metalRates.currencies}`;
      
      const response = await axios.get<MetalPriceApiResponse>(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'SITEKOL-Backend/1.0'
        }
      });

      const data = response.data;

      if (!data.success) {
        throw new Error('MetalPriceAPI request failed');
      }

      // Convert API response to our internal format
      const rates: MetalRates = {
        XAU: data.rates.XAU || 2000,      // Gold
        XAG: data.rates.XAG || 25,        // Silver
        XPD: data.rates.XPD || 1500,      // Palladium 
        XPT: data.rates.XPT || 1000,      // Platinum
        XRH: this.estimateRhodiumPrice(data.rates.XPT), // Rhodium (estimated from platinum)
        EUR: data.rates.EUR || 0.85,      // Euro exchange rate
        COP: 4000 // Colombian Peso (you might want to fetch this separately)
      };

      logger.info('Successfully fetched rates from MetalPriceAPI', {
        timestamp: data.timestamp,
        rates: Object.keys(rates).map(key => `${key}: ${rates[key as keyof MetalRates]}`)
      });

      return rates;
    } catch (error: any) {
      logger.error('Error fetching external rates:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(`Failed to fetch external metal rates: ${error.message}`);
    }
  }

  /**
   * Save metal rates to database
   */
  private async saveRatesToDatabase(rates: MetalRates): Promise<void> {
    try {
      await Tarifa.create({
        timestamp: Math.floor(Date.now() / 1000),
        date: new Date().toISOString().split('T')[0],
        xau: rates.AU,
        xpd: rates.PD,
        xpt: rates.PT,
        xrh: rates.RH,
        cop: 0, // COP rate if needed
        usd: 1   // USD base rate
      });

      logger.info('Metal rates saved to database');
    } catch (error) {
      logger.error('Error saving rates to database:', error);
    }
  }

  /**
   * Check if rates are current (less than 1 hour old)
   */
  private isRatesCurrent(timestamp: number): boolean {
    const oneHourAgo = Math.floor(Date.now() / 1000) - (60 * 60);
    return timestamp > oneHourAgo;
  }

  /**
   * Get current pricing formula
   */
  async getCurrentFormula(): Promise<Formula> {
    const formula = await Formula.findOne({
      order: [['id', 'DESC']]
    });

    if (!formula) {
      // Create default formula if none exists
      return await Formula.create({
        a: 1.0,
        b: 0.0,
        c: 0.0,
        cop: 4000 // Default COP exchange rate
      });
    }

    return formula;
  }

  /**
   * Convert price to different currency
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // For now, implement basic USD-COP conversion
    // In production, you would use a proper exchange rate API
    if (fromCurrency === 'USD' && toCurrency === 'COP') {
      const formula = await this.getCurrentFormula();
      return amount * formula.cop;
    }

    if (fromCurrency === 'COP' && toCurrency === 'USD') {
      const formula = await this.getCurrentFormula();
      return amount / formula.cop;
    }

    throw new Error(`Currency conversion from ${fromCurrency} to ${toCurrency} not supported`);
  }

  /**
   * Check if cache is still valid (30 minutes)
   */
  private isCacheValid(timestamp: number): boolean {
    const thirtyMinutesAgo = Date.now() - (config.metalRates.cacheExpiry * 1000);
    return timestamp > thirtyMinutesAgo;
  }

  /**
   * Check if database rates are current (2 hours)
   */
  private isRatesCurrent(dateTime: Date): boolean {
    const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
    return dateTime > twoHoursAgo;
  }

  /**
   * Convert database rates to MetalRates format
   */
  private convertDbRatesToMetalRates(tarifa: any): MetalRates {
    return {
      XAU: tarifa.xau || 2000,
      XAG: tarifa.xag || 25,
      XPD: tarifa.xpd || 1500,
      XPT: tarifa.xpt || 1000,
      XRH: tarifa.xrh || 5000,
      EUR: tarifa.eur || 0.85,
      COP: tarifa.cop || 4000
    };
  }

  /**
   * Get fallback rates when API is unavailable
   */
  private async getFallbackRates(): Promise<MetalRates> {
    // Try to get last known rates from database
    const lastRates = await Tarifa.findOne({
      order: [['fechaActualizacion', 'DESC']]
    });

    if (lastRates) {
      logger.warn('Using last known rates from database as fallback');
      return this.convertDbRatesToMetalRates(lastRates);
    }

    // Use hardcoded fallback rates
    logger.warn('Using hardcoded fallback rates');
    return {
      XAU: 2000, // Gold
      XAG: 25,   // Silver
      XPD: 1500, // Palladium
      XPT: 1000, // Platinum
      XRH: 5000, // Rhodium
      EUR: 0.85, // Euro
      COP: 4000  // Colombian Peso
    };
  }

  /**
   * Estimate rhodium price based on platinum (rhodium typically 3-5x platinum)
   */
  private estimateRhodiumPrice(platinumPrice?: number): number {
    const ptPrice = platinumPrice || 1000;
    return ptPrice * 4.5; // Rough estimation
  }

  /**
   * Save metal rates to database with current timestamp
   */
  private async saveRatesToDatabase(rates: MetalRates): Promise<void> {
    try {
      await Tarifa.create({
        xau: rates.XAU,
        xag: rates.XAG,
        xpd: rates.XPD,
        xpt: rates.XPT,
        xrh: rates.XRH,
        eur: rates.EUR,
        cop: rates.COP,
        fechaActualizacion: new Date()
      });

      logger.info('Metal rates saved to database successfully');
    } catch (error) {
      logger.error('Error saving rates to database:', error);
    }
  }

  /**
   * Force refresh rates from API (admin only)
   */
  async forceRefreshRates(): Promise<MetalRates> {
    try {
      logger.info('Force refreshing metal rates from API');
      
      const externalRates = await this.fetchExternalRates();
      await this.saveRatesToDatabase(externalRates);

      // Update cache
      PricingService.rateCache = {
        rates: externalRates,
        timestamp: Date.now(),
        apiCallsUsed: (PricingService.rateCache?.apiCallsUsed || 0) + 1
      };

      return externalRates;
    } catch (error) {
      logger.error('Error force refreshing rates:', error);
      throw new Error('Failed to refresh metal rates');
    }
  }

  /**
   * Get API usage statistics
   */
  getApiUsageStats(): { callsUsed: number; callsRemaining: number; cacheAge: number } {
    const callsUsed = PricingService.rateCache?.apiCallsUsed || 0;
    const cacheAge = PricingService.rateCache ? Date.now() - PricingService.rateCache.timestamp : 0;
    
    return {
      callsUsed,
      callsRemaining: Math.max(0, 100 - callsUsed),
      cacheAge: Math.floor(cacheAge / 1000) // in seconds
    };
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(productId: number, days: number = 30): Promise<any[]> {
    // This would query historical price data
    // Implementation depends on how you want to store price history
    return [];
  }
}
