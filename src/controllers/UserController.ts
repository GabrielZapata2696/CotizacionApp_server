import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '@/models/Usuario';
import { Empresa } from '@/models/Empresa';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/ApiResponse';

export class UserController {
  /**
   * Get user profile
   * GET /api/users/profile
   */
  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse<null>);
        return;
      }

      const user = await Usuario.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre', 'tipo', 'pais', 'porcentajePago', 'costos']
        }]
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Perfil de usuario obtenido correctamente',
        data: user
      } as ApiResponse<typeof user>);

    } catch (error) {
      logger.error('Error al obtener perfil de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  public async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { nombre, email, telefono } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse<null>);
        return;
      }

      const user = await Usuario.findByPk(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse<null>);
        return;
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'El email ya está en uso por otro usuario'
          } as ApiResponse<null>);
          return;
        }
      }

      // Update user fields
      await user.update({
        nombre: nombre || user.nombre,
        email: email || user.email,
        telefono: telefono || user.telefono
      });

      const updatedUser = await Usuario.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre', 'tipo', 'pais']
        }]
      });

      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updatedUser
      } as ApiResponse<typeof updatedUser>);

    } catch (error) {
      logger.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Change user password
   * POST /api/users/change-password
   */
  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse<null>);
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        } as ApiResponse<null>);
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres'
        } as ApiResponse<null>);
        return;
      }

      const user = await Usuario.findByPk(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse<null>);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        } as ApiResponse<null>);
        return;
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedNewPassword });

      res.json({
        success: true,
        message: 'Contraseña cambiada correctamente'
      } as ApiResponse<null>);

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Get user query limits and usage
   * GET /api/users/query-limits
   */
  public async getQueryLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse<null>);
        return;
      }

      const user = await Usuario.findByPk(userId, {
        attributes: ['id', 'rol', 'consultasSemana', 'fechaUltimaConsulta'],
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre', 'tipo']
        }]
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse<null>);
        return;
      }

      const now = new Date();
      const weekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      // Reset weekly counter if needed
      if (user.fechaUltimaConsulta && user.fechaUltimaConsulta < weekStart) {
        await user.update({ 
          consultasSemana: 0,
          fechaUltimaConsulta: now
        });
        user.consultasSemana = 0;
      }

      // Determine limits based on user role and company type
      let weeklyLimit = 50; // Default limit
      if (user.empresa?.tipo === 'premium' || user.rol === 'admin') {
        weeklyLimit = 100;
      }

      const queryInfo = {
        weeklyUsed: user.consultasSemana,
        weeklyLimit,
        remaining: weeklyLimit - user.consultasSemana,
        resetDate: new Date(now.getTime() + ((7 - now.getDay()) * 24 * 60 * 60 * 1000))
      };

      res.json({
        success: true,
        message: 'Límites de consulta obtenidos correctamente',
        data: queryInfo
      } as ApiResponse<typeof queryInfo>);

    } catch (error) {
      logger.error('Error al obtener límites de consulta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }

  /**
   * Update user preferences
   * PUT /api/users/preferences
   */
  public async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currency, language, notifications } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse<null>);
        return;
      }

      const user = await Usuario.findByPk(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse<null>);
        return;
      }

      // Update user preferences
      const preferences = {
        currency: currency || 'USD',
        language: language || 'es',
        notifications: notifications || true
      };

      await user.update({ preferencias: JSON.stringify(preferences) });

      res.json({
        success: true,
        message: 'Preferencias actualizadas correctamente',
        data: preferences
      } as ApiResponse<typeof preferences>);

    } catch (error) {
      logger.error('Error al actualizar preferencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse<null>);
    }
  }
}
