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

// Exact Sitekol interfaces matching frontend
interface ComponentePrecio {
  id_metal: number;
  metal: string;
  cantidad: number;
  unidad: string;
  valor: number;
}

interface SitekolCalculoPrecio {
  componentes: ComponentePrecio[];
  cargos: number;
  neto: number;
  total: number;
  ppmTotal: number;
  valorUSD: number;
  moneda: string;
  valErroneo: boolean;
}

interface SitekolTarifas {
  XPD: number; // Palladium
  XPT: number; // Platinum  
  XRH: number; // Rhodium
  COP: number; // Colombian Peso exchange rate
}

interface SitekolFormula {
  a: number; // Rhodium discount
  b: number; // Palladium discount
  c: number; // Platinum discount
  cop: number; // COP adjustment
}

interface SitekolEmpresa {
  porcentaje_pago: number; // Palladium payment percentage (default: 0.8)
  porcentaje_pago_pt: number; // Platinum payment percentage (default: 0.7)
  porcentaje_pago_rh: number; // Rhodium payment percentage (default: 0.6)
  gastos_operativos: number; // Operational costs (default: 7)
  gastos_financieros: number; // Financial costs (default: 0.03)
}

export class SitekolPricingService {

  /**
   * EXACT Sitekol pricing calculation matching frontend logic
   * From producto.page.ts calcularPrecios() method
   */
  async calcularPrecioProducto(idProducto: number, idUsuario: number): Promise<SitekolCalculoPrecio> {
    try {
      // Get components for the product
      const componentes = await this.obtenerComponentesXProducto(idProducto);
      if (!componentes.length) {
        throw new Error(`No components found for product ${idProducto}`);
      }

      // Get current rates (tarifas)
      const tarifas = await this.obtenerTarifas();
      
      // Get current formula
      const formula = await this.obtenerFormula();
      
      // Get user and company data
      const usuario = await Usuario.findByPk(idUsuario, {
        include: [{ model: Empresa, as: 'empresa' }]
      });
      
      if (!usuario || !usuario.empresa) {
        throw new Error(`User or company not found for user ${idUsuario}`);
      }

      const empresa = usuario.empresa as any as SitekolEmpresa;

      // Initialize calculation variables (exact frontend names)
      let cargos = 0;
      let neto = 0;
      let ppmTotal = 0;
      let total = 0;
      let valorUSD = '';
      let valErroneo = false;

      // Process each component (EXACT frontend logic)
      componentes.forEach(componente => {
        let valInicial: number; // valor en dolares de una onza del metal
        let valorComponente: number;
        const xrh: number = +tarifas.XRH; // valor rodio del mercado al dia de la consulta
        const xpt: number = +tarifas.XPT; // valor platino del mercado al dia de la consulta
        const xpd: number = +tarifas.XPD; // valor paladio del mercado al dia de la consulta

        if (componente.metal.toString() === 'RODIO') {
          valInicial = 0;
          valorComponente = 0;
          valInicial = xrh - (+formula.a); // descuento del rodio
          
          valorComponente = (valInicial / 31.1) * (Number(componente.cantidad) / 1000) * +empresa.porcentaje_pago_rh;
          
          componente.valor = valorComponente * (tarifas.COP - formula.cop);
          cargos = Number(+cargos) + (+valorComponente);
          ppmTotal = Number(+ppmTotal) + (+componente.cantidad);

        } else if (componente.metal.toString() === 'PLATINO') {
          valInicial = 0;
          valorComponente = 0;
          valInicial = xpt - (+formula.c); // descuento del platino
          valorComponente = (valInicial / 31.1) * (Number(+componente.cantidad) / 1000) * +empresa.porcentaje_pago_pt;
          componente.valor = valorComponente * (tarifas.COP - formula.cop);
          cargos = Number(cargos) + valorComponente;
          ppmTotal = Number(ppmTotal) + Number(+componente.cantidad);

        } else if (componente.metal.toString() === 'PALADIO') {
          valInicial = 0;
          valorComponente = 0;
          valInicial = xpd - (+formula.b); // descuento del paladio
          valorComponente = (valInicial / 31.1) * (Number(+componente.cantidad) / 1000) * +empresa.porcentaje_pago;
          componente.valor = (+valorComponente) * (+tarifas.COP - (+formula.cop));
          cargos = Number(+cargos) + (+valorComponente);
          ppmTotal = Number(+ppmTotal) + Number(+componente.cantidad);
        }
      });

      // Apply company costs (EXACT frontend logic)
      const valPrevCargos: number = +empresa.gastos_operativos + (+cargos * +empresa.gastos_financieros);
      
      neto = (+cargos) - (+valPrevCargos);
      valorUSD = neto.toString();
      total = (+neto) * (+tarifas.COP - (+formula.cop));

      // Get product weight for final calculation
      const producto = await Producto.findByPk(idProducto);
      if (!producto) {
        throw new Error(`Product ${idProducto} not found`);
      }

      // Apply country-specific logic
      let moneda = 'COP';
      let mostrarValor = false;
      let mostrarValorCOP = true;

      if (usuario.pais?.toString() === 'COL') {
        total = total * (+producto.peso / 1000);
        
        if (total < 0) {
          valErroneo = true;
          mostrarValor = false;
          mostrarValorCOP = false;
        } else {
          mostrarValor = false;
          mostrarValorCOP = true;
        }
      } else {
        moneda = 'USD';
        valorUSD = (+valorUSD * (producto.peso / 1000)).toString();
        if ((+valorUSD * (producto.peso / 1000)) < 0) {
          valErroneo = true;
          mostrarValor = false;
          mostrarValorCOP = false;
        } else {
          mostrarValor = true;
          mostrarValorCOP = false;
        }
      }

      return {
        componentes,
        cargos,
        neto,
        total,
        ppmTotal,
        valorUSD: parseFloat(valorUSD),
        moneda,
        valErroneo
      };

    } catch (error) {
      logger.error('Error calculating Sitekol product price:', error);
      throw new Error('Failed to calculate product price');
    }
  }

  /**
   * Get components for a product (matching frontend)
   */
  private async obtenerComponentesXProducto(idProducto: number): Promise<ComponentePrecio[]> {
    const components = await ProductoComponente.findAll({
      where: { id_producto: idProducto },
      include: [{
        model: Metal,
        as: 'metal',
        where: { estado: 1 } // Only active metals
      }]
    });

    return components.map(comp => ({
      id_metal: comp.id_metal,
      metal: (comp as any).metal.metal,
      cantidad: parseFloat(comp.cantidad.toString()),
      unidad: (comp as any).metal.unidad,
      valor: 0 // Will be calculated
    }));
  }

  /**
   * Get current rates (matching frontend obtenerTarifas)
   */
  async obtenerTarifas(): Promise<SitekolTarifas> {
    const tarifa = await Tarifa.getLatest();
    
    if (!tarifa) {
      // Fetch from external API if no rates in database
      await this.actualizarTarifas();
      const newTarifa = await Tarifa.getLatest();
      
      if (!newTarifa) {
        throw new Error('Unable to get metal rates');
      }
      
      return {
        XPD: parseFloat(newTarifa.xpd.toString()),
        XPT: parseFloat(newTarifa.xpt.toString()),
        XRH: parseFloat(newTarifa.xrh.toString()),
        COP: parseFloat(newTarifa.cop.toString())
      };
    }

    return {
      XPD: parseFloat(tarifa.xpd.toString()),
      XPT: parseFloat(tarifa.xpt.toString()),  
      XRH: parseFloat(tarifa.xrh.toString()),
      COP: parseFloat(tarifa.cop.toString())
    };
  }

  /**
   * Get current formula (matching frontend obtenerFormula)
   */
  async obtenerFormula(): Promise<SitekolFormula> {
    const formula = await Formula.getCurrent();
    
    if (!formula) {
      // Create default formula
      const newFormula = await Formula.createOrUpdate({
        a: 0, // Default Rhodium discount
        b: 0, // Default Palladium discount  
        c: 0, // Default Platinum discount
        cop: 4000 // Default COP rate
      });
      
      return {
        a: parseFloat(newFormula.a.toString()),
        b: parseFloat(newFormula.b.toString()),
        c: parseFloat(newFormula.c.toString()),
        cop: parseFloat(newFormula.cop.toString())
      };
    }

    return {
      a: parseFloat(formula.a.toString()),
      b: parseFloat(formula.b.toString()),
      c: parseFloat(formula.c.toString()),
      cop: parseFloat(formula.cop.toString())
    };
  }

  /**
   * Update metal rates from external API
   */
  async actualizarTarifas(): Promise<void> {
    try {
      if (!config.metalRates.apiKey) {
        logger.warn('No metals API key configured, using fallback rates');
        // Create fallback rates
        await Tarifa.create({
          timestamp: Math.floor(Date.now() / 1000),
          date: new Date().toISOString().split('T')[0],
          cop: 4000,
          usd: 1,
          xpd: 1500, // Default Palladium price
          xpt: 1000, // Default Platinum price  
          xrh: 5000, // Default Rhodium price
          unit: 'USD'
        });
        return;
      }

      const response = await axios.get(config.metalRates.apiUrl, {
        headers: {
          'Authorization': `Bearer ${config.metalRates.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const data = response.data;
      
      // Save new rates to database
      await Tarifa.create({
        timestamp: Math.floor(Date.now() / 1000),
        date: new Date().toISOString().split('T')[0],
        cop: parseFloat(data.COP) || 4000,
        usd: 1,
        xpd: parseFloat(data.XPD) || 1500,
        xpt: parseFloat(data.XPT) || 1000,
        xrh: parseFloat(data.XRH) || 5000,
        unit: 'USD'
      });

      logger.info('Metal rates updated from external API');
    } catch (error) {
      logger.error('Error updating metal rates:', error);
      throw new Error('Failed to update metal rates');
    }
  }

  /**
   * Create quotation (matching frontend cotizar method)
   */
  async crearCotizacion(idUsuario: number, idProducto: number, valorCotizado: number, moneda: string): Promise<any> {
    try {
      const fecha = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
      
      // This would call your quotation creation logic
      const cotizacionData = {
        id_usuario: idUsuario,
        id_producto: idProducto,
        valor_cotizado: valorCotizado,
        moneda,
        fecha,
        estado: 1
      };

      // Save quotation to database (implementation depends on your Cotizacion model)
      logger.info('Quotation created:', cotizacionData);
      
      return cotizacionData;
    } catch (error) {
      logger.error('Error creating quotation:', error);
      throw new Error('Failed to create quotation');
    }
  }
}
