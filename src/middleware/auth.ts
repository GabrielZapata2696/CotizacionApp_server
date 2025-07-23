import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { Usuario } from '@/models/Usuario';
import { ApiResponse } from '@/types/ApiResponse';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  userId: number;
  userRole: number;
  user?: Usuario;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Token de acceso requerido',
      };
      res.status(401).json(response);
      return;
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido o expirado',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user still exists and is active
    const user = await Usuario.findOne({
      where: { 
        id: decoded.userId, 
        estado: 1 
      },
      include: ['company']
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado o inactivo',
      };
      res.status(401).json(response);
      return;
    }

    // Add user info to request object
    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).userRole = user.rol;
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error de autenticación',
    };
    res.status(500).json(response);
  }
};

// Role-based authorization middleware
export const authorize = (...roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as AuthenticatedRequest).userRole;

    if (!roles.includes(userRole)) {
      const response: ApiResponse = {
        success: false,
        message: 'Acceso denegado: permisos insuficientes',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await Usuario.findOne({
        where: { 
          id: decoded.userId, 
          estado: 1 
        }
      });

      if (user) {
        (req as AuthenticatedRequest).userId = user.id;
        (req as AuthenticatedRequest).userRole = user.rol;
        (req as AuthenticatedRequest).user = user;
      }
    } catch (error) {
      // Token invalid, but we continue without authentication
      logger.debug('Optional auth token invalid:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next();
  }
};
