import { Request, Response } from 'express';
import { Empresa } from '@/models/Empresa';
import { Usuario } from '@/models/Usuario';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/ApiResponse';

export class CompanyController {
  /**
   * Get all companies (admin only)
   * GET /api/companies
   */
  public async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.rol;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden ver todas las empresas'
        } as ApiResponse<null>);
        return;
      }

      const companies = await Empresa.findAll({
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'rol', 'fechaCreacion']
        }],
        order: [['fechaCreacion', 'DESC']]
      });

      res.json({
        success: true,
        message: 'Empresas obtenidas correctamente',
        data: companies
      } as ApiResponse<typeof companies>);

    } catch (error) {
      logger.error('Error al obtener empresas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Get company by ID
   * GET /api/companies/:id
   */
  public async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.rol;
      const userCompanyId = (req as any).user?.empresaId;

      // Check permissions
      const requestedCompanyId = parseInt(id);
      if (userRole !== 'admin' && userCompanyId !== requestedCompanyId) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo puedes ver tu propia empresa'
        } as ApiResponse<null>);
        return;
      }

      const company = await Empresa.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'rol', 'fechaCreacion', 'fechaUltimaActividad']
        }]
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Empresa obtenida correctamente',
        data: company
      } as ApiResponse<typeof company>);

    } catch (error) {
      logger.error('Error al obtener empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Create new company
   * POST /api/companies
   */
  public async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.rol;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden crear empresas'
        } as ApiResponse<null>);
        return;
      }

      const {
        nombre,
        tipo,
        pais,
        porcentajePago,
        costos,
        contactoPrincipal,
        telefono,
        direccion
      } = req.body;

      if (!nombre || !tipo || !pais) {
        res.status(400).json({
          success: false,
          message: 'Nombre, tipo y país son campos requeridos'
        } as ApiResponse<null>);
        return;
      }

      // Check if company name already exists
      const existingCompany = await Empresa.findOne({ where: { nombre } });
      if (existingCompany) {
        res.status(409).json({
          success: false,
          message: 'Ya existe una empresa con ese nombre'
        } as ApiResponse<null>);
        return;
      }

      const company = await Empresa.create({
        nombre,
        tipo: tipo || 'basico',
        pais,
        porcentajePago: porcentajePago || 0,
        costos: costos || 0,
        contactoPrincipal,
        telefono,
        direccion,
        fechaCreacion: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Empresa creada correctamente',
        data: company
      } as ApiResponse<typeof company>);

    } catch (error) {
      logger.error('Error al crear empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Update company
   * PUT /api/companies/:id
   */
  public async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.rol;
      const userCompanyId = (req as any).user?.empresaId;

      // Check permissions
      const companyId = parseInt(id);
      if (userRole !== 'admin' && userCompanyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores o miembros de la empresa pueden editarla'
        } as ApiResponse<null>);
        return;
      }

      const company = await Empresa.findByPk(id);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        } as ApiResponse<null>);
        return;
      }

      const {
        nombre,
        tipo,
        pais,
        porcentajePago,
        costos,
        contactoPrincipal,
        telefono,
        direccion
      } = req.body;

      // Check if new name conflicts with existing company
      if (nombre && nombre !== company.nombre) {
        const existingCompany = await Empresa.findOne({ where: { nombre } });
        if (existingCompany) {
          res.status(409).json({
            success: false,
            message: 'Ya existe una empresa con ese nombre'
          } as ApiResponse<null>);
          return;
        }
      }

      // Non-admin users can only update certain fields
      const allowedUpdates: any = {};
      if (userRole === 'admin') {
        // Admin can update everything
        Object.assign(allowedUpdates, {
          nombre,
          tipo,
          pais,
          porcentajePago,
          costos,
          contactoPrincipal,
          telefono,
          direccion
        });
      } else {
        // Regular users can only update contact info
        Object.assign(allowedUpdates, {
          contactoPrincipal,
          telefono,
          direccion
        });
      }

      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] === undefined) {
          delete allowedUpdates[key];
        }
      });

      const updatedCompany = await company.update(allowedUpdates);

      res.json({
        success: true,
        message: 'Empresa actualizada correctamente',
        data: updatedCompany
      } as ApiResponse<typeof updatedCompany>);

    } catch (error) {
      logger.error('Error al actualizar empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Get company payment settings
   * GET /api/companies/:id/payment-settings
   */
  public async getPaymentSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.rol;
      const userCompanyId = (req as any).user?.empresaId;

      // Check permissions
      const companyId = parseInt(id);
      if (userRole !== 'admin' && userCompanyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        } as ApiResponse<null>);
        return;
      }

      const company = await Empresa.findByPk(id, {
        attributes: ['id', 'nombre', 'porcentajePago', 'costos', 'tipo']
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        } as ApiResponse<null>);
        return;
      }

      const paymentSettings = {
        companyId: company.id,
        companyName: company.nombre,
        porcentajePago: company.porcentajePago,
        costos: company.costos,
        tipo: company.tipo,
        currency: 'USD' // Default currency
      };

      res.json({
        success: true,
        message: 'Configuración de pago obtenida correctamente',
        data: paymentSettings
      } as ApiResponse<typeof paymentSettings>);

    } catch (error) {
      logger.error('Error al obtener configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Update company payment settings (admin only)
   * PUT /api/companies/:id/payment-settings
   */
  public async updatePaymentSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.rol;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden modificar configuraciones de pago'
        } as ApiResponse<null>);
        return;
      }

      const company = await Empresa.findByPk(id);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        } as ApiResponse<null>);
        return;
      }

      const { porcentajePago, costos } = req.body;

      // Validate payment percentage
      if (porcentajePago !== undefined && (porcentajePago < 0 || porcentajePago > 100)) {
        res.status(400).json({
          success: false,
          message: 'El porcentaje de pago debe estar entre 0 y 100'
        } as ApiResponse<null>);
        return;
      }

      // Validate costs
      if (costos !== undefined && costos < 0) {
        res.status(400).json({
          success: false,
          message: 'Los costos no pueden ser negativos'
        } as ApiResponse<null>);
        return;
      }

      const updatedCompany = await company.update({
        porcentajePago: porcentajePago !== undefined ? porcentajePago : company.porcentajePago,
        costos: costos !== undefined ? costos : company.costos
      });

      res.json({
        success: true,
        message: 'Configuración de pago actualizada correctamente',
        data: {
          companyId: updatedCompany.id,
          companyName: updatedCompany.nombre,
          porcentajePago: updatedCompany.porcentajePago,
          costos: updatedCompany.costos
        }
      } as ApiResponse<{
        companyId: number;
        companyName: string;
        porcentajePago: number;
        costos: number;
      }>);

    } catch (error) {
      logger.error('Error al actualizar configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Get company statistics (admin only)
   * GET /api/companies/stats
   */
  public async getCompanyStats(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.rol;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden ver estadísticas'
        } as ApiResponse<null>);
        return;
      }

      // Get total companies count
      const totalCompanies = await Empresa.count();
      
      // Get companies by type
      const companiesByType = await Empresa.findAll({
        attributes: ['tipo', [Empresa.sequelize!.fn('COUNT', '*'), 'count']],
        group: ['tipo'],
        raw: true
      }) as { tipo: string; count: number }[];

      // Get total users per company
      const usersPerCompany = await Empresa.findAll({
        attributes: ['id', 'nombre', [Empresa.sequelize!.fn('COUNT', Usuario.sequelize!.col('usuarios.id')), 'userCount']],
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: []
        }],
        group: ['Empresa.id', 'Empresa.nombre'],
        raw: true
      }) as { id: number; nombre: string; userCount: number }[];

      const stats = {
        totalCompanies,
        companiesByType: companiesByType.reduce((acc, item) => {
          acc[item.tipo] = parseInt(item.count.toString());
          return acc;
        }, {} as { [key: string]: number }),
        usersPerCompany: usersPerCompany.map(item => ({
          companyId: item.id,
          companyName: item.nombre,
          userCount: parseInt(item.userCount.toString())
        }))
      };

      res.json({
        success: true,
        message: 'Estadísticas de empresas obtenidas correctamente',
        data: stats
      } as ApiResponse<typeof stats>);

    } catch (error) {
      logger.error('Error al obtener estadísticas de empresas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }
}
